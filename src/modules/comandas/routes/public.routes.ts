import { Router } from 'express'
import { PostgresComandaRepository } from '../repositories/PostgresComandaRepository'
import { PostgresNotificationRepository } from '../../notifications/repositories/PostgresNotificationRepository'
import { socketManager } from '../../../infra/websocket/SocketManager'
import { Comanda } from '../entities/Comanda'
import { Pedido } from '../entities/Pedido'

export const publicComandaRoutes = Router()
const repository = new PostgresComandaRepository()
const notificationRepository = new PostgresNotificationRepository()

// Criar nova comanda ou adicionar pedido a uma existente (Pedido da Mesa) - Público
publicComandaRoutes.post('/', async (req, res) => {
    const { tenantId, mesaId, whatsapp, clienteNome, itens } = req.body

    if (!tenantId || !mesaId) {
        return res.status(400).json({ message: 'tenantId e mesaId são obrigatórios' })
    }

    // 1. Tentar encontrar comanda aberta pelo whatsapp na mesma mesa
    let comanda: any = null
    if (whatsapp) {
        comanda = await repository.findByOpenComanda(tenantId, whatsapp, mesaId)
    }

    // 2. Se não encontrou, cria uma nova
    if (!comanda) {
        const comandaEntity = Comanda.create({
            tenantId,
            mesaId,
            clienteNome,
            whatsapp,
            status: 'ABERTA'
        })
        comanda = await repository.create(comandaEntity)
    }

    // 3. Criar o Pedido
    const pedido = Pedido.create({
        tenantId,
        comandaId: comanda.uuid
    })
    const createdPedido = await repository.createPedido(pedido.toJSON())

    // 4. Adicionar itens ao pedido
    if (itens && Array.isArray(itens)) {
        await repository.addItemsToPedido(tenantId, createdPedido.uuid, comanda.uuid, itens.map(item => ({
            ...item,
            createdBy: undefined
        })))
    }

    const finalComanda = await repository.findById(tenantId, comanda.uuid)

    console.log(`[PublicOrder] Pedido criado: #${createdPedido.seq_id} para Comanda: ${comanda.uuid}`)

    // Criar Notificação para o ERP
    try {
        console.log(`[Notification] Tentando criar notificação para tenant: ${tenantId}`)
        const notification = await notificationRepository.create({
            tenantId,
            titulo: 'Novo Pedido Recebido',
            mensagem: `Pedido #${createdPedido.seq_id} de ${clienteNome || 'Cliente'} para a mesa ${finalComanda?.mesaNumero || ''}`,
            tipo: 'novo_pedido',
            dataId: comanda.uuid,
            link: `/restaurante/comandas?id=${comanda.uuid}`
        })

        console.log(`[Notification] Notificação criada: ${notification.uuid}. Emitindo via Socket...`)
        socketManager.emitToTenant(tenantId, 'nova_notificacao', notification)
        socketManager.emitToTenant(tenantId, 'atualizar_kds', { type: 'novo_pedido', pedidoId: createdPedido.uuid })
        socketManager.emitToTenant(tenantId, 'atualizar_comandas', { type: 'novo_pedido', comandaId: comanda.uuid })
        socketManager.emitToTenant(tenantId, 'atualizar_mesas', { type: 'novo_pedido', mesaId: mesaId })
    } catch (err) {
        console.error('[Notification] Erro ao disparar notificação:', err)
    }

    return res.status(201).json({
        comanda: finalComanda,
        pedidoId: createdPedido.uuid,
        pedidoSeqId: createdPedido.seq_id
    })
})

publicComandaRoutes.get('/meus-pedidos', async (req, res) => {
    const { tenantId, whatsapp } = req.query
    if (!tenantId || !whatsapp) {
        return res.status(400).json({ message: 'tenantId e whatsapp são obrigatórios' })
    }
    const pedidos = await repository.findMyOpenPedidos(tenantId as string, whatsapp as string)
    return res.json(pedidos)
})

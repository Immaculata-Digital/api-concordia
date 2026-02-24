import { Router } from 'express'
import { PostgresComandaRepository } from '../repositories/PostgresComandaRepository'
import { PostgresNotificationRepository } from '../../notifications/repositories/PostgresNotificationRepository'
import { socketManager } from '../../../infra/websocket/SocketManager'
import { Comanda } from '../entities/Comanda'

export const publicComandaRoutes = Router()
const repository = new PostgresComandaRepository()
const notificationRepository = new PostgresNotificationRepository()

// Criar nova comanda (Pedido da Mesa) - Público
publicComandaRoutes.post('/', async (req, res) => {
    const { tenantId, mesaId, itens } = req.body

    if (!tenantId || !mesaId) {
        return res.status(400).json({ message: 'tenantId e mesaId são obrigatórios' })
    }

    // Cria a comanda com status 'aberta' ou 'pendente_pagamento'
    const comanda = Comanda.create({
        tenantId,
        mesaId,
        status: 'aberta',
        createdBy: null, // Identificador para pedidos via QR Code
        updatedBy: null,
        ...req.body
    })

    const created = await repository.create(comanda)

    // Se enviou itens, adiciona-os (precisamos garantir que o repository aceite isso ou fazer um loop)
    if (itens && Array.isArray(itens)) {
        for (const item of itens) {
            await repository.addItem(tenantId, {
                ...item,
                comandaId: created.uuid,
                tenantId,
                createdBy: null
            })
        }
    }

    const finalComanda = await repository.findById(tenantId, created.uuid)

    // Criar Notificação para o ERP
    try {
        const notification = await notificationRepository.create({
            tenantId,
            titulo: 'Novo Pedido Recebido',
            mensagem: `Novo pedido de ${req.body.clienteNome || 'Cliente'} para a mesa ${finalComanda?.mesaNumero || ''}`,
            tipo: 'novo_pedido',
            dataId: created.uuid,
            link: `/pedidos/comandas?id=${created.uuid}`
        })

        // Emitir via WebSocket para todos os usuários logados do tenant
        socketManager.emitToTenant(tenantId, 'nova_notificacao', notification)
    } catch (err) {
        console.error('[Notification] Erro ao disparar notificação:', err)
    }

    return res.status(201).json(finalComanda)
})

import { Router } from 'express'
import { PostgresComandaRepository } from '../repositories/PostgresComandaRepository'
import { Comanda } from '../entities/Comanda'
import { authenticate } from '../../../core/middlewares/authenticate'

export const comandaRoutes = Router()
const repository = new PostgresComandaRepository()

comandaRoutes.get('/', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const { status, mesaId } = req.query
    const comandas = await repository.findAll(tenantId, {
        status: status as string,
        mesaId: mesaId as string
    })
    return res.json(comandas)
})

comandaRoutes.get('/restaurante/historico', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const pedidos = await repository.findPedidosHistorico(tenantId)
    return res.json(pedidos)
})

comandaRoutes.get('/restaurante/kds', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const pedidos = await repository.findPedidosKDS(tenantId)
    return res.json(pedidos)
})

comandaRoutes.patch('/restaurante/:id/status', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const { status } = req.body
    await repository.updatePedidoStatus(tenantId, req.params.id as string, status, req.user!.uuid)
    return res.json({ message: 'Status atualizado com sucesso' })
})

comandaRoutes.get('/:id', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const comanda = await repository.findById(tenantId, req.params.id as string)
    if (!comanda) return res.status(404).json({ message: 'Comanda não encontrada' })
    return res.json(comanda)
})

comandaRoutes.post('/', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const comanda = Comanda.create({
        ...req.body,
        tenantId,
        createdBy: req.user!.uuid,
        updatedBy: req.user!.uuid
    })
    const created = await repository.create(comanda)
    return res.status(201).json(created)
})

comandaRoutes.post('/:id/itens', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.addItem(tenantId, {
        ...req.body,
        comandaId: req.params.id,
        tenantId,
        createdBy: req.user!.uuid
    })
    const updated = await repository.findById(tenantId, req.params.id as string)
    return res.status(201).json(updated)
})

comandaRoutes.patch('/:id/status', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const { status } = req.body
    await repository.updateStatus(tenantId, req.params.id as string, status, req.user!.uuid)
    const updated = await repository.findById(tenantId, req.params.id as string)
    return res.json(updated)
})

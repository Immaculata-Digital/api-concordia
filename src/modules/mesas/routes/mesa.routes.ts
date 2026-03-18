import { Router } from 'express'
import { PostgresMesaRepository } from '../repositories/PostgresMesaRepository'
import { Mesa } from '../entities/Mesa'
import { authenticate } from '../../../core/middlewares/authenticate'
import { socketManager } from '../../../infra/websocket/SocketManager'

export const mesaRoutes = Router()
const repository = new PostgresMesaRepository()

mesaRoutes.get('/', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const mesas = await repository.findAll(tenantId)
    return res.json(mesas)
})

mesaRoutes.get('/:id', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const mesa = await repository.findById(tenantId, req.params.id as string)
    if (!mesa) return res.status(404).json({ message: 'Mesa não encontrada' })
    return res.json(mesa)
})

mesaRoutes.post('/', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const mesa = Mesa.create({
        ...req.body,
        tenantId,
        createdBy: req.user!.uuid,
        updatedBy: req.user!.uuid
    })
    try {
        const created = await repository.create(mesa)
        socketManager.emitToTenant(tenantId, 'atualizar_mesas', { type: 'mesa_criada' })
        return res.status(201).json(created)
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Número de mesa já cadastrado' })
        }
        throw error
    }
})

mesaRoutes.put('/:id', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    const existing = await repository.findById(tenantId, req.params.id as string)
    if (!existing) return res.status(404).json({ message: 'Mesa não encontrada' })

    const mesa = Mesa.restore(existing)
    mesa.update({
        ...req.body,
        updatedBy: req.user!.uuid
    })
    const updated = await repository.update(mesa)
    socketManager.emitToTenant(tenantId, 'atualizar_mesas', { type: 'mesa_atualizada', mesaId: req.params.id })
    return res.json(updated)
})

mesaRoutes.delete('/:id', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.delete(tenantId, req.params.id as string)
    socketManager.emitToTenant(tenantId, 'atualizar_mesas', { type: 'mesa_deletada', mesaId: req.params.id })
    return res.status(204).send()
})

mesaRoutes.post('/:id/fechar', authenticate, async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.closeTable(tenantId, req.params.id as string, req.user!.uuid)
    socketManager.emitToTenant(tenantId, 'atualizar_mesas', { type: 'mesa_fechada', mesaId: req.params.id })
    socketManager.emitToTenant(tenantId, 'atualizar_comandas', { type: 'mesa_fechada', mesaId: req.params.id })
    return res.json({ message: 'Mesa fechada com sucesso' })
})

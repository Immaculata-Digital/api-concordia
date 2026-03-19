import { Router } from 'express'
import { PostgresRemetenteRepository } from '../repositories/PostgresRemetenteRepository'

export const remetenteRoutes = Router()
const remetenteRepository = new PostgresRemetenteRepository()

remetenteRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const remetentes = await remetenteRepository.findAll(tenantId)
        const mapped = remetentes.map(r => ({ ...r, id: r.uuid }))
        return res.json(mapped)
    } catch (error) {
        console.error('[REMETENTES] Error listing:', error)
        return res.status(500).json({ message: 'Erro ao listar remetentes' })
    }
})

remetenteRoutes.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const remetente = await remetenteRepository.findById(tenantId, req.params.id)
        if (!remetente) return res.status(404).json({ message: 'Remetente não encontrado' })
        return res.json({ ...remetente, id: remetente.uuid })
    } catch (error) {
        console.error('[REMETENTES] Error getting by id:', error)
        return res.status(500).json({ message: 'Erro ao obter remetente' })
    }
})

remetenteRoutes.post('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const data = {
            ...req.body,
            createdBy: req.user!.uuid
        }
        const created = await remetenteRepository.create(tenantId, data)
        return res.status(201).json({ ...created, id: created.uuid })
    } catch (error) {
        console.error('[REMETENTES] Error creating:', error)
        return res.status(500).json({ message: 'Erro ao criar remetente' })
    }
})

remetenteRoutes.put('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const data = {
            ...req.body,
            updatedBy: req.user!.uuid
        }
        const updated = await remetenteRepository.update(tenantId, req.params.id, data)
        return res.json({ ...updated, id: updated.uuid })
    } catch (error) {
        console.error('[REMETENTES] Error updating:', error)
        return res.status(500).json({ message: 'Erro ao atualizar remetente' })
    }
})

remetenteRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        await remetenteRepository.delete(tenantId, req.params.id)
        return res.status(204).send()
    } catch (error) {
        console.error('[REMETENTES] Error deleting:', error)
        return res.status(500).json({ message: 'Erro ao remover remetente' })
    }
})

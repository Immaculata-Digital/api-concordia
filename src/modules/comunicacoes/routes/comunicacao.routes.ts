import { Router } from 'express'
import { PostgresComunicacaoRepository } from '../repositories/PostgresComunicacaoRepository'

export const comunicacaoRoutes = Router()
const comunicacaoRepository = new PostgresComunicacaoRepository()

comunicacaoRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const comunicacoes = await comunicacaoRepository.findAll(tenantId)
        const mapped = comunicacoes.map(c => ({ ...c, id: c.uuid }))
        return res.json(mapped)
    } catch (error) {
        console.error('[COMUNICACOES] Error listing:', error)
        return res.status(500).json({ message: 'Erro ao listar comunicações' })
    }
})

comunicacaoRoutes.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const comunicacao = await comunicacaoRepository.findById(tenantId, req.params.id)
        if (!comunicacao) return res.status(404).json({ message: 'Comunicação não encontrada' })
        return res.json({ ...comunicacao, id: comunicacao.uuid })
    } catch (error) {
        console.error('[COMUNICACOES] Error getting by id:', error)
        return res.status(500).json({ message: 'Erro ao obter comunicação' })
    }
})

comunicacaoRoutes.post('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const data = {
            ...req.body,
            createdBy: req.user!.uuid
        }
        const created = await comunicacaoRepository.create(tenantId, data)
        return res.status(201).json({ ...created, id: created.uuid })
    } catch (error) {
        console.error('[COMUNICACOES] Error creating:', error)
        return res.status(500).json({ message: 'Erro ao criar comunicação' })
    }
})

comunicacaoRoutes.put('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const data = {
            ...req.body,
            updatedBy: req.user!.uuid
        }
        const updated = await comunicacaoRepository.update(tenantId, req.params.id, data)
        return res.json({ ...updated, id: updated.uuid })
    } catch (error) {
        console.error('[COMUNICACOES] Error updating:', error)
        return res.status(500).json({ message: 'Erro ao atualizar comunicação' })
    }
})

comunicacaoRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        await comunicacaoRepository.delete(tenantId, req.params.id)
        return res.status(204).send()
    } catch (error) {
        console.error('[COMUNICACOES] Error deleting:', error)
        return res.status(500).json({ message: 'Erro ao remover comunicação' })
    }
})

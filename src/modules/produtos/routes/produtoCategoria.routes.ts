import { Router } from 'express'
import { PostgresProdutoCategoriaRepository } from '../repositories/PostgresProdutoCategoriaRepository'

export const produtoCategoriaRoutes = Router()
const repository = new PostgresProdutoCategoriaRepository()

produtoCategoriaRoutes.get('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const items = await repository.findAll(tenantId)
    return res.json(items)
})

produtoCategoriaRoutes.post('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const created = await repository.create({ ...req.body, tenantId })
    return res.status(201).json(created)
})

produtoCategoriaRoutes.put('/:uuid', async (req, res) => {
    const tenantId = req.user!.tenantId
    const updated = await repository.update(req.params.uuid, tenantId, req.body)
    return res.json(updated)
})

produtoCategoriaRoutes.delete('/:uuid', async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.delete(req.params.uuid, tenantId)
    return res.status(204).send()
})

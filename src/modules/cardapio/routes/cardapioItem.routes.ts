import { Router } from 'express'
import { PostgresCardapioItemRepository } from '../repositories/PostgresCardapioItemRepository'
import { CardapioItem } from '../entities/CardapioItem'

export const cardapioItemRoutes = Router()
const repository = new PostgresCardapioItemRepository()

cardapioItemRoutes.get('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const categoriaCode = req.query.categoriaCode as string | undefined
    const items = await repository.findAll(tenantId, categoriaCode)
    return res.json(items)
})

cardapioItemRoutes.get('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const item = await repository.findById(tenantId, req.params.id)
    if (!item) return res.status(404).json({ message: 'Item não encontrado' })
    return res.json(item)
})

cardapioItemRoutes.post('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const item = CardapioItem.create({
        ...req.body,
        tenantId,
        createdBy: req.user!.uuid,
        updatedBy: req.user!.uuid
    })
    const created = await repository.create(item)
    return res.status(201).json(created)
})

cardapioItemRoutes.put('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const existing = await repository.findById(tenantId, req.params.id)
    if (!existing) return res.status(404).json({ message: 'Item não encontrado' })

    const item = CardapioItem.restore(existing)
    item.update({
        ...req.body,
        updatedBy: req.user!.uuid
    })
    const updated = await repository.update(item)
    return res.json(updated)
})

cardapioItemRoutes.delete('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.delete(tenantId, req.params.id)
    return res.status(204).send()
})

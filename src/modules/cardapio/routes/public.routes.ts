import { Router } from 'express'
import { PostgresCardapioItemRepository } from '../repositories/PostgresCardapioItemRepository'
import { PostgresProdutoCategoriaRepository } from '../../produtos/repositories/PostgresProdutoCategoriaRepository'

export const publicCardapioRoutes = Router()
const repository = new PostgresCardapioItemRepository()
const categoriaRepository = new PostgresProdutoCategoriaRepository()

// Listar categorias de um tenant (Público)
publicCardapioRoutes.get('/categorias', async (req, res) => {
    const { tenantId } = req.query
    if (!tenantId) return res.status(400).json({ message: 'tenantId é obrigatório' })
    const categories = await categoriaRepository.findAll(tenantId as string)
    return res.json(categories)
})

// Listar cardápio completo de um tenant (Público)
publicCardapioRoutes.get('/', async (req, res) => {
    const { tenantId, categoriaCode } = req.query

    if (!tenantId) {
        return res.status(400).json({ message: 'tenantId é obrigatório' })
    }

    const items = await repository.findAll(tenantId as string, categoriaCode as string)
    return res.json(items)
})

// Obter detalhe de um item (Público)
publicCardapioRoutes.get('/:id', async (req, res) => {
    const { tenantId } = req.query

    if (!tenantId) {
        return res.status(400).json({ message: 'tenantId é obrigatório' })
    }

    const item = await repository.findById(tenantId as string, req.params.id)
    if (!item) return res.status(404).json({ message: 'Item não encontrado' })
    return res.json(item)
})

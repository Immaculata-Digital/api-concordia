import { Router } from 'express'
import { PostgresProdutoCategoriaRepository } from '../repositories/PostgresProdutoCategoriaRepository'

export const publicProdutoCategoriaRoutes = Router()
const repository = new PostgresProdutoCategoriaRepository()

// Listar categorias de um tenant (Público)
publicProdutoCategoriaRoutes.get('/', async (req, res) => {
    try {
        const { tenantId } = req.query
        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId é obrigatório' })
        }

        const categories = await repository.findAll(tenantId as string)
        return res.json(categories)
    } catch (error) {
        console.error('Error fetching public categories:', error)
        return res.status(500).json({ message: 'Erro ao listar categorias' })
    }
})

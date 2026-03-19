import { Router } from 'express'
import { PostgresProdutoCategoriaRepository } from '../repositories/PostgresProdutoCategoriaRepository'
import { PostgresProdutoRepository } from '../repositories/PostgresProdutoRepository'

export const publicProdutoCategoriaRoutes = Router()
const repository = new PostgresProdutoCategoriaRepository()
const produtoRepository = new PostgresProdutoRepository()

// Listar categorias de um tenant (Público)
publicProdutoCategoriaRoutes.get('/', async (req, res) => {
    try {
        const { tenantId } = req.query
        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId é obrigatório' })
        }

        const categories = await repository.findAll(tenantId as string)
        return res.json(categories.map(c => ({
            uuid: c.uuid,
            nome: c.name,
            codigo: c.code,
            imagem: c.image_url,
            descricao: c.description,
            ordem: c.sort,
            enabled: c.enabled
        })))
    } catch (error) {
        console.error('Error fetching public categories:', error)
        return res.status(500).json({ message: 'Erro ao listar categorias' })
    }
})

export const publicProdutoRoutes = Router()

// Listar produtos de um tenant (Público) com suporte a view
publicProdutoRoutes.get('/', async (req, res) => {
    try {
        const { tenantId, view, categoria_code } = req.query
        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId é obrigatório' })
        }

        const products = await produtoRepository.findAll(
            tenantId as string,
            view as string,
            undefined, // limit
            undefined, // offset
            categoria_code as string
        )

        return res.json(products)
    } catch (error) {
        console.error('Error fetching public products:', error)
        return res.status(500).json({ message: 'Erro ao listar produtos' })
    }
})

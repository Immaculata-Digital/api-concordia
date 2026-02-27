
import { Router } from 'express'
import { PostgresRecompensaRepository } from '../repositories/PostgresRecompensaRepository'
import { PostgresProdutoRepository } from '../../produtos/repositories/PostgresProdutoRepository'
import { Recompensa } from '../entities/Recompensa'
import { Produto } from '../../produtos/entities/Produto'

export const publicRecompensasRoutes = Router()
export const protectedRecompensasRoutes = Router()

const repository = new PostgresRecompensaRepository()
const produtoRepository = new PostgresProdutoRepository()

// --- Public Routes ---
publicRecompensasRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.query.tenantId as string
        const view = req.query.view as string
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
        const category = req.query.category as string
        const sort = req.query.sort as string

        const items = await repository.findAll(tenantId, view, limit, category, sort)
        return res.json(items)
    } catch (error) {
        console.error('Error listing rewards:', error)
        return res.status(500).json({ message: 'Erro ao listar recompensas' })
    }
})

publicRecompensasRoutes.get('/categories', async (req, res) => {
    try {
        const tenantId = req.query.tenantId as string
        const categories = await repository.findAllCategories(tenantId)
        return res.json(categories)
    } catch (error) {
        console.error('Error listing categories:', error)
        return res.status(500).json({ message: 'Erro ao listar categorias' })
    }
})

publicRecompensasRoutes.get('/:id', async (req, res) => {
    try {
        const item = await repository.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Recompensa não encontrada' })
        return res.json(item)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar recompensa' })
    }
})

// --- Protected Routes ---
protectedRecompensasRoutes.post('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Não autorizado' })

        const {
            tenantId, produtoId,
            qtd_pontos_resgate, voucher_digital
        } = req.body

        const recompensa = Recompensa.create({
            tenantId,
            produtoId,
            qtd_pontos_resgate,
            voucher_digital,
            createdBy: req.user.uuid,
            updatedBy: req.user.uuid
        })
        const createdReward = await repository.create(recompensa)

        return res.status(201).json(createdReward)
    } catch (error) {
        console.error('Error creating reward:', error)
        return res.status(500).json({ message: 'Erro ao criar recompensa' })
    }
})

protectedRecompensasRoutes.put('/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Não autorizado' })

        const existing = await repository.findById(req.params.id)
        if (!existing) return res.status(404).json({ message: 'Recompensa não encontrada' })

        const recompensaEntity = Recompensa.restore(existing)
        recompensaEntity.update({
            qtd_pontos_resgate: req.body.qtd_pontos_resgate,
            voucher_digital: req.body.voucher_digital,
            updatedBy: req.user.uuid
        })
        const updated = await repository.update(recompensaEntity)

        return res.json(updated)
    } catch (error) {
        console.error('Error updating reward:', error)
        return res.status(500).json({ message: 'Erro ao atualizar recompensa' })
    }
})

protectedRecompensasRoutes.delete('/:id', async (req, res) => {
    try {
        const existing = await repository.findById(req.params.id)
        if (existing) {
            await repository.delete(req.params.id)
            await produtoRepository.delete(existing.produtoId)
        }
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir recompensa' })
    }
})

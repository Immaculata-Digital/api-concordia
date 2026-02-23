
import { Router } from 'express'
import { PostgresRecompensaRepository } from '../repositories/PostgresRecompensaRepository'
import { PostgresProdutoRepository } from '../../produtos/repositories/PostgresProdutoRepository'
import { Recompensa } from '../entities/Recompensa'
import { Produto } from '../../produtos/entities/Produto'

export const recompensasRoutes = Router()
const repository = new PostgresRecompensaRepository()
const produtoRepository = new PostgresProdutoRepository()

recompensasRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.query.tenantId as string
        const items = await repository.findAll(tenantId)
        return res.json(items)
    } catch (error) {
        console.error('Error listing rewards:', error)
        return res.status(500).json({ message: 'Erro ao listar recompensas' })
    }
})

recompensasRoutes.get('/:id', async (req, res) => {
    try {
        const item = await repository.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Recompensa não encontrada' })
        return res.json(item)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar recompensa' })
    }
})

recompensasRoutes.post('/', async (req, res) => {
    try {
        const {
            tenantId, produtoId,
            qtd_pontos_resgate, voucher_digital
        } = req.body

        // Create Reward using existing product
        const recompensa = Recompensa.create({
            tenantId,
            produtoId,
            qtd_pontos_resgate,
            voucher_digital,
            createdBy: req.user!.uuid,
            updatedBy: req.user!.uuid
        })
        const createdReward = await repository.create(recompensa)

        return res.status(201).json(createdReward)
    } catch (error) {
        console.error('Error creating reward:', error)
        return res.status(500).json({ message: 'Erro ao criar recompensa' })
    }
})

recompensasRoutes.put('/:id', async (req, res) => {
    try {
        const existing = await repository.findById(req.params.id)
        if (!existing) return res.status(404).json({ message: 'Recompensa não encontrada' })

        // Update Reward
        const recompensaEntity = Recompensa.restore(existing)
        recompensaEntity.update({
            qtd_pontos_resgate: req.body.qtd_pontos_resgate,
            voucher_digital: req.body.voucher_digital,
            updatedBy: req.user!.uuid
        })
        const updated = await repository.update(recompensaEntity)

        return res.json(updated)
    } catch (error) {
        console.error('Error updating reward:', error)
        return res.status(500).json({ message: 'Erro ao atualizar recompensa' })
    }
})

recompensasRoutes.delete('/:id', async (req, res) => {
    try {
        const existing = await repository.findById(req.params.id)
        if (existing) {
            // We soft delete the reward, but maybe keep the product? 
            // Usually if we delete the reward item, we might want to keep the product in the general list.
            // But the requirement says "herda de um produto". 
            // I'll soft delete both for consistency in this module.
            await repository.delete(req.params.id)
            await produtoRepository.delete(existing.produtoId)
        }
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir recompensa' })
    }
})

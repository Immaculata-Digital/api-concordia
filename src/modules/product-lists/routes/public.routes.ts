import { Router } from 'express'
import { PostgresProductListRepository } from '../repositories/PostgresProductListRepository'

export const publicProductListRoutes = Router()
const repository = new PostgresProductListRepository()

publicProductListRoutes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const tenantId = req.query.tenantId as string

        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId is required' })
        }

        const list = await repository.findById(id, tenantId)
        if (!list) {
            return res.status(404).json({ message: 'Lista não encontrada' })
        }

        const detailedProducts = await repository.getDetailedProducts(list.product_uuids, tenantId)

        return res.json({
            ...list,
            detailed_products: detailedProducts
        })
    } catch (error) {
        console.error('Error getting public product list:', error)
        return res.status(500).json({ message: 'Erro ao buscar lista de produtos' })
    }
})

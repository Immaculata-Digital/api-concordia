import { Router } from 'express'
import { PostgresProductListRepository } from '../repositories/PostgresProductListRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'

export const publicProductListRoutes = Router({ mergeParams: true })
const repository = new PostgresProductListRepository()
const tenantRepository = new PostgresTenantRepository()

publicProductListRoutes.get('/:id', async (req, res) => {
    try {
        const { id, tenantSlug } = req.params as any
 
        if (!tenantSlug) {
            return res.status(400).json({ message: 'tenantSlug é obrigatório' })
        }

        const tenant = await tenantRepository.findBySlug(tenantSlug)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado pelo slug' })
        }

        const tenantId = tenant.uuid!
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

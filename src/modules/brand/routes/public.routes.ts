import { Router } from 'express'
import { PostgresBrandRepository } from '../repositories/PostgresBrandRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'

export const publicBrandRoutes = Router()
const brandRepository = new PostgresBrandRepository()
const tenantRepository = new PostgresTenantRepository()

// GET /api/public/identidade-visual/:tenantSlug
publicBrandRoutes.get('/:tenantSlug', async (req, res) => {
    try {
        const { tenantSlug } = req.params as { tenantSlug: string }
        
        // 1. Buscar tenant pelo slug
        const tenant = await tenantRepository.findBySlug(tenantSlug)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        // 2. Buscar configuração de marca por tenantId
        const config = await brandRepository.getConfigByTenantId(tenant.uuid!)
        
        if (!config) {
            return res.json({
                logo: {},
                palette: {},
                typography: {}
            })
        }

        return res.json(config.content)
    } catch (error) {
        console.error('Error fetching public brand config:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar configuração de marca' })
    }
})

import { Router } from 'express'
import { PostgresBrandRepository } from '../repositories/PostgresBrandRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'

export const publicBrandRoutes = Router()
const brandRepository = new PostgresBrandRepository()
const tenantRepository = new PostgresTenantRepository()

// GET /api/public/identidade-visual/:identifier
publicBrandRoutes.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params as { identifier: string }
        
        let tenant = null
        
        // 1. Tentar buscar por UUID se o formato for válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (uuidRegex.test(identifier)) {
            tenant = await tenantRepository.findById(identifier)
        }
        
        // 2. Se não encontrou por UUID (ou não era UUID), tenta buscar pelo slug
        if (!tenant) {
            tenant = await tenantRepository.findBySlug(identifier)
        }
        
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

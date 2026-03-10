import { Router } from 'express'
import { PostgresLandingPageRepository } from '../repositories/PostgresLandingPageRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'

export const publicLandingPageRoutes = Router()
const repository = new PostgresLandingPageRepository()
const tenantRepository = new PostgresTenantRepository()

publicLandingPageRoutes.get('/:tenantSlug', async (req, res) => {
    try {
        const { tenantSlug } = req.params as { tenantSlug: string }
        
        // 1. Buscar tenant pelo slug
        const tenant = await tenantRepository.findBySlug(tenantSlug)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        // 2. Buscar landing page 'home' para este tenant
        const landingPages = await repository.listByTenantId(tenant.uuid!)
        const homePage = landingPages.find(lp => lp.slug === 'home')

        if (!homePage) {
            return res.status(404).json({ message: 'Landing page não encontrada' })
        }

        return res.json({
            ...homePage.content,
            tenantId: tenant.uuid
        })
    } catch (error) {
        console.error('Error fetching public landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar landing page' })
    }
})

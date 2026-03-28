import { Router } from 'express'
import { PostgresLandingPageRepository } from '../repositories/PostgresLandingPageRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'
import { PostgresIdentidadeVisualRepository } from '../repositories/PostgresIdentidadeVisualRepository'

export const publicLandingPageRoutes = Router({ mergeParams: true })
const repository = new PostgresLandingPageRepository()
const tenantRepository = new PostgresTenantRepository()
const identidadeVisualRepository = new PostgresIdentidadeVisualRepository()

// Helper para encontrar tenant por slug (param/query) ou id (query)
const findTenant = async (req: any) => {
    const { tenantSlug: paramSlug } = req.params
    const { tenantSlug: querySlug, tenantId: queryId } = req.query
    
    if (paramSlug && paramSlug !== ':tenantSlug') {
        return await tenantRepository.findBySlug(paramSlug)
    }
    if (querySlug) {
        return await tenantRepository.findBySlug(querySlug)
    }
    if (queryId) {
        return await tenantRepository.findById(queryId)
    }
    return null
}

export const publicIdentidadeVisualHandler = async (req: any, res: any) => {
    try {
        const tenant = await findTenant(req)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const config = await identidadeVisualRepository.getConfigByTenantId(tenant.uuid!)
        const baseConfig = config ? config.content : { logo: {}, palette: {}, typography: {} };

        return res.json({
            ...baseConfig
        })
    } catch (error) {
        console.error('Error fetching public identidade visual:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar identidade visual' })
    }
}

export const publicLandingPageHandler = async (req: any, res: any) => {
    try {
        const tenant = await findTenant(req)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

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
}

// Rota para Identidade Visual do Site (Identidade Visual v2 / Premium)
publicLandingPageRoutes.get('/identidade-visual', publicIdentidadeVisualHandler)

publicLandingPageRoutes.get('/', publicLandingPageHandler)

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
        
        let tenantInfo = null;
        try {
            const { pool } = require('../../../infra/database/pool');
            const result = await pool.query(`
                SELECT 
                    t.uuid, t.name, t.slug, t.description, t.category,
                    p.cpf_cnpj as document,
                    (SELECT contact_value FROM app.people_contacts pc WHERE pc.people_id = t.pessoa_id AND contact_type = 'EMAIL' LIMIT 1) as email,
                    (SELECT contact_value FROM app.people_contacts pc WHERE pc.people_id = t.pessoa_id AND (contact_type = 'WHATSAPP' OR contact_type = 'PHONE') LIMIT 1) as phone,
                    (SELECT contact_value FROM app.people_contacts pc WHERE pc.people_id = t.pessoa_id AND (contact_type = 'INSTAGRAM') LIMIT 1) as instagram,
                    (SELECT contact_value FROM app.people_contacts pc WHERE pc.people_id = t.pessoa_id AND (contact_type = 'FACEBOOK') LIMIT 1) as facebook,
                    COALESCE(ta.street, pa.street) as street,
                    COALESCE(ta.number, pa.number) as number,
                    COALESCE(ta.complement, pa.complement) as complement,
                    COALESCE(ta.neighborhood, pa.neighborhood) as neighborhood,
                    COALESCE(ta.city, pa.city) as city,
                    COALESCE(ta.state, pa.state) as state,
                    COALESCE(ta.postal_code, pa.postal_code) as postal_code
                FROM app.tenants t
                LEFT JOIN app.people p ON p.uuid = t.pessoa_id
                LEFT JOIN app.tenant_addresses ta ON ta.tenant_id = t.uuid
                LEFT JOIN app.people_addresses pa ON pa.people_id = t.pessoa_id
                WHERE t.uuid = $1
            `, [tenant.uuid]);

            if (result.rows.length > 0) {
                const r = result.rows[0];
                tenantInfo = {
                    name: r.name,
                    document: r.document,
                    email: r.email,
                    phone: r.phone,
                    social: {
                        instagram: r.instagram,
                        facebook: r.facebook
                    },
                    address: {
                        street: r.street,
                        number: r.number,
                        complement: r.complement,
                        neighborhood: r.neighborhood,
                        city: r.city,
                        state: r.state,
                        postalCode: r.postal_code
                    }
                };
            }
        } catch (e) {
            console.error('Error fetching dynamic tenant details for footer:', e);
        }

        const baseConfig = config ? config.content : { logo: {}, palette: {}, typography: {} };

        return res.json({
            ...baseConfig,
            tenantInfo
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

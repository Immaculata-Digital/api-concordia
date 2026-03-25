import { Router } from 'express'
import { PostgresTenantRepository } from '../repositories/PostgresTenantRepository'

export const publicTenantRoutes = Router({ mergeParams: true })
const tenantRepository = new PostgresTenantRepository()

publicTenantRoutes.get('/', async (req, res) => {
    try {
        const tenants = await tenantRepository.findAll()
        // Return only what is strictly necessary for public view
        const publicTenants = tenants.map(t => ({
            uuid: t.uuid,
            name: t.name,
            slug: t.slug,
            logo: t.logo,
            category: t.category,
            modules: t.modules,
            latitude: t.latitude,
            longitude: t.longitude,
            plusCode: t.plusCode,
            description: t.description,
            fullAddress: (t as any).fullAddress
        }))
        return res.json(publicTenants)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao listar parceiros' })
    }
})

import { Router } from 'express'
import { PostgresLandingPageRepository } from '../repositories/PostgresLandingPageRepository'
import { authenticate } from '../../../core/middlewares/authenticate'

export const landingPageRoutes = Router()
const repository = new PostgresLandingPageRepository()

landingPageRoutes.use(authenticate)

const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

landingPageRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId as string
        const landingPages = await repository.listByTenantId(tenantId)
        return res.json(landingPages)
    } catch (error) {
        console.error('Error listing landing pages:', error)
        return res.status(500).json({ message: 'Erro interno ao listar landing pages' })
    }
})

landingPageRoutes.get('/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params as { uuid: string }
        const tenantId = req.user!.tenantId as string
        const landingPage = await repository.getByUuid(uuid, tenantId)
        
        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page não encontrada' })
        }

        return res.json(landingPage)
    } catch (error) {
        console.error('Error fetching landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar landing page' })
    }
})

landingPageRoutes.post('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId as string
        const userId = req.user!.uuid as string
        const { titulo, slug, content, ativa } = req.body

        if (!titulo) {
            return res.status(400).json({ message: 'Título é obrigatório' })
        }

        const finalSlug = (slug as string) || generateSlug(titulo as string)

        const landingPage = await repository.create({
            tenantId,
            titulo,
            slug: finalSlug,
            content: content || {},
            ativa: ativa ?? true,
            createdBy: userId
        })

        return res.status(201).json(landingPage)
    } catch (error) {
        console.error('Error creating landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao criar landing page' })
    }
})

landingPageRoutes.put('/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params as { uuid: string }
        const tenantId = req.user!.tenantId as string
        const userId = req.user!.uuid as string
        const { titulo, slug, content, ativa } = req.body

        const dataToUpdate: any = {
            titulo,
            slug,
            content,
            ativa,
            updatedBy: userId
        }

        if (titulo && !slug) {
            dataToUpdate.slug = generateSlug(titulo as string)
        }

        const updated = await repository.update(uuid, tenantId, dataToUpdate)
        
        if (!updated) {
            return res.status(404).json({ message: 'Landing page não encontrada ou sem alterações' })
        }

        return res.json(updated)
    } catch (error) {
        console.error('Error updating landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao atualizar landing page' })
    }
})

landingPageRoutes.delete('/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params as { uuid: string }
        const tenantId = req.user!.tenantId as string
        
        const success = await repository.delete(uuid, tenantId)
        
        if (!success) {
            return res.status(404).json({ message: 'Landing page não encontrada' })
        }

        return res.status(204).send()
    } catch (error) {
        console.error('Error deleting landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao excluir landing page' })
    }
})
 
import { Router } from 'express'
import { PostgresTenantRepository } from '../repositories/PostgresTenantRepository'
import { Tenant } from '../entities/Tenant'
import { PostgresTenantComplementaryRepository } from '../repositories/PostgresTenantComplementaryRepository'

export const tenantRoutes = Router()
const tenantRepository = new PostgresTenantRepository()
const complementaryRepository = new PostgresTenantComplementaryRepository()

tenantRoutes.get('/', async (req, res) => {
    try {
        const tenants = await tenantRepository.findAll()
        return res.json(tenants)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao listar tenants' })
    }
})

tenantRoutes.get('/:id', async (req, res) => {
    try {
        const tenant = await tenantRepository.findById(req.params.id)
        if (!tenant) return res.status(404).json({ message: 'Tenant não encontrado' })

        const address = await complementaryRepository.findAddressByTenantId(req.params.id)
        const contacts = await complementaryRepository.findContactsByTenantId(req.params.id)

        return res.json({
            ...tenant,
            address,
            contacts
        })
    } catch (error) {
        console.error('Error getting tenant:', error)
        return res.status(500).json({ message: 'Erro ao buscar tenant' })
    }
})

tenantRoutes.post('/', async (req, res) => {
    try {
        const { name, slug } = req.body

        // Check if slug already exists
        const existing = await tenantRepository.findBySlug(slug)
        if (existing) {
            return res.status(400).json({ message: 'Slug já está em uso' })
        }

        const tenant = Tenant.create({
            name,
            slug,
            createdBy: req.user!.uuid,
            updatedBy: req.user!.uuid
        })

        const created = await tenantRepository.create(tenant)
        return res.status(201).json(created)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar tenant' })
    }
})

tenantRoutes.put('/:id', async (req, res) => {
    try {
        const existing = await tenantRepository.findById(req.params.id)
        if (!existing) return res.status(404).json({ message: 'Tenant não encontrado' })

        const tenant = Tenant.restore(existing)
        tenant.update({
            ...req.body,
            updatedBy: req.user!.uuid
        })

        const updated = await tenantRepository.update(tenant)
        return res.json(updated)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar tenant' })
    }
})

tenantRoutes.delete('/:id', async (req, res) => {
    try {
        await tenantRepository.delete(req.params.id)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir tenant' })
    }
})
// Address CRUD
tenantRoutes.post('/:id/address', async (req, res) => {
    try {
        await complementaryRepository.upsertAddress({
            tenantId: req.params.id,
            ...req.body,
            updatedBy: req.user!.uuid
        })
        return res.status(200).json({ message: 'Endereço atualizado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao salvar endereço' })
    }
})

// Contacts CRUD
tenantRoutes.post('/:id/contacts', async (req, res) => {
    try {
        await complementaryRepository.createContact({
            tenantId: req.params.id,
            ...req.body,
            createdBy: req.user!.uuid
        })
        return res.status(201).json({ message: 'Contato criado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar contato' })
    }
})

tenantRoutes.put('/:id/contacts/:contactId', async (req, res) => {
    try {
        await complementaryRepository.updateContact(req.params.contactId, {
            ...req.body,
            updatedBy: req.user!.uuid
        })
        return res.json({ message: 'Contato atualizado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar contato' })
    }
})

tenantRoutes.delete('/:id/contacts/:contactId', async (req, res) => {
    try {
        await complementaryRepository.deleteContact(req.params.contactId)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir contato' })
    }
})

import { Router } from 'express'
import { PostgresPluvytClientRepository } from '../repositories/PostgresPluvytClientRepository'
import { PluvytClient } from '../entities/PluvytClient'

const pluvytClientRoutes = Router()
const repository = new PostgresPluvytClientRepository()

pluvytClientRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const clients = await repository.findAll(tenantId)
        return res.json(clients.map(c => c.toJSON()))
    } catch (error) {
        console.error('Error listing pluvyt clients:', error)
        return res.status(500).json({ message: 'Erro ao listar clientes Pluvyt' })
    }
})

pluvytClientRoutes.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        const client = await repository.findById(id, tenantId)
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' })
        return res.json(client.toJSON())
    } catch (error) {
        console.error('Error getting pluvyt client:', error)
        return res.status(500).json({ message: 'Erro ao obter cliente Pluvyt' })
    }
})

pluvytClientRoutes.post('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { personId, saldo } = req.body

        // Basic validation
        if (!personId) return res.status(400).json({ message: 'ID da pessoa é obrigatório' })

        // Check if already exists
        const existing = await repository.findByPersonId(personId, tenantId)
        if (existing) return res.status(400).json({ message: 'Esta pessoa já é um cliente Pluvyt' })

        const client = PluvytClient.create({
            tenantId,
            personId,
            saldo: saldo || 0,
            createdBy: req.user!.uuid,
            updatedBy: req.user!.uuid
        })

        await repository.create(client)
        return res.status(201).json(client.toJSON())
    } catch (error) {
        console.error('Error creating pluvyt client:', error)
        return res.status(500).json({ message: 'Erro ao criar cliente Pluvyt' })
    }
})

pluvytClientRoutes.put('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        const { saldo } = req.body

        const client = await repository.findById(id, tenantId)
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' })

        client.update({
            saldo: saldo !== undefined ? saldo : client.toJSON().saldo,
            updatedBy: req.user!.uuid
        })

        await repository.update(client)
        return res.json(client.toJSON())
    } catch (error) {
        console.error('Error updating pluvyt client:', error)
        return res.status(500).json({ message: 'Erro ao atualizar cliente Pluvyt' })
    }
})

pluvytClientRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params

        const client = await repository.findById(id, tenantId)
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' })

        await repository.delete(id, tenantId)
        return res.status(204).send()
    } catch (error) {
        console.error('Error deleting pluvyt client:', error)
        return res.status(500).json({ message: 'Erro ao excluir cliente Pluvyt' })
    }
})

export { pluvytClientRoutes }

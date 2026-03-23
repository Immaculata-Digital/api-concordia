import { Router } from 'express'
import { PostgresMesaRepository } from '../repositories/PostgresMesaRepository'

export const publicMesaRoutes = Router()
const repository = new PostgresMesaRepository()

// Listar mesas públicas de um tenant
publicMesaRoutes.get('/', async (req, res) => {
    const { tenantId } = req.query

    if (!tenantId) {
        return res.status(400).json({ message: 'tenantId é obrigatório' })
    }

    const mesas = await repository.findAll(tenantId as string)
    return res.json(mesas)
})

// Retorna apenas os clientes ativos (comandas abertas) de uma mesa específica
publicMesaRoutes.get('/:mesaUuid/active-clients', async (req, res) => {
    const { tenantId } = req.query
    const { mesaUuid } = req.params

    if (!tenantId || !mesaUuid) {
        return res.status(400).json({ message: 'tenantId e mesaUuid são obrigatórios' })
    }

    try {
        const clients = await repository.getActiveClients(tenantId as string, mesaUuid)
        return res.json(clients)
    } catch (error) {
        console.error('Error fetching active clients:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar clientes ativos' })
    }
})

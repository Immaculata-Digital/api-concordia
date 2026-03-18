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
    // Retornamos apenas o básico necessário para o cardápio
    return res.json(mesas.map(m => ({
        uuid: m.uuid,
        numero: m.numero,
        status: m.status,
        capacidade: m.capacidade
    })))
})

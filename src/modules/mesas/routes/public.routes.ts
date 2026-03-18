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

import { Router } from 'express'
import { PostgresComandaRepository } from '../repositories/PostgresComandaRepository'
import { Comanda } from '../entities/Comanda'

export const publicComandaRoutes = Router()
const repository = new PostgresComandaRepository()

// Criar nova comanda (Pedido da Mesa) - Público
publicComandaRoutes.post('/', async (req, res) => {
    const { tenantId, mesaId, itens } = req.body

    if (!tenantId || !mesaId) {
        return res.status(400).json({ message: 'tenantId e mesaId são obrigatórios' })
    }

    // Cria a comanda com status 'aberta' ou 'pendente_pagamento'
    const comanda = Comanda.create({
        tenantId,
        mesaId,
        status: 'aberta',
        createdBy: 'customer', // Identificador para pedidos via QR Code
        updatedBy: 'customer',
        ...req.body
    })

    const created = await repository.create(comanda)

    // Se enviou itens, adiciona-os (precisamos garantir que o repository aceite isso ou fazer um loop)
    if (itens && Array.isArray(itens)) {
        for (const item of itens) {
            await repository.addItem(tenantId, {
                ...item,
                comandaId: created.uuid || created.id,
                tenantId,
                createdBy: 'customer'
            })
        }
    }

    const finalComanda = await repository.findById(tenantId, created.uuid || created.id)
    return res.status(201).json(finalComanda)
})

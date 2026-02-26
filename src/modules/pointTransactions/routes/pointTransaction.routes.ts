import { Router } from 'express'
import { PostgresPointTransactionRepository } from '../repositories/PostgresPointTransactionRepository'
import { PointTransaction } from '../entities/PointTransaction'

import { PostgresPluvytClientRepository } from '../../pluvyt-clients/repositories/PostgresPluvytClientRepository'
import { PluvytClient } from '../../pluvyt-clients/entities/PluvytClient'
import { pool } from '../../../infra/database/pool'

export const pointTransactionRoutes = Router()
const repository = new PostgresPointTransactionRepository()
const clientRepository = new PostgresPluvytClientRepository()

pointTransactionRoutes.get('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const { clientId } = req.query
    const transactions = await repository.findAll(tenantId, { clientId: clientId as string })
    return res.json(transactions.map(t => ({ ...t, id: t.uuid })))
})

pointTransactionRoutes.get('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const transaction = await repository.findById(tenantId, req.params.id)
    if (!transaction) return res.status(404).json({ message: 'Transação não encontrada' })
    return res.json({ ...transaction, id: transaction.uuid })
})

pointTransactionRoutes.post('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const { clientId, type, points, origin, rewardItemId, lojaId, observation } = req.body

    const ptPoints = Number(points)
    const clientRecord = await clientRepository.findById(clientId, tenantId)

    if (!clientRecord) {
        return res.status(404).json({ message: 'Cliente Pluvyt não encontrado' })
    }

    // Bloqueia se o e-mail do usuário não estiver verificado
    const userRes = await pool.query(
        'SELECT email_verified_at, email_verification_token FROM app.users WHERE person_id = $1 AND tenant_id = $2',
        [clientRecord.toJSON().personId, tenantId]
    )
    if (userRes.rowCount && userRes.rowCount > 0) {
        const user = userRes.rows[0]
        // Se tem token (veio pelo fluxo pluvyt) mas não tá verificado
        if (user.email_verification_token && !user.email_verified_at) {
            return res.status(403).json({ 
                message: 'E-mail não verificado. Você precisa confirmar sua conta para utilizar os pontos.',
                unverifiedEmail: true
            })
        }
    }

    const clientData = clientRecord.toJSON()
    const currentBalance = clientData.saldo
    let newBalance = currentBalance

    if (type === 'CREDITO') {
        newBalance += ptPoints
    } else if (type === 'DEBITO' || type === 'ESTORNO') {
        if (ptPoints > currentBalance) {
            return res.status(400).json({ message: 'Saldo insuficiente para a transação' })
        }
        newBalance -= ptPoints
    }

    clientRecord.update({ saldo: newBalance, updatedBy: req.user!.uuid })
    await clientRepository.update(clientRecord)

    const transaction = PointTransaction.create({
        tenantId,
        clientId,
        type,
        points: ptPoints,
        resultingBalance: newBalance,
        origin,
        rewardItemId,
        lojaId,
        observation,
        createdBy: req.user!.uuid,
        updatedBy: req.user!.uuid
    })

    const created = await repository.create(transaction)
    return res.status(201).json({ ...created, id: created.uuid })
})

pointTransactionRoutes.put('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const existing = await repository.findById(tenantId, req.params.id)
    if (!existing) return res.status(404).json({ message: 'Transação não encontrada' })

    const transaction = PointTransaction.restore(existing)
    transaction.update({
        ...req.body,
        updatedBy: req.user!.uuid
    })

    const updated = await repository.update(transaction)
    return res.json({ ...updated, id: updated.uuid })
})

pointTransactionRoutes.delete('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    await repository.delete(tenantId, req.params.id)
    return res.status(204).send()
})

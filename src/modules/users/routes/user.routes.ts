import { Router } from 'express'
import { PostgresUserRepository } from '../repositories/PostgresUserRepository'
import { User } from '../entities/User'

export const userRoutes = Router()
const userRepository = new PostgresUserRepository()

userRoutes.get('/', async (req, res) => {
    const tenantId = (req.query.tenantId as string) || req.user!.tenantId
    const users = await userRepository.findAll(tenantId)
    const mapped = users.map(u => ({
        ...u,
        id: u.uuid
    }))
    return res.json(mapped)
})

userRoutes.get('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const user = await userRepository.findById(tenantId, req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
    return res.json({ ...user, id: user.uuid })
})

userRoutes.post('/', async (req, res) => {
    const tenantId = req.user!.tenantId
    const { fullName, login, email, password, groupIds, allowFeatures, deniedFeatures } = req.body

    const user = User.create({
        tenantId,
        fullName,
        login,
        email,
        password, // Em produção, usar hash!
        groupIds,
        allowFeatures,
        deniedFeatures,
        createdBy: req.user!.uuid
    })

    const created = await userRepository.create(user)
    return res.status(201).json({ ...created, id: created.uuid })
})

userRoutes.put('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    const existing = await userRepository.findById(tenantId, req.params.id)
    if (!existing) return res.status(404).json({ message: 'Usuário não encontrado' })

    const user = User.restore(existing)
    user.update({
        ...req.body,
        updatedBy: req.user!.uuid
    })

    const updated = await userRepository.update(user)
    return res.json({ ...updated, id: updated.uuid })
})

userRoutes.delete('/:id', async (req, res) => {
    const tenantId = req.user!.tenantId
    await userRepository.delete(tenantId, req.params.id)
    return res.status(204).send()
})

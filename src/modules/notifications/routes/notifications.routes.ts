import { Router } from 'express'
import { PostgresNotificationRepository } from '../repositories/PostgresNotificationRepository'

export const notificationRoutes = Router()
const repository = new PostgresNotificationRepository()

notificationRoutes.get('/', async (req, res) => {
    const notifications = await repository.findAll(req.user!.tenantId, req.user!.uuid)
    const count = await repository.findUnreadCount(req.user!.tenantId, req.user!.uuid)

    // Formato esperado pelo frontend do ERP
    return res.json({
        items: notifications.map(n => ({
            id: n.uuid,
            title: n.titulo,
            body: n.mensagem,
            category: n.tipo,
            dataId: n.dataId,
            link: n.link,
            currentStatusState: n.lida ? 'read' : 'unread',
            createdAt: n.createdAt
        })),
        total: notifications.length,
        unreadCount: count
    })
})

notificationRoutes.get('/unread-count', async (req, res) => {
    const count = await repository.findUnreadCount(req.user!.tenantId, req.user!.uuid)
    return res.json({ count })
})

notificationRoutes.patch('/:id/read', async (req, res) => {
    await repository.markAsRead(req.user!.tenantId, req.user!.uuid, req.params.id)
    return res.json({ message: 'Notificação lida' })
})

notificationRoutes.patch('/:id/unread', async (req, res) => {
    await repository.markAsUnread(req.user!.tenantId, req.user!.uuid, req.params.id)
    return res.json({ message: 'Notificação não lida' })
})

notificationRoutes.patch('/read-all', async (req, res) => {
    await repository.markAllAsRead(req.user!.tenantId, req.user!.uuid)
    return res.json({ message: 'Todas lidas' })
})

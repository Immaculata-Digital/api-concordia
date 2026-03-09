import { Router } from 'express'
import { PostgresReportRepository } from '../repositories/PostgresReportRepository'
import { authenticate } from '../../../core/middlewares/authenticate'

export const reportRoutes = Router()
const repository = new PostgresReportRepository()

reportRoutes.get('/orders-dashboard-summary', authenticate, async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const summary = await repository.getOrdersDashboardSummary(tenantId)
        return res.json(summary)
    } catch (error) {
        console.error('[REPORT_ROUTES] Error fetching dashboard summary:', error)
        return res.status(500).json({ message: 'Erro ao buscar resumo do dashboard' })
    }
})

reportRoutes.get('/orders-sales-per-hour', authenticate, async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const sales = await repository.getOrdersSalesPerHour(tenantId)
        return res.json(sales)
    } catch (error) {
        console.error('[REPORT_ROUTES] Error fetching sales per hour:', error)
        return res.status(500).json({ message: 'Erro ao buscar vendas por hora' })
    }
})

reportRoutes.get('/orders-status-summary', authenticate, async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const status = await repository.getOrdersStatusSummary(tenantId)
        return res.json(status)
    } catch (error) {
        console.error('[REPORT_ROUTES] Error fetching status summary:', error)
        return res.status(500).json({ message: 'Erro ao buscar resumo de status' })
    }
})

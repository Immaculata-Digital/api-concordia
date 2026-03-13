import { Router } from 'express'
import menus from '../menus.json'
import views from '../views.json'
import { filterMenusByTenant } from '../utils/menuUtils'
import { pool } from '../../../infra/database/pool'

export const menuRoutes = Router()

menuRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user?.tenantId
        if (!tenantId) {
            return res.json(menus)
        }

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []

        const filteredMenus = filterMenusByTenant(menus, tenantModules)
        return res.json(filteredMenus)
    } catch (error) {
        console.error('[MENU_ROUTES] Error fetching filtered menus:', error)
        return res.json(menus) // Fallback to all menus if error
    }
})

menuRoutes.get('/views', (req, res) => {
    return res.json(views)
})

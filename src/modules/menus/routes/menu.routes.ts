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
            // Robustez: se não há tenantId no token por algum motivo, retorna apenas core
            return res.json(filterMenusByTenant(menus, []))
        }

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []

        const filteredMenus = filterMenusByTenant(menus, tenantModules)
        return res.json(filteredMenus)
    } catch (error) {
        console.error('[MENU_ROUTES] Error fetching filtered menus:', error)
        // Fallback robust: retorna apenas os menus core (sem módulo) em caso de erro crítico
        const coreMenus = filterMenusByTenant(menus, [])
        return res.json(coreMenus) 
    }
});

menuRoutes.get('/views', (req, res) => {
    return res.json(views)
})

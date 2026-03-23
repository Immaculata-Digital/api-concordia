import { Router } from 'express'
import views from '../views.json'
import { filterMenusByTenant } from '../utils/menuUtils'
import { pool } from '../../../infra/database/pool'

export const menuRoutes = Router()

menuRoutes.get('/', async (req, res) => {
    try {
        const menusRes = await pool.query('SELECT key, name, icon, url, category, order_index, parent_key as "parentKey", module FROM app.menus ORDER BY order_index ASC')
        const allMenus = menusRes.rows

        const tenantId = req.user?.tenantId
        if (!tenantId) {
            // Robustez: se não há tenantId no token por algum motivo, retorna apenas core
            return res.json(filterMenusByTenant(allMenus, []))
        }

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []

        const filteredMenus = filterMenusByTenant(allMenus, tenantModules)
        return res.json(filteredMenus)
    } catch (error) {
        console.error('[MENU_ROUTES] Error fetching filtered menus:', error)
        return res.status(500).json([]) 
    }
});

menuRoutes.get('/views', (req, res) => {
    return res.json(views)
})

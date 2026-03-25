import { Router } from 'express'
import { pool } from '../../../infra/database/pool'

export const appModuleRoutes = Router()

appModuleRoutes.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT key, name, menu_parent as "menuParent", order_index as "orderIndex" FROM app.modules WHERE is_active = true ORDER BY order_index ASC')
        return res.json(result.rows)
    } catch (error) {
        console.error('[MODULE_ROUTES] Error fetching modules:', error)
        return res.status(500).json([])
    }
})

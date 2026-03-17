import { Router } from 'express'
import features from '../features.json'

import { pool } from '../../../infra/database/pool'

export const featureRoutes = Router()

featureRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user?.tenantId
        if (!tenantId) {
            return res.json(features)
        }

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []

        const filteredFeatures = (features as any[]).filter(f => {
            // Features without a module defined are core and always available
            if (!f.module) return true
            // If feature has a module, only return if tenant has that module enabled
            return tenantModules.includes(f.module)
        })

        return res.json(filteredFeatures)
    } catch (error) {
        console.error('[FEATURE_ROUTES] Error fetching filtered features:', error)
        return res.json(features) // Fallback to all features if error
    }
})

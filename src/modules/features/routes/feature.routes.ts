import { Router } from 'express'
import { pool } from '../../../infra/database/pool'

export const featureRoutes = Router()

featureRoutes.get('/', async (req, res) => {
    try {
        const featuresRes = await pool.query('SELECT key, name, description, module FROM app.features')
        const allFeatures = featuresRes.rows

        const tenantId = req.user?.tenantId
        if (!tenantId) {
            return res.json(allFeatures)
        }

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []

        // Verificar se usuário logado é ADM (Ignora restrição de posse se for ADM)
        const userGroupsRes = await pool.query(
            'SELECT code FROM app.access_groups g JOIN app.access_group_memberships m ON g.uuid = m.group_id WHERE m.user_id = $1',
            [req.user!.uuid]
        )
        const isAdmin = userGroupsRes.rows.some(r => r.code?.toUpperCase() === 'ADM')
        const userPermissions = req.user?.permissions || []

        const filteredFeatures = allFeatures.filter(f => {
            // 1. Filtro de Módulo do Tenant
            const hasModule = !f.module || tenantModules.includes(f.module)
            if (!hasModule) return false

            // 2. Filtro de Posse (Apenas Administradores MASTERTENANT ou outros grupos que não sejam ADM)
            // Se NÃO for ADM, ele só vê o que ele mesmo possui
            if (!isAdmin && !userPermissions.includes(f.key)) {
                return false
            }

            return true
        })

        return res.json(filteredFeatures)
    } catch (error) {
        console.error('[FEATURE_ROUTES] Error fetching filtered features:', error)
        return res.status(500).json([]) // Fallback robusto
    }
})

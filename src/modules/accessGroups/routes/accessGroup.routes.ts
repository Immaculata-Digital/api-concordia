import { Router } from 'express'
import { pool } from '../../../infra/database/pool'

export const accessGroupRoutes = Router()

accessGroupRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const userId = req.user!.uuid

        // Verificar grupos do usuário logado
        const userGroupsRes = await pool.query(
            'SELECT code FROM app.access_groups g JOIN app.access_group_memberships m ON g.uuid = m.group_id WHERE m.user_id = $1',
            [userId]
        )
        const isMaster = userGroupsRes.rows.some(r => r.code?.toUpperCase() === 'MASTERTENANT')

        // Buscar o tenant Immaculata para oferecer grupos templates globais
        const masterTenantRes = await pool.query("SELECT uuid FROM app.tenants WHERE slug = 'immaculata' LIMIT 1")
        const masterTenantId = masterTenantRes.rows[0]?.uuid

        let query = ''
        let params: any[] = []

        if (isMaster) {
            // Buscar módulos do tenant para filtrar grupos
            const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [tenantId])
            const tenantModules = tenantRes.rows[0]?.modules || []

            // Se for Master, vê o próprio tenant + Immaculata (exceto ADM e filtrando por módulos)
            query = `
                SELECT * FROM app.access_groups 
                WHERE (tenant_id = $1 OR tenant_id = $2) 
                AND code != 'ADM' 
                AND (modules IS NULL OR modules = '{}' OR modules && $3)
            `
            params = [tenantId, masterTenantId, tenantModules]
        } else {
            // Se não for master, vê apenas os grupos do próprio tenant
            query = 'SELECT * FROM app.access_groups WHERE tenant_id = $1'
            params = [tenantId]
        }

        query += ' ORDER BY name ASC'

        const result = await pool.query(query, params)
        
        const groups = result.rows.map(row => ({
            id: row.uuid,
            uuid: row.uuid,
            seqId: row.seq_id,
            name: row.name,
            code: row.code,
            description: row.description,
            features: row.features || [],
            permissions: row.permissions || [],
            modules: row.modules || [],
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by
        }))
        return res.json(groups)
    } catch (error) {
        console.error('[ACCESS_GROUP_ROUTES] Error listing groups:', error)
        return res.status(500).json({ message: 'Erro ao listar grupos de acesso' })
    }
})

accessGroupRoutes.post('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { name, code, description, features, permissions, modules } = req.body

        const result = await pool.query(
            `INSERT INTO app.access_groups (tenant_id, name, code, description, features, permissions, modules, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                tenantId,
                name,
                code,
                description,
                features || [],
                JSON.stringify(permissions || []),
                modules || [],
                req.user!.uuid
            ]
        )

        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            uuid: row.uuid,
            ...row,
            permissions: row.permissions,
            modules: row.modules || []
        })
    } catch (error) {
        console.error('[ACCESS_GROUP_ROUTES] Error creating group:', error)
        return res.status(500).json({ message: 'Erro ao criar grupo de acesso' })
    }
})

accessGroupRoutes.put('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        const { name, code, description, features, permissions, modules } = req.body

        const result = await pool.query(
            `UPDATE app.access_groups SET 
                name = COALESCE($2, name),
                code = COALESCE($3, code),
                description = COALESCE($4, description),
                features = COALESCE($5, features),
                permissions = COALESCE($6, permissions),
                modules = COALESCE($7, modules),
                updated_by = $8,
                updated_at = NOW()
             WHERE uuid = $1
             RETURNING *`,
            [
                id,
                name,
                code,
                description,
                features,
                permissions ? JSON.stringify(permissions) : null,
                modules,
                req.user!.uuid
            ]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Grupo não encontrado' })
        }

        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            uuid: row.uuid,
            ...row,
            permissions: row.permissions,
            modules: row.modules || []
        })
    } catch (error) {
        console.error('[ACCESS_GROUP_ROUTES] Error updating group:', error)
        return res.status(500).json({ message: 'Erro ao atualizar grupo de acesso' })
    }
})

accessGroupRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params

        const result = await pool.query(
            'DELETE FROM app.access_groups WHERE uuid = $1',
            [id]
        )

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Grupo não encontrado' })
        }

        return res.status(204).send()
    } catch (error) {
        console.error('[ACCESS_GROUP_ROUTES] Error deleting group:', error)
        return res.status(500).json({ message: 'Erro ao excluir grupo de acesso' })
    }
})

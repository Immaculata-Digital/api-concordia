import { Router } from 'express'
import { pool } from '../../../infra/database/pool'

export const accessGroupRoutes = Router()

accessGroupRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const result = await pool.query('SELECT * FROM app.access_groups WHERE tenant_id = $1', [tenantId])
        // Mapear campos para compatibilidade com o front-end se necessário
        const groups = result.rows.map(row => ({
            id: row.uuid,
            uuid: row.uuid,
            seqId: row.seq_id,
            name: row.name,
            code: row.code,
            description: row.description,
            features: row.features || [],
            permissions: row.permissions || [],
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
        const { name, code, description, features, permissions } = req.body

        const result = await pool.query(
            `INSERT INTO app.access_groups (tenant_id, name, code, description, features, permissions, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                tenantId,
                name,
                code,
                description,
                features || [],
                JSON.stringify(permissions || []),
                req.user!.uuid
            ]
        )

        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            uuid: row.uuid,
            ...row,
            permissions: row.permissions
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
        const { name, code, description, features, permissions } = req.body

        const result = await pool.query(
            `UPDATE app.access_groups SET 
                name = COALESCE($3, name),
                code = COALESCE($4, code),
                description = COALESCE($5, description),
                features = COALESCE($6, features),
                permissions = COALESCE($7, permissions),
                updated_by = $8,
                updated_at = NOW()
             WHERE tenant_id = $1 AND uuid = $2
             RETURNING *`,
            [
                tenantId,
                id,
                name,
                code,
                description,
                features,
                permissions ? JSON.stringify(permissions) : null,
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
            permissions: row.permissions
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
            'DELETE FROM app.access_groups WHERE tenant_id = $1 AND uuid = $2',
            [tenantId, id]
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

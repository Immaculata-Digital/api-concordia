import { pool } from '../../../infra/database/pool'
import { randomUUID } from 'crypto'

export interface ProdutoCategoriaProps {
    uuid: string
    seqId?: number
    code: string
    tenantId: string | null
    name: string
    description?: string
    icon: string
    sort: number
    enabled: boolean
    createdAt: Date
    updatedAt: Date
}

export class PostgresProdutoCategoriaRepository {
    async findAll(tenantId: string): Promise<ProdutoCategoriaProps[]> {
        const query = `
            SELECT * FROM app.produtos_categoria_category_enum 
            WHERE (tenant_id = $1 OR tenant_id IS NULL) 
            AND enabled = true
            ORDER BY sort ASC, name ASC
        `
        const { rows } = await pool.query(query, [tenantId])
        return rows.map(this.mapToProps)
    }

    async findByCode(tenantId: string, code: string): Promise<ProdutoCategoriaProps | null> {
        const query = `
            SELECT * FROM app.produtos_categoria_category_enum 
            WHERE (tenant_id = $1 OR tenant_id IS NULL) AND code = $2
        `
        const { rows } = await pool.query(query, [tenantId, code])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async create(data: Partial<ProdutoCategoriaProps> & { tenantId: string }): Promise<ProdutoCategoriaProps> {
        const uuid = randomUUID()
        const query = `
            INSERT INTO app.produtos_categoria_category_enum (
                uuid, code, tenant_id, name, description, icon, sort, enabled
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `
        const values = [
            uuid, data.code, data.tenantId, data.name, data.description,
            data.icon || 'Notification', data.sort || 0, data.enabled ?? true
        ]
        const { rows } = await pool.query(query, values)
        return this.mapToProps(rows[0])
    }

    async update(uuid: string, tenantId: string, data: Partial<ProdutoCategoriaProps>): Promise<ProdutoCategoriaProps> {
        const query = `
            UPDATE app.produtos_categoria_category_enum SET 
                name = COALESCE($3, name),
                description = COALESCE($4, description),
                icon = COALESCE($5, icon),
                sort = COALESCE($6, sort),
                enabled = COALESCE($7, enabled),
                updated_at = NOW()
            WHERE uuid = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
            RETURNING *
        `
        const values = [
            uuid, tenantId, data.name, data.description,
            data.icon, data.sort, data.enabled
        ]
        const { rows } = await pool.query(query, values)
        return this.mapToProps(rows[0])
    }

    async delete(uuid: string, tenantId: string): Promise<void> {
        const query = `
            DELETE FROM app.produtos_categoria_category_enum 
            WHERE uuid = $1 AND tenant_id = $2
        `
        await pool.query(query, [uuid, tenantId])
    }

    private mapToProps(row: any): ProdutoCategoriaProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            code: row.code,
            tenantId: row.tenant_id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            sort: row.sort,
            enabled: row.enabled,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    }
}

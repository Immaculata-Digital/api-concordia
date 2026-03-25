import { pool } from '../../../infra/database/pool'
import { generateUUID } from '../../../utils/uuid'

export interface ProdutoCategoriaProps {
    uuid: string
    seqId?: number
    code: string
    tenantId: string | null
    name: string
    description?: string
    icon: string
    image_url?: string
    parent_uuid?: string
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
        const uuid = generateUUID()
        const query = `
            INSERT INTO app.produtos_categoria_category_enum (
                uuid, code, tenant_id, name, description, icon, image_url, parent_uuid, sort, enabled
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `
        const values = [
            uuid, data.code, data.tenantId, data.name, data.description,
            data.icon || 'Notification', data.image_url, data.parent_uuid, 
            data.sort || 0, data.enabled ?? true
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
                image_url = COALESCE($6, image_url),
                parent_uuid = COALESCE($7, parent_uuid),
                sort = COALESCE($8, sort),
                enabled = COALESCE($9, enabled),
                updated_at = NOW()
            WHERE uuid = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
            RETURNING *
        `
        const values = [
            uuid, tenantId, data.name, data.description,
            data.icon, data.image_url, data.parent_uuid, 
            data.sort, data.enabled
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
            image_url: row.image_url,
            parent_uuid: row.parent_uuid,
            sort: row.sort,
            enabled: row.enabled,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }
    }
}

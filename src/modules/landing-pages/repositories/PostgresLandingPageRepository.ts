import { pool } from '../../../infra/database/pool'
import { LandingPage } from '../domain/LandingPage'

export class PostgresLandingPageRepository {
    private mapRowToDomain(row: any): LandingPage {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            titulo: row.titulo,
            slug: row.slug,
            content: row.content || {},
            ativa: row.ativa,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async listByTenantId(tenantId: string): Promise<LandingPage[]> {
        const result = await pool.query(
            'SELECT * FROM app.landing_pages WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenantId]
        )
        return result.rows.map(row => this.mapRowToDomain(row))
    }

    async getByUuid(uuid: string, tenantId: string): Promise<LandingPage | null> {
        const result = await pool.query(
            'SELECT * FROM app.landing_pages WHERE uuid = $1 AND tenant_id = $2',
            [uuid, tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async create(data: Partial<LandingPage>): Promise<LandingPage> {
        const result = await pool.query(
            `INSERT INTO app.landing_pages (tenant_id, titulo, slug, content, ativa, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $6)
             RETURNING *`,
            [
                data.tenantId, 
                data.titulo, 
                data.slug, 
                JSON.stringify(data.content), 
                data.ativa ?? true, 
                data.createdBy
            ]
        )
        return this.mapRowToDomain(result.rows[0])
    }

    async update(uuid: string, tenantId: string, data: Partial<LandingPage>): Promise<LandingPage | null> {
        const fields: string[] = []
        const values: any[] = []
        let idx = 1

        if (data.titulo !== undefined) {
            fields.push(`titulo = $${idx++}`)
            values.push(data.titulo)
        }
        if (data.slug !== undefined) {
            fields.push(`slug = $${idx++}`)
            values.push(data.slug)
        }
        if (data.content !== undefined) {
            fields.push(`content = $${idx++}`)
            values.push(JSON.stringify(data.content))
        }
        if (data.ativa !== undefined) {
            fields.push(`ativa = $${idx++}`)
            values.push(data.ativa)
        }
        
        fields.push(`updated_by = $${idx++}`)
        values.push(data.updatedBy)
        
        fields.push(`updated_at = NOW()`)

        if (fields.length === 2) return null // Only updated_by and updated_at

        values.push(uuid)
        values.push(tenantId)

        const query = `
            UPDATE app.landing_pages 
            SET ${fields.join(', ')} 
            WHERE uuid = $${idx++} AND tenant_id = $${idx++}
            RETURNING *
        `

        const result = await pool.query(query, values)
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async delete(uuid: string, tenantId: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM app.landing_pages WHERE uuid = $1 AND tenant_id = $2',
            [uuid, tenantId]
        )
        return (result.rowCount ?? 0) > 0
    }
}

import { pool } from '../../../infra/database/pool'
import { Tenant, TenantProps } from '../entities/Tenant'
import { ITenantRepository } from './ITenantRepository'

export class PostgresTenantRepository implements ITenantRepository {
    private async mapRowToProps(row: any): Promise<TenantProps> {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            name: row.name,
            slug: row.slug,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async findAll(): Promise<TenantProps[]> {
        const result = await pool.query('SELECT * FROM app.tenants ORDER BY created_at DESC')
        return Promise.all(result.rows.map(row => this.mapRowToProps(row)))
    }

    async findById(uuid: string): Promise<TenantProps | null> {
        const result = await pool.query('SELECT * FROM app.tenants WHERE uuid = $1', [uuid])
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async findBySlug(slug: string): Promise<TenantProps | null> {
        const result = await pool.query('SELECT * FROM app.tenants WHERE slug = $1', [slug])
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async create(tenant: Tenant): Promise<TenantProps> {
        const data = tenant.toJSON()
        const result = await pool.query(
            `INSERT INTO app.tenants (
                uuid, name, slug, created_by, updated_by, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.createdBy, data.updatedBy, data.createdAt, data.updatedAt
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async update(tenant: Tenant): Promise<TenantProps> {
        const data = tenant.toJSON()
        const result = await pool.query(
            `UPDATE app.tenants SET
                name = $2, slug = $3, updated_by = $4, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.updatedBy
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.tenants WHERE uuid = $1', [uuid])
    }
}

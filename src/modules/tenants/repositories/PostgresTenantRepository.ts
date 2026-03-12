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
            modules: row.modules || [],
            pessoaId: row.pessoa_id || null,
            logo: row.logo || null,
            category: row.category || 'Sem Categoria',
        }
    }

    async findAll(): Promise<TenantProps[]> {
        const result = await pool.query(`
            SELECT 
                t.*,
                COALESCE(ta.latitude, pa.latitude) as latitude,
                COALESCE(ta.longitude, pa.longitude) as longitude,
                COALESCE(ta.plus_code, pa.plus_code) as plus_code
            FROM app.tenants t
            LEFT JOIN app.tenant_addresses ta ON ta.tenant_id = t.uuid
            LEFT JOIN app.people_addresses pa ON pa.people_id = t.pessoa_id
            ORDER BY t.created_at DESC
        `)
        return result.rows.map(row => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            name: row.name,
            slug: row.slug,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            modules: row.modules || [],
            pessoaId: row.pessoa_id || null,
            logo: row.logo || null,
            category: row.category || 'Sem Categoria',
            latitude: (row.latitude !== null && row.latitude !== undefined) ? parseFloat(row.latitude) : null,
            longitude: (row.longitude !== null && row.longitude !== undefined) ? parseFloat(row.longitude) : null,
            plusCode: row.plus_code
        }))
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
                uuid, name, slug, created_by, updated_by, created_at, updated_at, modules, logo, category
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.createdBy, data.updatedBy, data.createdAt, data.updatedAt, data.modules || [], data.logo || null, data.category || 'Sem Categoria'
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async update(tenant: Tenant): Promise<TenantProps> {
        const data = tenant.toJSON()
        const result = await pool.query(
            `UPDATE app.tenants SET
                name = $2, slug = $3, updated_by = $4, modules = $5, logo = $6, category = $7, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.updatedBy, data.modules || [], data.logo || null, data.category || 'Sem Categoria'
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.tenants WHERE uuid = $1', [uuid])
    }
}

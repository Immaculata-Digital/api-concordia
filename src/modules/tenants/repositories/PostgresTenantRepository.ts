import { pool } from '../../../infra/database/pool'
import { Tenant, TenantProps } from '../entities/Tenant'
import { ITenantRepository } from './ITenantRepository'

export class PostgresTenantRepository implements ITenantRepository {
    private async mapRowToProps(row: any): Promise<TenantProps> {
        let brand_settings = row.brand_settings || null;
        if (brand_settings) {
            const { palette, typography, ...clean } = brand_settings;
            brand_settings = clean;
        }

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
            brand_settings,
            description: row.description || null,
            pluvyt_points_per_spent: row.pluvyt_points_per_spent ? parseFloat(row.pluvyt_points_per_spent) : 10
        }
    }

    async findAll(): Promise<TenantProps[]> {
        const result = await pool.query(`
            SELECT 
                t.*,
                COALESCE(ta.latitude, pa.latitude) as latitude,
                COALESCE(ta.longitude, pa.longitude) as longitude,
                COALESCE(ta.plus_code, pa.plus_code) as plus_code,
                COALESCE(ta.street, pa.street) as street,
                COALESCE(ta.number, pa.number) as number,
                COALESCE(ta.complement, pa.complement) as complement,
                COALESCE(ta.neighborhood, pa.neighborhood) as neighborhood,
                COALESCE(ta.city, pa.city) as city,
                COALESCE(ta.state, pa.state) as state,
                COALESCE(ta.postal_code, pa.postal_code) as postal_code
            FROM app.tenants t
            LEFT JOIN app.tenant_addresses ta ON ta.tenant_id = t.uuid
            LEFT JOIN app.people_addresses pa ON pa.people_id = t.pessoa_id
            ORDER BY t.created_at DESC
        `)
        return result.rows.map(row => {
            const addressParts = [
                row.street,
                row.number ? `, ${row.number}` : '',
                row.complement ? ` - ${row.complement}` : '',
                row.neighborhood ? ` - ${row.neighborhood}` : '',
                row.city ? ` - ${row.city}` : '',
                row.state ? `/${row.state}` : '',
                row.postal_code ? ` - CEP: ${row.postal_code}` : ''
            ].filter(Boolean);

            const fullAddress = addressParts.join('').trim().replace(/^[ ,-]+|[ ,-]+$/g, '');

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
                brand_settings: (() => {
                    if (!row.brand_settings) return null;
                    const { palette, typography, ...clean } = row.brand_settings;
                    return clean;
                })(),
                description: row.description || null,
                pluvyt_points_per_spent: row.pluvyt_points_per_spent ? parseFloat(row.pluvyt_points_per_spent) : 10,
                latitude: (row.latitude !== null && row.latitude !== undefined) ? parseFloat(row.latitude) : null,
                longitude: (row.longitude !== null && row.longitude !== undefined) ? parseFloat(row.longitude) : null,
                plusCode: row.plus_code,
                fullAddress: fullAddress || null
            } as any;
        });
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
                uuid, name, slug, created_by, updated_by, created_at, updated_at, modules, logo, category, brand_settings, description, pluvyt_points_per_spent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.createdBy, data.updatedBy, data.createdAt, data.updatedAt, 
                data.modules || [], data.logo || null, data.category || 'Sem Categoria', data.brand_settings || null, 
                data.description || null, data.pluvyt_points_per_spent || 10

            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async update(tenant: Tenant): Promise<TenantProps> {
        const data = tenant.toJSON()
        const result = await pool.query(
            `UPDATE app.tenants SET
                name = $2, slug = $3, updated_by = $4, modules = $5, logo = $6, category = $7, 
                brand_settings = $8, description = $9, pluvyt_points_per_spent = $10, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *`,
            [
                data.uuid, data.name, data.slug, data.updatedBy, data.modules || [], 
                data.logo || null, data.category || 'Sem Categoria', data.brand_settings || null, 
                data.description || null, data.pluvyt_points_per_spent || 10

            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.tenants WHERE uuid = $1', [uuid])
    }
}

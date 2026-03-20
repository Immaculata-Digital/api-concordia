import { pool } from '../../../infra/database/pool'
import { Brand } from '../entities/Brand'
import { IBrandRepository } from './IBrandRepository'

export class PostgresBrandRepository implements IBrandRepository {
    private mapRowToDomain(row: any): Brand {
        const settings = row.brand_settings || {};
        
        return {
            logo: {
                principal: settings.logo?.principal || '',
                favicon: settings.logo?.favicon || '',
            },
            cor_principal: settings.cor_principal || '',
            social: {
                facebook: settings.social?.facebook || '',
                instagram: settings.social?.instagram || '',
                x: settings.social?.x || '',
                linkedin: settings.social?.linkedin || '',
                youtube: settings.social?.youtube || '',
                threads: settings.social?.threads || '',
            }
        };
    }

    async getConfigByTenantId(tenantId: string): Promise<Brand | null> {
        const result = await pool.query(
            `SELECT brand_settings FROM app.tenants WHERE uuid = $1 LIMIT 1`,
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async getConfigByTenantSlug(slug: string): Promise<Brand | null> {
        const result = await pool.query(
            `SELECT brand_settings FROM app.tenants WHERE slug = $1 LIMIT 1`,
            [slug]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async upsertConfig(tenantId: string, contentToMerge: Partial<Brand>, userId: string): Promise<Brand> {
        const query = `
            UPDATE app.tenants 
            SET 
                brand_settings = (COALESCE(brand_settings, '{}'::jsonb) || $2) - 'palette' - 'typography',
                updated_by = $3,
                updated_at = NOW()
            WHERE uuid = $1
            RETURNING brand_settings
        `;
        
        const params = [tenantId, JSON.stringify(contentToMerge), userId];
        const result = await pool.query(query, params);
        
        return this.mapRowToDomain(result.rows[0]);
    }
}

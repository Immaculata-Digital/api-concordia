import { pool } from '../../../infra/database/pool'
import { BrandConfig, BrandConfigContent } from '../domain/BrandConfig'
import { IBrandRepository } from './IBrandRepository'

export class PostgresBrandRepository implements IBrandRepository {
    private mapRowToDomain(row: any): BrandConfig {
        return {
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            content: row.content || {},
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async getConfigByTenantId(tenantId: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            'SELECT uuid as tenant_id, brand_settings as content, created_at, updated_at FROM app.tenants WHERE uuid = $1',
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async getConfigByTenantSlug(slug: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            'SELECT uuid as tenant_id, brand_settings as content, created_at, updated_at FROM app.tenants WHERE slug = $1',
            [slug]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async upsertConfig(tenantId: string, contentToMerge: Partial<BrandConfigContent>, userId: string): Promise<BrandConfig> {
        const result = await pool.query(
            `UPDATE app.tenants SET 
                brand_settings = COALESCE(brand_settings, '{}'::jsonb) || $2,
                updated_by = $3,
                updated_at = NOW()
             WHERE uuid = $1
             RETURNING uuid as tenant_id, brand_settings as content, created_at, updated_at`,
            [tenantId, JSON.stringify(contentToMerge), userId]
        )
        return this.mapRowToDomain(result.rows[0])
    }
}

import { pool } from '../../../infra/database/pool'
import { BrandConfig, BrandConfigContent } from '../domain/BrandConfig'
import { IBrandRepository } from './IBrandRepository'

export class PostgresBrandRepository implements IBrandRepository {
    private mapRowToDomain(row: any): BrandConfig {
        return {
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            content: {
                ...(row.content || {}),
                social: row.social_media || {},
                description: row.description || '',
                name: row.name || '',
                category: row.category || ''
            },
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async getConfigByTenantId(tenantId: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            'SELECT uuid as tenant_id, brand_settings as content, social_media, description, name, category, created_at, updated_at FROM app.tenants WHERE uuid = $1',
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async getConfigByTenantSlug(slug: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            'SELECT uuid as tenant_id, brand_settings as content, social_media, description, name, category, created_at, updated_at FROM app.tenants WHERE slug = $1',
            [slug]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async upsertConfig(tenantId: string, contentToMerge: Partial<BrandConfigContent>, userId: string): Promise<BrandConfig> {
        const { social, ...restContent } = contentToMerge;
        
        let query = `UPDATE app.tenants SET 
            brand_settings = COALESCE(brand_settings, '{}'::jsonb) || $2,
            updated_by = $3,
            updated_at = NOW()`;
        
        const params: any[] = [tenantId, JSON.stringify(restContent), userId];
        
        if (social) {
            params.push(JSON.stringify(social));
            query += `, social_media = COALESCE(social_media, '{}'::jsonb) || $${params.length}`;
        }

        query += ` WHERE uuid = $1
                  RETURNING 
                    uuid as tenant_id, 
                    brand_settings as content, 
                    social_media,
                    created_at, 
                    updated_at`;

        const result = await pool.query(query, params);
        return this.mapRowToDomain(result.rows[0]);
    }
}

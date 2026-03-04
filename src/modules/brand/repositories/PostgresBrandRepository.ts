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
            'SELECT * FROM configuracoes_brand WHERE tenant_id = $1',
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async upsertConfig(tenantId: string, contentToMerge: Partial<BrandConfigContent>, userId: string): Promise<BrandConfig> {
        // The || operator in JSONB performs a shallow merge of the top-level keys.
        // For deeper merges if needed in the future, a more complex SQL function or application-layer merge is required.
        // Since we are updating specific keys like {"logo": {...}}, shallow merge at the root is sufficient.
        const result = await pool.query(
            `INSERT INTO configuracoes_brand (tenant_id, content, created_by, updated_by)
             VALUES ($1, $2, $3, $3)
             ON CONFLICT (tenant_id)
             DO UPDATE SET 
                content = configuracoes_brand.content || EXCLUDED.content,
                updated_by = EXCLUDED.updated_by,
                updated_at = NOW()
             RETURNING *`,
            [tenantId, JSON.stringify(contentToMerge), userId]
        )
        return this.mapRowToDomain(result.rows[0])
    }
}

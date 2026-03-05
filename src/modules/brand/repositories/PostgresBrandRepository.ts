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
        const existing = await this.getConfigByTenantId(tenantId)

        if (existing) {
            const result = await pool.query(
                `UPDATE configuracoes_brand SET 
                    content = content || $2,
                    updated_by = $3,
                    updated_at = NOW()
                 WHERE tenant_id = $1
                 RETURNING *`,
                [tenantId, JSON.stringify(contentToMerge), userId]
            )
            return this.mapRowToDomain(result.rows[0])
        }

        const result = await pool.query(
            `INSERT INTO configuracoes_brand (tenant_id, content, created_by, updated_by)
             VALUES ($1, $2, $3, $3)
             RETURNING *`,
            [tenantId, JSON.stringify(contentToMerge), userId]
        )
        return this.mapRowToDomain(result.rows[0])
    }
}

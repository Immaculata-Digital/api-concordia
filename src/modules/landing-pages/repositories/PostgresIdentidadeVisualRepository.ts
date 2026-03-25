import { pool } from '../../../infra/database/pool'
import { IdentidadeVisual, IdentidadeVisualContent } from '../entities/IdentidadeVisual'

export class PostgresIdentidadeVisualRepository {
    private mapRowToDomain(row: any): IdentidadeVisual {
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

    async getConfigByTenantId(tenantId: string): Promise<IdentidadeVisual | null> {
        const result = await pool.query(
            'SELECT * FROM app.site_identidade_visual WHERE tenant_id = $1',
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async upsertConfig(tenantId: string, contentToMerge: Partial<IdentidadeVisualContent>, userId: string): Promise<IdentidadeVisual> {
        // Use a CTE (Common Table Expression) to perform a "safe" upsert that doesn't strictly depend on a UNIQUE constraint for ON CONFLICT.
        // This is more robust if the migration to add the UNIQUE constraint hasn't been verified.
        const result = await pool.query(
            `WITH upsert AS (
                UPDATE app.site_identidade_visual 
                SET content = content || $2, 
                    updated_by = $3, 
                    updated_at = NOW() 
                WHERE tenant_id = $1 
                RETURNING *
             ),
             insertion AS (
                INSERT INTO app.site_identidade_visual (tenant_id, content, created_by, updated_by)
                SELECT $1, $2, $3, $3
                WHERE NOT EXISTS (SELECT 1 FROM upsert)
                RETURNING *
             )
             SELECT * FROM upsert
             UNION ALL
             SELECT * FROM insertion`,
            [tenantId, JSON.stringify(contentToMerge), userId]
        )
        return this.mapRowToDomain(result.rows[0])
    }
}

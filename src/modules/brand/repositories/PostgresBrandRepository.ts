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
                category: row.category || '',
                tenantInfo: {
                    name: row.tenant_name,
                    document: row.document,
                    address: row.street ? {
                        street: row.street,
                        number: row.number,
                        complement: row.complement,
                        neighborhood: row.neighborhood,
                        city: row.city,
                        state: row.state,
                        postalCode: row.postal_code
                    } : undefined,
                    phone: row.phone
                }
            },
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async getConfigByTenantId(tenantId: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            `SELECT 
                t.uuid as tenant_id, 
                t.name as tenant_name,
                t.description,
                t.category,
                p.cpf_cnpj as document,
                t.brand_settings as content, 
                t.social_media,
                t.created_at, 
                t.updated_at,
                COALESCE(ta.street, pa.street) as street,
                COALESCE(ta.number, pa.number) as number,
                COALESCE(ta.complement, pa.complement) as complement,
                COALESCE(ta.neighborhood, pa.neighborhood) as neighborhood,
                COALESCE(ta.city, pa.city) as city,
                COALESCE(ta.state, pa.state) as state,
                COALESCE(ta.postal_code, pa.postal_code) as postal_code,
                pc.contact_value as phone
            FROM app.tenants t
            LEFT JOIN app.people p ON p.uuid = t.pessoa_id
            LEFT JOIN app.tenant_addresses ta ON ta.tenant_id = t.uuid
            LEFT JOIN app.people_addresses pa ON pa.people_id = t.pessoa_id
            LEFT JOIN (
                SELECT DISTINCT ON (people_id) people_id, contact_value
                FROM app.people_contacts
                WHERE contact_type NOT IN ('email', 'EMAIL')
                ORDER BY people_id, is_default DESC, created_at DESC
            ) pc ON pc.people_id = t.pessoa_id
            WHERE t.uuid = $1
            LIMIT 1`,
            [tenantId]
        )
        return result.rows[0] ? this.mapRowToDomain(result.rows[0]) : null
    }

    async getConfigByTenantSlug(slug: string): Promise<BrandConfig | null> {
        const result = await pool.query(
            `SELECT 
                t.uuid as tenant_id, 
                t.name as tenant_name,
                t.description,
                t.category,
                p.cpf_cnpj as document,
                t.brand_settings as content, 
                t.social_media,
                t.created_at, 
                t.updated_at,
                COALESCE(ta.street, pa.street) as street,
                COALESCE(ta.number, pa.number) as number,
                COALESCE(ta.complement, pa.complement) as complement,
                COALESCE(ta.neighborhood, pa.neighborhood) as neighborhood,
                COALESCE(ta.city, pa.city) as city,
                COALESCE(ta.state, pa.state) as state,
                COALESCE(ta.postal_code, pa.postal_code) as postal_code,
                pc.contact_value as phone
            FROM app.tenants t
            LEFT JOIN app.people p ON p.uuid = t.pessoa_id
            LEFT JOIN app.tenant_addresses ta ON ta.tenant_id = t.uuid
            LEFT JOIN app.people_addresses pa ON pa.people_id = t.pessoa_id
            LEFT JOIN (
                SELECT DISTINCT ON (people_id) people_id, contact_value
                FROM app.people_contacts
                WHERE contact_type NOT IN ('email', 'EMAIL')
                ORDER BY people_id, is_default DESC, created_at DESC
            ) pc ON pc.people_id = t.pessoa_id
            WHERE t.slug = $1
            LIMIT 1`,
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

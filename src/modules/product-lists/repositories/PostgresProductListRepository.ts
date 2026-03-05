import { pool } from '../../../infra/database/pool'
import { ProductList, ProductListProps } from '../entities/ProductList'

export class PostgresProductListRepository {
    async create(list: ProductList): Promise<ProductListProps> {
        const data = list.toJSON()
        const query = `
            INSERT INTO app.product_lists (
                uuid, tenant_id, name, product_uuids, 
                created_at, created_by, updated_at, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `
        const values = [
            data.uuid, data.tenant_id, data.name, data.product_uuids,
            data.created_at, data.created_by, data.updated_at, data.updated_by
        ]

        const result = await pool.query(query, values)
        return result.rows[0]
    }

    async findAll(tenantId: string): Promise<ProductListProps[]> {
        const query = `
            SELECT * FROM app.product_lists
            WHERE tenant_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
        `
        const result = await pool.query(query, [tenantId])
        return result.rows
    }

    async findById(uuid: string, tenantId: string): Promise<ProductListProps | null> {
        const query = `
            SELECT * FROM app.product_lists
            WHERE uuid = $1 AND tenant_id = $2 AND deleted_at IS NULL
        `
        const result = await pool.query(query, [uuid, tenantId])
        return result.rows[0] || null
    }

    async update(list: ProductList): Promise<ProductListProps> {
        const data = list.toJSON()
        const query = `
            UPDATE app.product_lists
            SET name = $1, product_uuids = $2, updated_at = $3, updated_by = $4
            WHERE uuid = $5 AND deleted_at IS NULL
            RETURNING *
        `
        const values = [
            data.name, data.product_uuids, data.updated_at, data.updated_by, data.uuid
        ]
        const result = await pool.query(query, values)
        return result.rows[0]
    }

    async delete(uuid: string, tenantId: string): Promise<void> {
        const query = `
            UPDATE app.product_lists
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE uuid = $1 AND tenant_id = $2
        `
        await pool.query(query, [uuid, tenantId])
    }

    // Retorna detalhes completos dos produtos pertencentes a uma lista
    async getDetailedProducts(productUuids: string[], tenantId: string): Promise<any[]> {
        if (!productUuids || productUuids.length === 0) return []
        
        const query = `
            SELECT 
                p.uuid, 
                p.nome, 
                cat.name as categoria_nome, 
                m.url as image_url, 
                m.arquivo as image_base64
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN LATERAL (
                SELECT url, arquivo 
                FROM app.produtos_media 
                WHERE produto_id = p.uuid 
                AND deleted_at IS NULL
                ORDER BY ordem ASC 
                LIMIT 1
            ) m ON true
            WHERE p.uuid = ANY($1) 
            AND p.tenant_id = $2 
            AND p.deleted_at IS NULL
        `
        const result = await pool.query(query, [productUuids, tenantId])
        return result.rows
    }
}

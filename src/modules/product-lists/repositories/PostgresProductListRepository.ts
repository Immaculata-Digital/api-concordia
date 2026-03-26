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

    async findAll(tenantId: string, view?: string): Promise<ProductListProps[]> {
        let query = `
            SELECT pl.* FROM app.product_lists pl
            WHERE pl.tenant_id = $1 AND pl.deleted_at IS NULL
        `
        const values: any[] = [tenantId]

        if (view) {
            query += `
                AND EXISTS (
                    SELECT 1 FROM app.produtos p
                    WHERE p.uuid = ANY(pl.product_uuids)
                    AND $2 = ANY(p.views)
                    AND p.deleted_at IS NULL
                )
            `
            values.push(view)
        }

        query += ` ORDER BY pl.created_at DESC`
        
        const result = await pool.query(query, values)
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

    async getDetailedProducts(productUuids: string[], tenantId: string): Promise<any[]> {
        if (!productUuids || productUuids.length === 0) return []
        
        const query = `
            SELECT 
                p.uuid, 
                p.nome, 
                p.codigo as sku,
                cat.name as categoria_nome,
                (SELECT slug FROM app.produtos_seo WHERE produto_id = p.uuid AND tenant_id = p.tenant_id LIMIT 1) as seo_slug,
                COALESCE(
                    (SELECT array_agg(COALESCE(m.url, m.arquivo) ORDER BY m.ordem ASC)
                     FROM app.produtos_media m
                     WHERE m.produto_id = p.uuid),
                    '{}'
                ) as images,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                         'uuid', v_p.uuid,
                         'nome', v_p.nome,
                         'sku', v_p.codigo
                     ))
                     FROM app.produtos v_p
                     JOIN app.produtos_variacoes v ON v.produto_filho_id = v_p.uuid
                     WHERE v.produto_pai_id = p.uuid AND v_p.deleted_at IS NULL),
                    '[]'
                ) as variants,
                pr.preco
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON p.categoria_code = cat.code AND (p.tenant_id = cat.tenant_id OR cat.tenant_id IS NULL)
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid AND p.tenant_id = pr.tenant_id
            WHERE p.uuid = ANY($1) 
            AND p.tenant_id = $2 
            AND p.deleted_at IS NULL
        `
        const result = await pool.query(query, [productUuids, tenantId])
        return result.rows
    }
}

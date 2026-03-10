import { pool } from '../../../infra/database/pool'
import { Produto, ProdutoProps } from '../entities/Produto'

export class PostgresProdutoRepository {
    async findAll(tenantId?: string, viewContext?: string, limit?: number, offset?: number, categoria_code?: string): Promise<ProdutoProps[]> {
        let query = `
            SELECT p.*, 
                   p.nome as produto_nome,
                   cat.name as categoria_nome,
                   pr.preco as produto_preco,
                   (SELECT COALESCE(m.arquivo, m.url) 
                    FROM app.produtos_media m 
                    WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem' 
                    ORDER BY m.ordem ASC LIMIT 1) as produto_imagem,
                   m.url as image_url, m.arquivo as image_base64,
                   (SELECT json_agg(json_build_object('chave', ft.chave, 'valor', ft.valor, 'ordem', ft.sort))
                    FROM app.produtos_ficha_tecnica ft
                    WHERE ft.produto_id = p.uuid) as ficha_tecnica
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid AND (pr.tenant_id = p.tenant_id OR p.tenant_id IS NULL)
            LEFT JOIN LATERAL (
                SELECT url, arquivo 
                FROM app.produtos_media 
                WHERE produto_id = p.uuid 
                ORDER BY ordem ASC 
                LIMIT 1
            ) m ON true
            WHERE p.deleted_at IS NULL
        `
        const values: any[] = []
        let idx = 1

        if (tenantId) {
            query += ` AND p.tenant_id = $${idx}`
            values.push(tenantId)
            idx++
        }

        if (viewContext) {
            if (viewContext === 'list') {
                query += ` AND ($${idx} = ANY(p.views) OR p.views IS NULL OR p.views = '{}')`
            } else {
                query += ` AND $${idx} = ANY(p.views)`
            }

            values.push(viewContext)
            idx++
        }

        if (categoria_code) {
            query += ` AND p.categoria_code = $${idx}`
            values.push(categoria_code)
            idx++
        }

        if (limit) {
            query += ` LIMIT $${idx}`
            values.push(limit)
            idx++
        }

        if (offset) {
            query += ` OFFSET $${idx}`
            values.push(offset)
            idx++
        }

        const { rows } = await pool.query(query, values)
        return rows.map((row: any) => this.mapToProps(row))
    }

    async findById(uuid: string): Promise<ProdutoProps | null> {
        const query = `
            SELECT p.*, cat.name as categoria_nome
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            WHERE p.uuid = $1 AND p.deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [uuid])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async create(produto: Produto): Promise<ProdutoProps> {
        const props = this.normalizeEmptyStrings(produto.toJSON())
        const query = `
            INSERT INTO app.produtos (
                uuid, tenant_id, nome, codigo, unidade, marca, 
                tipo_code, situacao_code, classe_produto_code, categoria_code, 
                garantia, descricao, descricao_complementar, obs, dias_preparacao, tags, views,
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.nome, props.codigo, props.unidade, props.marca,
            props.tipo_code, props.situacao_code, props.classe_produto_code, props.categoria_code,
            props.garantia, props.descricao, props.descricao_complementar, props.obs, props.dias_preparacao, props.tags, props.views || [],
            props.createdBy, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(rows[0].uuid) as Promise<ProdutoProps>
    }

    async update(produto: Produto): Promise<ProdutoProps> {
        const props = this.normalizeEmptyStrings(produto.toJSON())
        const query = `
            UPDATE app.produtos SET 
                nome = $2, codigo = $3, unidade = $4, marca = $5, 
                tipo_code = $6, situacao_code = $7, classe_produto_code = $8, categoria_code = $9, 
                garantia = $10, descricao = $11, descricao_complementar = $12, obs = $13, dias_preparacao = $14, tags = $15, views = $16,
                updated_by = $17, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *
        `
        const values = [
            props.uuid, props.nome, props.codigo, props.unidade, props.marca,
            props.tipo_code, props.situacao_code, props.classe_produto_code, props.categoria_code,
            props.garantia, props.descricao, props.descricao_complementar, props.obs, props.dias_preparacao, props.tags, props.views || [],
            props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(rows[0].uuid) as Promise<ProdutoProps>
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('UPDATE app.produtos SET deleted_at = NOW() WHERE uuid = $1', [uuid])
    }

    async findDistinctViews(tenantId: string): Promise<string[]> {
        const query = `
            SELECT DISTINCT unnest(views) as view
            FROM app.produtos
            WHERE tenant_id = $1 AND deleted_at IS NULL
            ORDER BY view ASC
        `
        const { rows } = await pool.query(query, [tenantId])
        return rows.map(r => r.view).filter(Boolean)
    }

    private normalizeEmptyStrings(props: ProdutoProps): ProdutoProps {
        const normalized = { ...props }
        Object.keys(normalized).forEach(key => {
            const val = (normalized as any)[key]
            if (typeof val === 'string' && val.trim() === '') {
                ; (normalized as any)[key] = null
            }
        })
        return normalized
    }

    private mapToProps(row: any): ProdutoProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            nome: row.nome,
            codigo: row.codigo,
            unidade: row.unidade,
            marca: row.marca,
            tipo_code: row.tipo_code,
            situacao_code: row.situacao_code,
            classe_produto_code: row.classe_produto_code,
            categoria_code: row.categoria_code,
            produtoCategoriaId: row.categoria_code,
            garantia: row.garantia,
            descricao: row.descricao,
            descricao_complementar: row.descricao_complementar,
            obs: row.obs,
            dias_preparacao: row.dias_preparacao,
            tags: row.tags,
            views: row.views,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            produtoNome: row.produto_nome,
            categoriaNome: row.categoria_nome,
            produtoPreco: row.produto_preco,
            produtoImagem: row.produto_imagem,
            produtoId: row.uuid,
            image_url: row.image_url,
            image_base64: row.image_base64,
            fichaTecnica: row.ficha_tecnica || []
        }
    }
}

import { pool } from '../../../infra/database/pool'
import { Produto, ProdutoProps } from '../entities/Produto'

export class PostgresProdutoRepository {
    async findAll(tenantId?: string, viewContext?: string, limit?: number, offset?: number, categoria_code?: string): Promise<ProdutoProps[]> {
        let query = `
            SELECT p.*, 
                   cat.name as categoria_nome,
                   pp.preco as produto_preco,
                   pp.preco_custo as produto_preco_custo,
                   pp.preco_promocional as produto_preco_promocional,
                   cp.ordem as cardapio_ordem,
                   cp.ativo as cardapio_ativo,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_min)/60)::integer as tempo_preparo_min_raw,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_max)/60)::integer as tempo_preparo_max_raw,
                   cp.exibir_tempo_preparo as exibir_tempo_preparo,
                   (SELECT COALESCE(m.arquivo, m.url) 
                    FROM app.produtos_media m 
                    WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem' 
                    ORDER BY m.ordem ASC LIMIT 1) as main_image_url
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON p.categoria_code = cat.code AND (p.tenant_id = cat.tenant_id OR cat.tenant_id IS NULL)
            LEFT JOIN app.produtos_precos pp ON p.uuid = pp.produto_id AND p.tenant_id = pp.tenant_id
            LEFT JOIN app.produtos_cardapio cp ON p.uuid = cp.produto_id AND p.tenant_id = cp.tenant_id
            LEFT JOIN app.produtos_recompensas r ON p.uuid = r.produto_id AND p.tenant_id = r.tenant_id
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
                if (viewContext === 'cardapio') {
                    query += ` AND (cp.ativo IS TRUE)`
                }
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
            SELECT p.*, 
                   cat.name as categoria_nome,
                   pp.preco as produto_preco,
                   pp.preco_custo as produto_preco_custo,
                   pp.preco_promocional as produto_preco_promocional,
                   cp.ordem as cardapio_ordem,
                   cp.ativo as cardapio_ativo,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_min)/60)::integer as tempo_preparo_min_raw,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_max)/60)::integer as tempo_preparo_max_raw,
                   cp.exibir_tempo_preparo as exibir_tempo_preparo,
                   (SELECT COALESCE(m.arquivo, m.url) 
                    FROM app.produtos_media m 
                    WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem' 
                    ORDER BY m.ordem ASC LIMIT 1) as main_image_url
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON p.categoria_code = cat.code AND (p.tenant_id = cat.tenant_id OR cat.tenant_id IS NULL)
            LEFT JOIN app.produtos_precos pp ON p.uuid = pp.produto_id AND p.tenant_id = pp.tenant_id
            LEFT JOIN app.produtos_cardapio cp ON p.uuid = cp.produto_id AND p.tenant_id = cp.tenant_id
            LEFT JOIN app.produtos_recompensas r ON p.uuid = r.produto_id AND p.tenant_id = r.tenant_id
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
            tenantId: row.tenant_id,
            nome: row.nome,
            codigo: row.codigo,
            unidade: row.unidade,
            marca: row.marca,
            tipo_code: row.tipo_code,
            situacao_code: row.situacao_code,
            classe_produto_code: row.classe_produto_code,
            categoria_code: row.categoria_code,
            categoria_nome: row.categoria_nome,
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
            image_url: row.main_image_url || row.image_url,
            precos: {
                preco: row.produto_preco || 0,
                preco_custo: row.produto_preco_custo || 0,
                preco_promocional: row.produto_preco_promocional || 0
            },
            cardapio: {
                uuid: row.cardapio_uuid,
                ordem: row.cardapio_ordem || 0,
                ativo: row.cardapio_ativo ?? true,
                tempoPreparo_min: row.tempo_preparo_min_raw ?? 0,
                tempoPreparo_max: row.tempo_preparo_max_raw ?? 0,
                exibir_tempo_preparo: row.exibir_tempo_preparo ?? false
            },
            recompensa: row.recompensa_uuid ? {
                uuid: row.recompensa_uuid,
                qtd_pontos_resgate: row.recompensa_pontos || 0,
                voucher_digital: row.recompensa_voucher ?? false
            } : undefined
        }
    }
}

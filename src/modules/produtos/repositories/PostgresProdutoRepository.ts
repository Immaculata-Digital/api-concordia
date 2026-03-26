import { pool } from '../../../infra/database/pool'
import { Produto, ProdutoProps } from '../entities/Produto'

export class PostgresProdutoRepository {
    async findAll(tenantId?: string, viewContext?: string, limit?: number, offset?: number, categoria_code?: string, search?: string): Promise<ProdutoProps[]> {
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
                    ORDER BY m.ordem ASC LIMIT 1) as main_image_url,
                   (SELECT slug FROM app.produtos_seo WHERE produto_id = p.uuid AND tenant_id = p.tenant_id LIMIT 1) as seo_slug
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON p.categoria_code = cat.code AND (p.tenant_id = cat.tenant_id OR cat.tenant_id IS NULL)
            LEFT JOIN app.produtos_precos pp ON p.uuid = pp.produto_id AND p.tenant_id = pp.tenant_id
            LEFT JOIN app.produtos_cardapio cp ON p.uuid = cp.produto_id AND p.tenant_id = cp.tenant_id
            LEFT JOIN app.produtos_recompensas r ON p.uuid = r.produto_id AND p.tenant_id = r.tenant_id
            WHERE p.deleted_at IS NULL
            -- Excluir produtos pai (orquestradores de variantes)
            AND NOT EXISTS (
                SELECT 1 FROM app.produtos_variacoes pv WHERE pv.produto_pai_id = p.uuid
            )
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

        if (search) {
            const searchTerm = `%${search}%`
            query += ` AND (p.nome ILIKE $${idx} OR p.codigo ILIKE $${idx} OR cat.name ILIKE $${idx})`
            values.push(searchTerm)
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
                    ORDER BY m.ordem ASC LIMIT 1) as main_image_url,
                   (SELECT slug FROM app.produtos_seo WHERE produto_id = p.uuid AND tenant_id = p.tenant_id LIMIT 1) as seo_slug
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
            image_url: row.image_url,
            main_image_url: row.main_image_url,
            seo: row.seo_slug ? {
                slug: row.seo_slug
            } : undefined,
            variants: row.variants || [],
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

    async getProductsByPublicCategory(categoryCode: string, tenantId: string, page: number = 1, limit: number = 20, filters?: Record<string, string>): Promise<any[]> {
        const offset = (page - 1) * limit
        let query = `
            SELECT 
                p.uuid, 
                p.nome, 
                cat.name as categoria_nome, 
                p.codigo as sku,
                (SELECT slug FROM app.produtos_seo WHERE produto_id = p.uuid AND tenant_id = p.tenant_id LIMIT 1) as seo_slug,
                COALESCE(
                    (SELECT json_agg(json_build_object('url', m.url, 'arquivo', m.arquivo, 'ordem', m.ordem) ORDER BY m.ordem ASC)
                     FROM app.produtos_media m
                     WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem'),
                    '[]'
                ) as images,
                (SELECT COALESCE(m.arquivo, m.url) FROM app.produtos_media m WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem' ORDER BY m.ordem ASC LIMIT 1) as main_image_url,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                         'uuid', v_p.uuid,
                         'nome', v_p.nome,
                         'sku', v_p.codigo,
                         'images', (
                             SELECT json_agg(json_build_object('url', m.url, 'arquivo', m.arquivo, 'ordem', m.ordem) ORDER BY m.ordem ASC)
                             FROM app.produtos_media m
                             WHERE m.produto_id = v_p.uuid AND m.tipo_code = 'imagem'
                         ),
                          'main_image_url', (
                             SELECT COALESCE(m.arquivo, m.url) FROM app.produtos_media m 
                             WHERE m.produto_id = v_p.uuid AND m.tipo_code = 'imagem' 
                             ORDER BY m.ordem ASC LIMIT 1
                          ),
                          'atributos', (
                              SELECT json_agg(json_build_object('chave', key, 'valor', value))
                              FROM app.produtos_variacoes v_sub
                              CROSS JOIN LATERAL jsonb_each_text(v_sub.grade)
                              WHERE v_sub.produto_filho_id = v_p.uuid
                          )
                     ))
                     FROM app.produtos v_p
                     WHERE v_p.uuid IN (
                         SELECT COALESCE((SELECT produto_pai_id FROM app.produtos_variacoes WHERE produto_filho_id = p.uuid LIMIT 1), p.uuid)
                         UNION
                         SELECT produto_filho_id FROM app.produtos_variacoes 
                         WHERE produto_pai_id = (SELECT COALESCE((SELECT produto_pai_id FROM app.produtos_variacoes WHERE produto_filho_id = p.uuid LIMIT 1), p.uuid))
                     ) AND v_p.deleted_at IS NULL),
                    '[]'
                ) as variants,
                pr.preco,
                pr.preco_promocional
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid
        `

        let whereClause = `
            WHERE ($1 = 'todas' OR p.categoria_code = $1)
            AND p.tenant_id = $2 
            AND p.deleted_at IS NULL
            AND 'vitrine' = ANY(p.views)
            -- Excluir produtos pai (orquestradores de variantes)
            AND NOT EXISTS (
                SELECT 1 FROM app.produtos_variacoes pv WHERE pv.produto_pai_id = p.uuid
            )
        `;

        const params: any[] = [categoryCode, tenantId, limit, offset];
        let paramIndex = 5;

        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                whereClause += `
                    AND EXISTS (
                        SELECT 1 FROM app.produtos_ficha_tecnica ft 
                        WHERE ft.produto_id = p.uuid 
                        AND ft.chave = $${paramIndex} 
                        AND ft.valor = $${paramIndex + 1}
                    )
                `;
                params.push(key, value);
                paramIndex += 2;
            });
        }

        query += whereClause + `
            ORDER BY p.created_at DESC
            LIMIT $3 OFFSET $4
        `;

        const result = await pool.query(query, params)
        return result.rows
    }

    async getCategoryFilters(categoryCode: string, tenantId: string, filters?: Record<string, string>): Promise<any[]> {
        const params: any[] = [tenantId];
        let filterConditions = '';
        
        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([chave, valor]) => {
                if (!valor) return;
                params.push(chave);
                const pChave = `$${params.length}`;
                params.push(valor);
                const pValor = `$${params.length}`;
                filterConditions += `
                AND EXISTS (
                    SELECT 1 FROM app.produtos_ficha_tecnica sub_ft 
                    WHERE sub_ft.produto_id = p.uuid 
                    AND sub_ft.chave = ${pChave} 
                    AND sub_ft.valor = ${pValor}
                )`;
            });
        }

        const categoryCodeParam = `$${params.length + 1}`;
        params.push(categoryCode);

        const query = `
            SELECT 
                ft.chave, 
                json_agg(DISTINCT ft.valor) as valores
            FROM app.produtos_ficha_tecnica ft
            JOIN app.produtos p ON p.uuid = ft.produto_id
            WHERE (${categoryCodeParam} = 'todas' OR p.categoria_code = ${categoryCodeParam})
            AND p.tenant_id = $1
            AND p.deleted_at IS NULL
            ${filterConditions}
            GROUP BY ft.chave
            ORDER BY ft.chave
        `;
        
        const { rows } = await pool.query(query, params);
        return rows;
    }

    async findBySlugOrId(idOrSlug: string, tenantId: string): Promise<any | null> {
        const query = `
            SELECT 
                p.uuid,
                p.nome,
                p.codigo as sku,
                p.unidade,
                p.marca,
                COALESCE(p.descricao, (SELECT p2.descricao FROM app.produtos p2 JOIN app.produtos_variacoes v2 ON v2.produto_pai_id = p2.uuid WHERE v2.produto_filho_id = p.uuid LIMIT 1)) as descricao,
                COALESCE(p.descricao_complementar, (SELECT p2.descricao_complementar FROM app.produtos p2 JOIN app.produtos_variacoes v2 ON v2.produto_pai_id = p2.uuid WHERE v2.produto_filho_id = p.uuid LIMIT 1)) as descricao_complementar,
                p.garantia,
                p.categoria_code,
                cat.name as categoria_nome,
                -- SEO Slug
                (SELECT slug FROM app.produtos_seo WHERE produto_id = p.uuid AND tenant_id = p.tenant_id LIMIT 1) as seo_slug,
                COALESCE(
                    (SELECT json_agg(json_build_object('url', m.url, 'arquivo', m.arquivo, 'ordem', m.ordem) ORDER BY m.ordem ASC)
                     FROM app.produtos_media m
                     WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem'),
                    '[]'
                ) as images,
                (SELECT COALESCE(m.arquivo, m.url) FROM app.produtos_media m WHERE m.produto_id = p.uuid AND m.tipo_code = 'imagem' ORDER BY m.ordem ASC LIMIT 1) as main_image_url,
                -- Ficha Técnica
                COALESCE(
                    (SELECT json_agg(json_build_object('chave', ft.chave, 'valor', ft.valor) ORDER BY ft.chave ASC)
                     FROM app.produtos_ficha_tecnica ft
                     WHERE ft.produto_id = p.uuid),
                    '[]'
                ) as ficha_tecnica,
                -- Variantes (Busca tanto se este for o pai quanto se este for o filho)
                COALESCE(
                    (SELECT json_agg(json_build_object(
                         'uuid', v_p.uuid,
                         'nome', v_p.nome,
                         'sku', v_p.codigo,
                         'images', (
                             SELECT json_agg(json_build_object('url', m.url, 'arquivo', m.arquivo, 'ordem', m.ordem) ORDER BY m.ordem ASC)
                             FROM app.produtos_media m
                             WHERE m.produto_id = v_p.uuid AND m.tipo_code = 'imagem'
                         ),
                          'main_image_url', (
                             SELECT COALESCE(m.arquivo, m.url) FROM app.produtos_media m 
                             WHERE m.produto_id = v_p.uuid AND m.tipo_code = 'imagem' 
                             ORDER BY m.ordem ASC LIMIT 1
                          ),
                          'atributos', (
                               SELECT json_agg(json_build_object('chave', key, 'valor', value))
                               FROM app.produtos_variacoes v_sub
                               CROSS JOIN LATERAL jsonb_each_text(v_sub.grade)
                               WHERE v_sub.produto_filho_id = v_p.uuid
                           )
                     ))
                     FROM app.produtos v_p
                     WHERE v_p.uuid IN (
                         SELECT COALESCE((SELECT produto_pai_id FROM app.produtos_variacoes WHERE produto_filho_id = p.uuid LIMIT 1), p.uuid)
                         UNION
                         SELECT produto_filho_id FROM app.produtos_variacoes 
                         WHERE produto_pai_id = (SELECT COALESCE((SELECT produto_pai_id FROM app.produtos_variacoes WHERE produto_filho_id = p.uuid LIMIT 1), p.uuid))
                     ) AND v_p.deleted_at IS NULL),
                    '[]'
                ) as variants
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            WHERE p.tenant_id = $2 
            AND p.deleted_at IS NULL
            AND (
                p.uuid::text = $1 
                OR p.uuid IN (SELECT produto_id FROM app.produtos_seo WHERE slug = $1 AND tenant_id = $2)
            )
            LIMIT 1
        `
        const { rows } = await pool.query(query, [idOrSlug, tenantId])
        return rows[0] || null
    }
}

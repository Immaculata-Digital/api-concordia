import { pool } from '../../../infra/database/pool'

export class PostgresProdutoComplementaryRepository {
    // --- 1:1 Relations ---

    async getFiscal(produtoId: string): Promise<any> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_fiscal WHERE produto_id = $1', [produtoId])
        return rows[0] || null
    }

    async upsertFiscal(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        const query = `
            INSERT INTO app.produtos_fiscal (
                tenant_id, produto_id, ncm, gtin, gtin_embalagem, cest, 
                origem_code, codigo_anvisa, motivo_isencao, classe_ipi, 
                valor_ipi_fixo, cod_lista_servicos, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
            ON CONFLICT (produto_id) DO UPDATE SET
                ncm = EXCLUDED.ncm, gtin = EXCLUDED.gtin, gtin_embalagem = EXCLUDED.gtin_embalagem,
                cest = EXCLUDED.cest, origem_code = EXCLUDED.origem_code, codigo_anvisa = EXCLUDED.codigo_anvisa,
                motivo_isencao = EXCLUDED.motivo_isencao, classe_ipi = EXCLUDED.classe_ipi,
                valor_ipi_fixo = EXCLUDED.valor_ipi_fixo, cod_lista_servicos = EXCLUDED.cod_lista_servicos,
                updated_by = EXCLUDED.updated_by, updated_at = NOW()
        `
        const values = [
            tenantId, produtoId, data.ncm, data.gtin, data.gtin_embalagem, data.cest,
            data.origem_code, data.codigo_anvisa, data.motivo_isencao, data.classe_ipi,
            data.valor_ipi_fixo, data.cod_lista_servicos, userId
        ]
        await pool.query(query, values)
    }

    async getLogistica(produtoId: string): Promise<any> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_logistica WHERE produto_id = $1', [produtoId])
        return rows[0] || null
    }

    async upsertLogistica(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        const query = `
            INSERT INTO app.produtos_logistica (
                tenant_id, produto_id, peso_liquido, peso_bruto, estoque_minimo, estoque_maximo, 
                estoque_atual, localizacao, unidade_por_caixa, tipo_embalagem_code, 
                altura_embalagem, largura_embalagem, comprimento_embalagem, diametro_embalagem, 
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
            ON CONFLICT (produto_id) DO UPDATE SET
                peso_liquido = EXCLUDED.peso_liquido, peso_bruto = EXCLUDED.peso_bruto, 
                estoque_minimo = EXCLUDED.estoque_minimo, estoque_maximo = EXCLUDED.estoque_maximo,
                estoque_atual = EXCLUDED.estoque_atual, localizacao = EXCLUDED.localizacao,
                unidade_por_caixa = EXCLUDED.unidade_por_caixa, tipo_embalagem_code = EXCLUDED.tipo_embalagem_code,
                altura_embalagem = EXCLUDED.altura_embalagem, largura_embalagem = EXCLUDED.largura_embalagem,
                comprimento_embalagem = EXCLUDED.comprimento_embalagem, diametro_embalagem = EXCLUDED.diametro_embalagem,
                updated_by = EXCLUDED.updated_by, updated_at = NOW()
        `
        const values = [
            tenantId, produtoId, data.peso_liquido, data.peso_bruto, data.estoque_minimo, data.estoque_maximo,
            data.estoque_atual, data.localizacao, data.unidade_por_caixa, data.tipo_embalagem_code,
            data.altura_embalagem, data.largura_embalagem, data.comprimento_embalagem, data.diametro_embalagem, userId
        ]
        await pool.query(query, values)
    }

    async getPrecos(produtoId: string): Promise<any> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_precos WHERE produto_id = $1', [produtoId])
        return rows[0] || null
    }

    async upsertPrecos(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        const query = `
            INSERT INTO app.produtos_precos (
                tenant_id, produto_id, preco, preco_promocional, preco_custo, valor_max,
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
            ON CONFLICT (produto_id) DO UPDATE SET
                preco = EXCLUDED.preco, preco_promocional = EXCLUDED.preco_promocional,
                preco_custo = EXCLUDED.preco_custo, valor_max = EXCLUDED.valor_max,
                updated_by = EXCLUDED.updated_by, updated_at = NOW()
        `
        const values = [tenantId, produtoId, data.preco, data.preco_promocional, data.preco_custo, data.valor_max, userId]
        await pool.query(query, values)
    }

    async getSeo(produtoId: string): Promise<any> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_seo WHERE produto_id = $1', [produtoId])
        return rows[0] || null
    }

    async upsertSeo(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        const query = `
            INSERT INTO app.produtos_seo (
                tenant_id, produto_id, seo_title, seo_keywords, seo_description, link_video, slug,
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            ON CONFLICT (produto_id) DO UPDATE SET
                seo_title = EXCLUDED.seo_title, seo_keywords = EXCLUDED.seo_keywords,
                seo_description = EXCLUDED.seo_description, link_video = EXCLUDED.link_video,
                slug = EXCLUDED.slug, updated_by = EXCLUDED.updated_by, updated_at = NOW()
        `
        const values = [tenantId, produtoId, data.seo_title, data.seo_keywords, data.seo_description, data.link_video, data.slug, userId]
        await pool.query(query, values)
    }

    // --- 1:N Relations ---

    async getFichaTecnica(produtoId: string): Promise<any[]> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_ficha_tecnica WHERE produto_id = $1 ORDER BY sort', [produtoId])
        return rows
    }

    async addFichaTecnica(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'INSERT INTO app.produtos_ficha_tecnica (tenant_id, produto_id, chave, valor, sort, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6)',
            [tenantId, produtoId, data.chave, data.valor, data.sort || 0, userId]
        )
    }

    async deleteFichaTecnica(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.produtos_ficha_tecnica WHERE uuid = $1', [uuid])
    }

    async updateFichaTecnica(uuid: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'UPDATE app.produtos_ficha_tecnica SET chave = $1, valor = $2, sort = $3, updated_by = $4, updated_at = NOW() WHERE uuid = $5',
            [data.chave, data.valor, data.sort || 0, userId, uuid]
        )
    }

    async getDistinctChaves(tenantId: string): Promise<string[]> {
        const { rows } = await pool.query(
            'SELECT DISTINCT chave FROM app.produtos_ficha_tecnica WHERE tenant_id = $1 ORDER BY chave',
            [tenantId]
        )
        return rows.map(r => r.chave)
    }

    async getDistinctValores(tenantId: string, chave: string): Promise<string[]> {
        const { rows } = await pool.query(
            'SELECT DISTINCT valor FROM app.produtos_ficha_tecnica WHERE tenant_id = $1 AND chave = $2 ORDER BY valor',
            [tenantId, chave]
        )
        return rows.map(r => r.valor)
    }

    async deleteFichaTecnicaOption(tenantId: string, chave: string, valor?: string): Promise<void> {
        if (valor) {
            await pool.query(
                'DELETE FROM app.produtos_ficha_tecnica WHERE tenant_id = $1 AND chave = $2 AND valor = $3',
                [tenantId, chave, valor]
            )
        } else {
            await pool.query(
                'DELETE FROM app.produtos_ficha_tecnica WHERE tenant_id = $1 AND chave = $2',
                [tenantId, chave]
            )
        }
    }

    async renameGlobalFichaTecnicaChave(tenantId: string, oldChave: string, newChave: string): Promise<void> {
        // Rename key in ficha_tecnica
        await pool.query(
            'UPDATE app.produtos_ficha_tecnica SET chave = $1 WHERE tenant_id = $2 AND chave = $3',
            [newChave, tenantId, oldChave]
        )

        // Rename key inside the grade JSONB of variations
        // (grade - 'oldChave') || jsonb_build_object('newChave', grade->>'oldChave')
        await pool.query(`
            UPDATE app.produtos_variacoes 
            SET grade = (grade - $1) || jsonb_build_object($2::text, grade->>$1)
            WHERE tenant_id = $3 AND grade ? $1
        `, [oldChave, newChave, tenantId])
    }

    async deleteGlobalFichaTecnicaChave(tenantId: string, chave: string): Promise<void> {
        // Delete all ficha_tecnica entries with this key for the tenant
        await pool.query(
            'DELETE FROM app.produtos_ficha_tecnica WHERE tenant_id = $1 AND chave = $2',
            [tenantId, chave]
        )

        // Delete all variations that use this key
        await pool.query(
            'DELETE FROM app.produtos_variacoes WHERE tenant_id = $1 AND grade ? $2',
            [tenantId, chave]
        )
    }

    async getMedia(produtoId: string): Promise<any[]> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_media WHERE produto_id = $1 ORDER BY ordem', [produtoId])
        return rows
    }

    async addMedia(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'INSERT INTO app.produtos_media (tenant_id, produto_id, url, arquivo, tipo_code, ordem, created_by, updated_by, file_name, file_size) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9)',
            [tenantId, produtoId, data.url || null, data.arquivo || null, data.tipo_code, data.ordem || 0, userId, data.file_name || null, data.file_size || null]
        )
    }

    async deleteMedia(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.produtos_media WHERE uuid = $1', [uuid])
    }

    async updateMedia(uuid: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'UPDATE app.produtos_media SET url = $1, arquivo = $2, tipo_code = $3, ordem = $4, file_name = $5, file_size = $6, updated_by = $7, updated_at = NOW() WHERE uuid = $8',
            [data.url, data.arquivo, data.tipo_code, data.ordem || 0, data.file_name || null, data.file_size || null, userId, uuid]
        )
    }

    async getKit(produtoPaiId: string): Promise<any[]> {
        const { rows } = await pool.query(`
            SELECT k.*, p.nome as produto_nome, p.codigo as produto_codigo 
            FROM app.produtos_kit k
            JOIN app.produtos p ON p.uuid = k.produto_filho_id
            WHERE k.produto_pai_id = $1
        `, [produtoPaiId])
        return rows
    }

    async addKitItem(produtoPaiId: string, tenantId: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'INSERT INTO app.produtos_kit (tenant_id, produto_pai_id, produto_filho_id, quantidade, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5)',
            [tenantId, produtoPaiId, data.produto_filho_id, data.quantidade, userId]
        )
    }

    async deleteKitItem(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.produtos_kit WHERE uuid = $1', [uuid])
    }

    async updateKitItem(uuid: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'UPDATE app.produtos_kit SET produto_filho_id = $1, quantidade = $2, updated_by = $3, updated_at = NOW() WHERE uuid = $4',
            [data.produto_filho_id, data.quantidade, userId, uuid]
        )
    }

    async getVariacoes(produtoPaiId: string): Promise<any[]> {
        const { rows } = await pool.query(`
            SELECT 
                v.*, 
                p.nome as produto_nome, 
                p.codigo as sku,
                pr.preco as preco,
                COALESCE(
                    (SELECT url FROM app.produtos_media WHERE produto_id = p.uuid AND tipo_code = 'imagem' ORDER BY ordem LIMIT 1),
                    (SELECT url FROM app.produtos_media WHERE produto_id = v.produto_pai_id AND tipo_code = 'imagem' ORDER BY ordem LIMIT 1)
                ) as imagem_url
            FROM app.produtos_variacoes v
            JOIN app.produtos p ON p.uuid = v.produto_filho_id
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid
            WHERE v.produto_pai_id = $1
            ORDER BY v.created_at ASC
        `, [produtoPaiId])
        return rows
    }

    async addVariacao(produtoPaiId: string, tenantId: string, data: any, userId: string): Promise<any> {
        const { generateUUID } = require('../../../utils/uuid')
        const { rows } = await pool.query(
            'INSERT INTO app.produtos_variacoes (uuid, tenant_id, produto_pai_id, produto_filho_id, grade, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *',
            [generateUUID(), tenantId, produtoPaiId, data.produto_filho_id, JSON.stringify(data.grade), userId]
        )
        return rows[0]
    }

    async deleteVariacao(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.produtos_variacoes WHERE uuid = $1', [uuid])
    }

    async updateVariacao(uuid: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'UPDATE app.produtos_variacoes SET produto_filho_id = $1, grade = $2, updated_by = $3, updated_at = NOW() WHERE uuid = $4',
            [data.produto_filho_id, JSON.stringify(data.grade), userId, uuid]
        )
    }

    async getRecompensa(produtoId: string): Promise<any> {
        const { rows } = await pool.query('SELECT * FROM app.produtos_recompensas WHERE produto_id = $1', [produtoId])
        return rows[0] || null
    }

    async upsertRecompensa(produtoId: string, tenantId: string, data: any, userId: string): Promise<void> {
        const existing = await this.getRecompensa(produtoId)

        if (existing) {
            await pool.query(
                'UPDATE app.produtos_recompensas SET qtd_pontos_resgate = $1, voucher_digital = $2, updated_by = $3, updated_at = NOW() WHERE produto_id = $4',
                [data.qtd_pontos_resgate, data.voucher_digital, userId, produtoId]
            )
        } else {
            await pool.query(
                `INSERT INTO app.produtos_recompensas (
                    uuid, tenant_id, produto_id, qtd_pontos_resgate, voucher_digital, created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $6)`,
                [require('../../../utils/uuid').generateUUID(), tenantId, produtoId, data.qtd_pontos_resgate, data.voucher_digital, userId]
            )
        }
    }

    async getRelacaoPai(produtoFilhoId: string): Promise<any> {
        const { rows } = await pool.query(`
            SELECT v.*, p.nome as pai_nome, p.codigo as pai_codigo, 
                   json_build_object('preco', pr.preco, 'preco_promocional', pr.preco_promocional) as pai_precos
            FROM app.produtos_variacoes v
            JOIN app.produtos p ON p.uuid = v.produto_pai_id
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid
            WHERE v.produto_filho_id = $1
        `, [produtoFilhoId])
        return rows[0] || null
    }
}

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

    async getVariacoes(produtoPaiId: string): Promise<any[]> {
        const { rows } = await pool.query(`
            SELECT v.*, p.nome as produto_nome, p.codigo as produto_codigo 
            FROM app.produtos_variacoes v
            JOIN app.produtos p ON p.uuid = v.produto_filho_id
            WHERE v.produto_pai_id = $1
        `, [produtoPaiId])
        return rows
    }

    async addVariacao(produtoPaiId: string, tenantId: string, data: any, userId: string): Promise<void> {
        await pool.query(
            'INSERT INTO app.produtos_variacoes (tenant_id, produto_pai_id, produto_filho_id, grade, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $5)',
            [tenantId, produtoPaiId, data.produto_filho_id, JSON.stringify(data.grade), userId]
        )
    }

    async deleteVariacao(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.produtos_variacoes WHERE uuid = $1', [uuid])
    }
}

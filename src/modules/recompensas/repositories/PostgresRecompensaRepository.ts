
import { pool } from '../../../infra/database/pool'
import { Recompensa, RecompensaProps } from '../entities/Recompensa'

export class PostgresRecompensaRepository {
    async findAll(tenantId?: string, view?: string, limit?: number): Promise<RecompensaProps[]> {
        const isCompact = view === 'compact'
        const selectFields = isCompact 
            ? 'r.*, p.nome, p.codigo, p.unidade, p.marca, cat.name as categoria_nome, s.slug, m.arquivo as imagem_principal'
            : 'r.*, p.nome, p.codigo, p.unidade, p.marca, p.descricao_complementar, cat.name as categoria_nome, s.slug, m.arquivo as imagem_principal'

        let query = `
            SELECT ${selectFields}
            FROM app.recompensas r
            JOIN app.produtos p ON p.uuid = r.produto_id
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_seo s ON s.produto_id = p.uuid
            LEFT JOIN LATERAL (
                SELECT arquivo 
                FROM app.produtos_media 
                WHERE produto_id = p.uuid AND tipo_code = 'imagem'
                ORDER BY ordem ASC
                LIMIT 1
            ) m ON true
            WHERE r.deleted_at IS NULL
            ${tenantId ? 'AND r.tenant_id = $1' : ''}
        `
        
        let paramCount = tenantId ? 1 : 0
        const values: any[] = tenantId ? [tenantId] : []

        if (limit && limit > 0) {
            paramCount++
            query += ` LIMIT $${paramCount}`
            values.push(limit)
        }

        const { rows } = await pool.query(query, values)
        return rows.map((row: any) => this.mapToProps(row))
    }

    async findById(uuidOrSlug: string): Promise<RecompensaProps | null> {
        const query = `
            SELECT r.*, p.nome, p.codigo, p.unidade, p.marca, p.descricao_complementar, cat.name as categoria_nome, s.slug, m.arquivo as imagem_principal
            FROM app.recompensas r
            JOIN app.produtos p ON p.uuid = r.produto_id
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_seo s ON s.produto_id = p.uuid
            LEFT JOIN LATERAL (
                SELECT arquivo 
                FROM app.produtos_media 
                WHERE produto_id = p.uuid AND tipo_code = 'imagem'
                ORDER BY ordem ASC
                LIMIT 1
            ) m ON true
            WHERE (r.uuid::text = $1 OR s.slug = $1) AND r.deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [uuidOrSlug])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async create(recompensa: Recompensa): Promise<RecompensaProps> {
        const props = recompensa.toJSON()
        const query = `
            INSERT INTO app.recompensas (
                uuid, tenant_id, produto_id, qtd_pontos_resgate, voucher_digital,
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.produtoId, props.qtd_pontos_resgate,
            props.voucher_digital, props.createdBy, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)

        // Fetch again to get the joined product info
        return this.findById(rows[0].uuid) as Promise<RecompensaProps>
    }

    async update(recompensa: Recompensa): Promise<RecompensaProps> {
        const props = recompensa.toJSON()
        const query = `
            UPDATE app.recompensas SET 
                qtd_pontos_resgate = $2, voucher_digital = $3,
                updated_by = $4, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *
        `
        const values = [
            props.uuid, props.qtd_pontos_resgate, props.voucher_digital, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(rows[0].uuid) as Promise<RecompensaProps>
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('UPDATE app.recompensas SET deleted_at = NOW() WHERE uuid = $1', [uuid])
    }

    private mapToProps(row: any): RecompensaProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            produtoId: row.produto_id,
            qtd_pontos_resgate: row.qtd_pontos_resgate,
            voucher_digital: row.voucher_digital,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            produto: {
                nome: row.nome,
                codigo: row.codigo,
                unidade: row.unidade,
                marca: row.marca,
                categoria_nome: row.categoria_nome,
                descricao_complementar: row.descricao_complementar,
                imagem_principal: row.imagem_principal,
                slug: row.slug
            }
        }
    }
}

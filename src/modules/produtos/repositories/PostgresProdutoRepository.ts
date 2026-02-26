import { pool } from '../../../infra/database/pool'
import { Produto, ProdutoProps } from '../entities/Produto'

export class PostgresProdutoRepository {
    async findAll(tenantId?: string): Promise<ProdutoProps[]> {
        const query = `
            SELECT p.*, cat.name as categoria_nome
            FROM app.produtos p
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            WHERE p.deleted_at IS NULL
            ${tenantId ? 'AND p.tenant_id = $1' : ''}
        `
        const values = tenantId ? [tenantId] : []
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
                garantia, descricao_complementar, obs, dias_preparacao, tags,
                created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.nome, props.codigo, props.unidade, props.marca,
            props.tipo_code, props.situacao_code, props.classe_produto_code, props.categoria_code,
            props.garantia, props.descricao_complementar, props.obs, props.dias_preparacao, props.tags,
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
                garantia = $10, descricao_complementar = $11, obs = $12, dias_preparacao = $13, tags = $14,
                updated_by = $15, updated_at = NOW()
            WHERE uuid = $1
            RETURNING *
        `
        const values = [
            props.uuid, props.nome, props.codigo, props.unidade, props.marca,
            props.tipo_code, props.situacao_code, props.classe_produto_code, props.categoria_code,
            props.garantia, props.descricao_complementar, props.obs, props.dias_preparacao, props.tags,
            props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(rows[0].uuid) as Promise<ProdutoProps>
    }

    async delete(uuid: string): Promise<void> {
        await pool.query('UPDATE app.produtos SET deleted_at = NOW() WHERE uuid = $1', [uuid])
    }

    private normalizeEmptyStrings(props: ProdutoProps): ProdutoProps {
        const normalized = { ...props }
        Object.keys(normalized).forEach(key => {
            const val = (normalized as any)[key]
            if (typeof val === 'string' && val.trim() === '') {
                ;(normalized as any)[key] = null
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
            categoria_nome: row.categoria_nome,
            garantia: row.garantia,
            descricao_complementar: row.descricao_complementar,
            obs: row.obs,
            dias_preparacao: row.dias_preparacao,
            tags: row.tags,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at
        }
    }
}

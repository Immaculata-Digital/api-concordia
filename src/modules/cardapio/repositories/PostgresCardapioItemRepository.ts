import { pool } from '../../../infra/database/pool'
import { CardapioItem, CardapioItemProps } from '../entities/CardapioItem'

export class PostgresCardapioItemRepository {
    async findAll(tenantId: string, categoriaCode?: string): Promise<CardapioItemProps[]> {
        let query = `
            SELECT i.*, 
                   p.nome as produto_nome, 
                   p.categoria_code as categoria_code,
                   cat.name as categoria_nome,
                   pr.preco as produto_preco
            FROM app.cardapio_itens i
            JOIN app.produtos p ON p.uuid = i.produto_id
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid
            WHERE i.tenant_id = $1 AND i.deleted_at IS NULL
        `
        const values: any[] = [tenantId]

        if (categoriaCode) {
            query += ` AND p.categoria_code = $2`
            values.push(categoriaCode)
        }

        query += ` ORDER BY cat.sort ASC, i.ordem ASC, p.nome ASC`

        const { rows } = await pool.query(query, values)
        return rows.map((row: any) => this.mapToProps(row))
    }

    async findById(tenantId: string, uuid: string): Promise<CardapioItemProps | null> {
        const query = `
            SELECT i.*, 
                   p.nome as produto_nome, 
                   p.categoria_code as categoria_code,
                   cat.name as categoria_nome,
                   pr.preco as produto_preco
            FROM app.cardapio_itens i
            JOIN app.produtos p ON p.uuid = i.produto_id
            LEFT JOIN app.produtos_categoria_category_enum cat ON cat.code = p.categoria_code
            LEFT JOIN app.produtos_precos pr ON pr.produto_id = p.uuid
            WHERE i.tenant_id = $1 AND i.uuid = $2 AND i.deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [tenantId, uuid])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async create(item: CardapioItem): Promise<CardapioItemProps> {
        const props = item.toJSON()
        const query = `
            INSERT INTO app.cardapio_itens (
                uuid, tenant_id, produto_id, ordem, ativo, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.produtoId,
            props.ordem, props.ativo, props.createdBy, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(props.tenantId, rows[0].uuid) as Promise<CardapioItemProps>
    }

    async update(item: CardapioItem): Promise<CardapioItemProps> {
        const props = item.toJSON()
        const query = `
            UPDATE app.cardapio_itens SET 
                ordem = $3,
                ativo = $4,
                updated_by = $5,
                updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
            RETURNING *
        `
        const values = [
            props.tenantId, props.uuid,
            props.ordem, props.ativo, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(props.tenantId, rows[0].uuid) as Promise<CardapioItemProps>
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        const query = `
            UPDATE app.cardapio_itens 
            SET deleted_at = NOW() 
            WHERE tenant_id = $1 AND uuid = $2
        `
        await pool.query(query, [tenantId, uuid])
    }

    private mapToProps(row: any): CardapioItemProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            produtoId: row.produto_id,
            ordem: row.ordem,
            ativo: row.ativo,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            produtoNome: row.produto_nome,
            produtoPreco: row.produto_preco,
            categoriaCode: row.categoria_code,
            categoriaNome: row.categoria_nome
        }
    }
}

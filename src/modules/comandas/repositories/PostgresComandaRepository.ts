import { pool } from '../../../infra/database/pool'
import { Comanda, ComandaProps, ComandaItemProps } from '../entities/Comanda'

export class PostgresComandaRepository {
    async findAll(tenantId: string, filters?: { status?: string, mesaId?: string }): Promise<ComandaProps[]> {
        let query = `
            SELECT c.*, m.numero as mesa_numero
            FROM app.comandas c
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE c.tenant_id = $1 AND c.deleted_at IS NULL
        `
        const values: any[] = [tenantId]

        if (filters?.status) {
            values.push(filters.status)
            query += ` AND c.status = $${values.length}`
        }

        if (filters?.mesaId) {
            values.push(filters.mesaId)
            query += ` AND c.mesa_id = $${values.length}`
        }

        query += ` ORDER BY c.aberta_em DESC`

        const { rows } = await pool.query(query, values)
        return rows.map(this.mapToProps)
    }

    async findById(tenantId: string, uuid: string): Promise<ComandaProps | null> {
        const query = `
            SELECT c.*, m.numero as mesa_numero
            FROM app.comandas c
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE c.tenant_id = $1 AND c.uuid = $2 AND c.deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [tenantId, uuid])
        if (rows.length === 0) return null

        const comanda = this.mapToProps(rows[0])
        comanda.itens = await this.findItemsByComanda(tenantId, uuid)

        return comanda
    }

    async findItemsByComanda(tenantId: string, comandaId: string): Promise<ComandaItemProps[]> {
        const query = `
            SELECT ci.*, p.nome as produto_nome
            FROM app.comanda_itens ci
            JOIN app.produtos p ON p.uuid = ci.produto_id
            WHERE ci.tenant_id = $1 AND ci.comanda_id = $2 AND ci.deleted_at IS NULL
            ORDER BY ci.created_at ASC
        `
        const { rows } = await pool.query(query, [tenantId, comandaId])
        return rows.map((row: any) => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            comandaId: row.comanda_id,
            produtoId: row.produto_id,
            quantidade: Number(row.quantidade),
            precoUnitario: Number(row.preco_unitario),
            total: Number(row.total),
            status: row.status,
            observacao: row.observacao,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            produtoNome: row.produto_nome
        }))
    }

    async create(comanda: Comanda): Promise<ComandaProps> {
        const props = comanda.toJSON()
        const query = `
            INSERT INTO app.comandas (
                uuid, tenant_id, mesa_id, cliente_nome, status, total, aberta_em, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.mesaId,
            props.clienteNome, props.status, props.total,
            props.abertaEm, props.createdBy, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.findById(props.tenantId, rows[0].uuid) as Promise<ComandaProps>
    }

    async addItem(tenantId: string, item: Partial<ComandaItemProps> & { createdBy: string }): Promise<void> {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // 1. Insert item
            const itemQuery = `
                INSERT INTO app.comanda_itens (
                    tenant_id, comanda_id, produto_id, quantidade, preco_unitario, total, observacao, created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            `
            const total = (item.quantidade || 1) * (item.precoUnitario || 0)
            await client.query(itemQuery, [
                tenantId, item.comandaId, item.produtoId,
                item.quantidade, item.precoUnitario, total,
                item.observacao, item.createdBy
            ])

            // 2. Update comanda total
            await client.query(`
                UPDATE app.comandas 
                SET total = (SELECT SUM(total) FROM app.comanda_itens WHERE comanda_id = $1 AND deleted_at IS NULL),
                    updated_at = NOW()
                WHERE uuid = $1
            `, [item.comandaId])

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    async updateStatus(tenantId: string, uuid: string, status: string, updatedBy: string): Promise<void> {
        const fechadaEm = (status === 'PAGA' || status === 'CANCELADA') ? 'NOW()' : 'NULL'
        const query = `
            UPDATE app.comandas SET 
                status = $3,
                fechada_em = ${fechadaEm},
                updated_by = $4,
                updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
        `
        await pool.query(query, [tenantId, uuid, status, updatedBy])
    }

    private mapToProps(row: any): ComandaProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            mesaId: row.mesa_id,
            mesaNumero: row.mesa_numero,
            clienteNome: row.cliente_nome,
            status: row.status,
            total: Number(row.total),
            abertaEm: row.aberta_em,
            fechadaEm: row.fechada_em,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at
        }
    }
}

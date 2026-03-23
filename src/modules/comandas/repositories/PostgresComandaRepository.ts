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
            pedidoId: row.pedido_id,
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

    async findItemsByPedido(tenantId: string, pedidoId: string): Promise<ComandaItemProps[]> {
        const query = `
            SELECT ci.*, p.nome as produto_nome,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_min)/60)::integer as tempo_preparo_min,
                   ROUND(EXTRACT(EPOCH FROM cp.tempo_preparo_max)/60)::integer as tempo_preparo_max
            FROM app.comanda_itens ci
            JOIN app.produtos p ON p.uuid = ci.produto_id
            LEFT JOIN app.produtos_cardapio cp ON cp.produto_id = p.uuid AND cp.tenant_id = ci.tenant_id
            WHERE ci.tenant_id = $1 AND ci.pedido_id = $2 AND ci.deleted_at IS NULL
            ORDER BY ci.created_at ASC
        `
        const { rows } = await pool.query(query, [tenantId, pedidoId])
        return rows.map((row: any) => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            comandaId: row.comanda_id,
            pedidoId: row.pedido_id,
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
            produtoNome: row.produto_nome,
            tempoPreparoMin: row.tempo_preparo_min,
            tempoPreparoMax: row.tempo_preparo_max
        }))
    }

    async create(comanda: Comanda): Promise<ComandaProps> {
        const props = comanda.toJSON()
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const query = `
                INSERT INTO app.comandas (
                    uuid, tenant_id, mesa_id, cliente_nome, whatsapp, status, total, aberta_em, created_by, updated_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `
            const values = [
                props.uuid, props.tenantId, props.mesaId,
                props.clienteNome, props.whatsapp, props.status, props.total,
                props.abertaEm, props.createdBy, props.updatedBy
            ]
            const { rows } = await client.query(query, values)

            // Atualiza status da mesa
            await client.query(
                'UPDATE app.mesas SET status = \'OCUPADA\', updated_at = NOW() WHERE uuid = $1',
                [props.mesaId]
            )

            await client.query('COMMIT')
            return this.findById(props.tenantId, rows[0].uuid) as Promise<ComandaProps>
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
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

            // 2. Update comanda total and mesa status
            await client.query(`
                UPDATE app.comandas 
                SET total = (SELECT SUM(total) FROM app.comanda_itens WHERE comanda_id = $1 AND deleted_at IS NULL),
                    updated_at = NOW()
                WHERE uuid = $1
                RETURNING mesa_id
            `, [item.comandaId])

            // Aproveita para garantir que a mesa está OCUPADA
            await client.query(`
                UPDATE app.mesas SET status = 'OCUPADA', updated_at = NOW()
                WHERE uuid = (SELECT mesa_id FROM app.comandas WHERE uuid = $1)
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
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const fechadaEm = (status === 'PAGA' || status === 'CANCELADA') ? 'NOW()' : 'NULL'
            const updateQuery = `
                UPDATE app.comandas SET 
                    status = $3,
                    fechada_em = ${fechadaEm},
                    updated_by = $4,
                    updated_at = NOW()
                WHERE tenant_id = $1 AND uuid = $2
                RETURNING mesa_id
            `
            const { rows } = await client.query(updateQuery, [tenantId, uuid, status, updatedBy])

            if (rows.length > 0 && (status === 'PAGA' || status === 'CANCELADA')) {
                const mesaId = rows[0].mesa_id

                // Se a comanda foi paga, finaliza todos os seus pedidos vinculados
                if (status === 'PAGA') {
                    await client.query(`
                        UPDATE app.pedidos SET 
                            status = 'PAGO',
                            updated_by = $1,
                            updated_at = NOW()
                        WHERE comanda_id = $2 AND status NOT IN ('PAGO', 'CANCELADO')
                    `, [updatedBy, uuid])

                    await client.query(`
                        UPDATE app.comanda_itens SET 
                            status = 'ENTREGUE',
                            updated_by = $1,
                            updated_at = NOW()
                        WHERE comanda_id = $2 AND status NOT IN ('ENTREGUE', 'CANCELADO')
                    `, [updatedBy, uuid])
                }

                // Se a comanda foi cancelada, cancela todos os seus pedidos vinculados
                if (status === 'CANCELADA') {
                    await client.query(`
                        UPDATE app.pedidos SET 
                            status = 'CANCELADO',
                            updated_by = $1,
                            updated_at = NOW()
                        WHERE comanda_id = $2 AND status NOT IN ('PAGO', 'CANCELADO')
                    `, [updatedBy, uuid])

                    await client.query(`
                        UPDATE app.comanda_itens SET 
                            status = 'CANCELADO',
                            updated_by = $1,
                            updated_at = NOW()
                        WHERE comanda_id = $2 AND status != 'CANCELADO'
                    `, [updatedBy, uuid])
                }

                // Verifica se ainda existem comandas abertas para esta mesa
                const checkQuery = `
                    SELECT COUNT(*) FROM app.comandas 
                    WHERE tenant_id = $1 AND mesa_id = $2 AND status IN ('ABERTA', 'FECHADA') AND deleted_at IS NULL
                `
                const { rows: countRows } = await client.query(checkQuery, [tenantId, mesaId])
                if (parseInt(countRows[0].count) === 0) {
                    await client.query(
                        'UPDATE app.mesas SET status = \'LIVRE\', updated_at = NOW() WHERE tenant_id = $1 AND uuid = $2',
                        [tenantId, mesaId]
                    )
                }
            }

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    async findByOpenComanda(tenantId: string, whatsapp: string, mesaId: string): Promise<ComandaProps | null> {
        const query = `
            SELECT c.*, m.numero as mesa_numero
            FROM app.comandas c
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE c.tenant_id = $1 AND c.whatsapp = $2 AND c.mesa_id = $3 AND c.status = 'ABERTA' AND c.deleted_at IS NULL
            ORDER BY c.aberta_em DESC LIMIT 1
        `
        const { rows } = await pool.query(query, [tenantId, whatsapp, mesaId])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async createPedido(pedido: any): Promise<any> {
        const query = `
            INSERT INTO app.pedidos (
                uuid, tenant_id, comanda_id, status, total, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            pedido.uuid, pedido.tenantId, pedido.comandaId,
            pedido.status, pedido.total, pedido.createdBy, pedido.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return rows[0]
    }

    async addItemsToPedido(tenantId: string, pedidoId: string, comandaId: string, items: any[]): Promise<void> {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            for (const item of items) {
                const itemQuery = `
                    INSERT INTO app.comanda_itens (
                        tenant_id, comanda_id, pedido_id, produto_id, quantidade, preco_unitario, total, observacao, created_by, updated_by
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
                `
                const total = (item.quantidade || 1) * (item.precoUnitario || 0)
                await client.query(itemQuery, [
                    tenantId, comandaId, pedidoId, item.produtoId,
                    item.quantidade, item.precoUnitario, total,
                    item.observacao, item.createdBy
                ])
            }

            // Update pedido total
            await client.query(`
                UPDATE app.pedidos 
                SET total = (SELECT SUM(total) FROM app.comanda_itens WHERE pedido_id = $1 AND deleted_at IS NULL),
                    updated_at = NOW()
                WHERE uuid = $1
            `, [pedidoId])

            // Update comanda total
            await client.query(`
                UPDATE app.comandas 
                SET total = (SELECT SUM(total) FROM app.comanda_itens WHERE comanda_id = $1 AND deleted_at IS NULL),
                    updated_at = NOW()
                WHERE uuid = $1
            `, [comandaId])

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    async updatePedidoStatus(tenantId: string, uuid: string, status: string, updatedBy: string): Promise<void> {
        await pool.query(`
            UPDATE app.pedidos SET 
                status = $3,
                updated_by = $4,
                updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
        `, [tenantId, uuid, status, updatedBy])

        // Se o pedido for PRONTO ou ENTREGUE, atualiza os itens também
        if (status === 'PRONTO' || status === 'ENTREGUE' || status === 'CANCELADO') {
            const itemStatus = status === 'CANCELADO' ? 'CANCELADO' : 'ENTREGUE'
            await pool.query(`
                UPDATE app.comanda_itens SET 
                    status = $3,
                    updated_by = $4,
                    updated_at = NOW()
                WHERE tenant_id = $1 AND pedido_id = $2
            `, [tenantId, uuid, itemStatus, updatedBy])
        }
    }

    async findPedidosHistorico(tenantId: string): Promise<any[]> {
        const query = `
            SELECT 
                p.*, 
                m.numero as mesa_numero,
                c.cliente_nome,
                c.seq_id as comanda_seq_id,
                (SELECT COUNT(*) FROM app.comanda_itens ci WHERE ci.pedido_id = p.uuid AND ci.deleted_at IS NULL) as qtd_itens,
                CASE 
                    WHEN p.status IN ('ENTREGUE', 'PAGO', 'CANCELADO') THEN 
                        EXTRACT(EPOCH FROM (p.updated_at - p.created_at))/60
                    ELSE 
                        EXTRACT(EPOCH FROM (NOW() - p.created_at))/60
                END as tempo_minutos
            FROM app.pedidos p
            JOIN app.comandas c ON c.uuid = p.comanda_id
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE p.tenant_id = $1 AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `
        const { rows } = await pool.query(query, [tenantId])
        return rows.map(row => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            comandaId: row.comanda_id,
            status: row.status,
            total: Number(row.total),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            mesaNumero: row.mesa_numero,
            clienteNome: row.cliente_nome,
            comandaSeqId: row.comanda_seq_id,
            qtdItens: Number(row.qtd_itens),
            tempoAtendimento: `${Math.floor(Number(row.tempo_minutos))} min`
        }))
    }

    async findMyOpenPedidos(tenantId: string, whatsapp: string): Promise<any[]> {
        const query = `
            SELECT 
                p.*, 
                m.numero as mesa_numero,
                c.seq_id as comanda_seq_id
            FROM app.pedidos p
            JOIN app.comandas c ON c.uuid = p.comanda_id
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE p.tenant_id = $1 
              AND c.whatsapp = $2 
              AND p.created_at >= CURRENT_DATE 
              AND p.deleted_at IS NULL
              AND p.status NOT IN ('CANCELADO', 'PAGO')
            ORDER BY p.created_at DESC
        `
        const { rows } = await pool.query(query, [tenantId, whatsapp])
        return rows.map(row => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            comandaSeqId: row.comanda_seq_id,
            status: row.status,
            total: Number(row.total),
            createdAt: row.created_at,
            mesaNumero: row.mesa_numero
        }))
    }

    async findRestauranteMetas(tenantId: string): Promise<any> {
        const { rows } = await pool.query(
            `SELECT 
                uuid, 
                tenant_id, 
                ROUND(EXTRACT(EPOCH FROM recebido_min)/60)::integer as recebido_min,
                ROUND(EXTRACT(EPOCH FROM pronto_min)/60)::integer as pronto_min,
                created_at,
                updated_at
            FROM app.restaurante_metas WHERE tenant_id = $1`,
            [tenantId]
        )
        return rows[0] || null
    }

    async upsertRestauranteMetas(tenantId: string, data: any): Promise<void> {
        const { recebido_min, pronto_min } = data
        await pool.query(`
            INSERT INTO app.restaurante_metas (tenant_id, recebido_min, pronto_min)
            VALUES ($1, $2 * interval '1 minute', $3 * interval '1 minute')
            ON CONFLICT (tenant_id) DO UPDATE SET
                recebido_min = EXCLUDED.recebido_min,
                pronto_min = EXCLUDED.pronto_min,
                updated_at = NOW()
        `, [tenantId, recebido_min, pronto_min])
    }

    async findPedidosKDS(tenantId: string, type?: string): Promise<any[]> {
        let statusFilter = "p.status IN ('NOVO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE')"
        if (type === 'cozinheiro') {
            statusFilter = "p.status IN ('NOVO', 'EM_PREPARO')"
        } else if (type === 'garcom') {
            statusFilter = "p.status = 'PRONTO'"
        }

        const query = `
            SELECT 
                p.*, 
                m.numero as mesa_numero,
                c.cliente_nome,
                (SELECT JSON_BUILD_OBJECT(
                    'recebido_min', ROUND(EXTRACT(EPOCH FROM rm.recebido_min)/60), 
                    'pronto_min', ROUND(EXTRACT(EPOCH FROM rm.pronto_min)/60)
                 ) FROM app.restaurante_metas rm WHERE rm.tenant_id = $1 LIMIT 1) as metas
            FROM app.pedidos p
            JOIN app.comandas c ON c.uuid = p.comanda_id
            JOIN app.mesas m ON m.uuid = c.mesa_id
            WHERE p.tenant_id = $1 
              AND ${statusFilter}
              AND p.deleted_at IS NULL
            ORDER BY 
                CASE 
                    WHEN p.status = 'EM_PREPARO' THEN 1 
                    WHEN p.status = 'NOVO' THEN 2 
                    WHEN p.status = 'PRONTO' THEN 3
                    ELSE 4 
                END ASC,
                p.created_at ASC
        `;
        const { rows: pedidos } = await pool.query(query, [tenantId])

        const result = []
        for (const p of pedidos) {
            const items = await this.findItemsByPedido(tenantId, p.uuid)
            // Calcula a meta dinâmica baseada no item mais demorado
            const maxPrepTime = items.reduce((max: number, item: any) => {
                const prepTime = item.tempoPreparoMax || 0
                return Math.max(max, prepTime)
            }, 0)

            // Fallback: se não houver meta nos produtos, usa o padrão de 10min solicitado.
            const pedidoPreparoMeta = maxPrepTime > 0 ? maxPrepTime : 10

            result.push({
                uuid: p.uuid,
                seqId: p.seq_id,
                tenantId: p.tenant_id,
                comandaId: p.comanda_id,
                status: p.status,
                total: Number(p.total),
                createdAt: p.created_at,
                updatedAt: p.updated_at,
                mesaNumero: p.mesa_numero,
                clienteNome: p.cliente_nome,
                metas: {
                    recebido_min: p.metas?.recebido_min || 5, // Meta para entrar em produção
                    preparo_min: pedidoPreparoMeta,         // Meta de preparo (produção ativa)
                    pronto_min: p.metas?.pronto_min || 10   // Meta para ser despachado (após pronto)
                },
                items
            })
        }
        return result
    }

    private mapToProps(row: any): ComandaProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            mesaId: row.mesa_id,
            mesaNumero: row.mesa_numero,
            clienteNome: row.cliente_nome,
            whatsapp: row.whatsapp,
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

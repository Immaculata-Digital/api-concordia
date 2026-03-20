import { pool } from '../../../infra/database/pool'
import { Mesa, MesaProps } from '../entities/Mesa'

export class PostgresMesaRepository {
    async findAll(tenantId: string): Promise<any[]> {
        const query = `
            SELECT 
                m.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'nome', c.cliente_nome,
                            'whatsapp', c.whatsapp,
                            'comandaId', c.uuid
                        )
                    ) FILTER (WHERE c.uuid IS NOT NULL),
                    '[]'::json
                ) as active_clients
            FROM app.mesas m
            LEFT JOIN app.comandas c ON c.mesa_id = m.uuid AND c.status = 'ABERTA' AND c.deleted_at IS NULL
            WHERE m.tenant_id = $1 AND m.deleted_at IS NULL
            GROUP BY m.uuid
            ORDER BY m.numero ASC
        `
        const { rows } = await pool.query(query, [tenantId])
        return rows.map(this.mapToPublicProps)
    }

    async getActiveClients(tenantId: string, mesaUuid: string): Promise<any[]> {
        const query = `
            SELECT
                c.cliente_nome as nome,
                c.whatsapp,
                c.uuid as "comandaId"
            FROM app.comandas c
            WHERE c.tenant_id = $1
              AND c.mesa_id = $2
              AND c.status = 'ABERTA'
              AND c.deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [tenantId, mesaUuid])
        return rows
    }

    private mapToPublicProps(row: any): any {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            numero: row.numero,
            capacidade: row.capacidade,
            status: row.status,
            activeClients: row.active_clients || []
        }
    }

    async findById(tenantId: string, uuid: string): Promise<MesaProps | null> {
        const query = `
            SELECT * FROM app.mesas 
            WHERE tenant_id = $1 AND uuid = $2 AND deleted_at IS NULL
        `
        const { rows } = await pool.query(query, [tenantId, uuid])
        if (rows.length === 0) return null
        return this.mapToProps(rows[0])
    }

    async create(mesa: Mesa): Promise<MesaProps> {
        const props = mesa.toJSON()
        const query = `
            INSERT INTO app.mesas (
                uuid, tenant_id, numero, capacidade, status, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            props.uuid, props.tenantId, props.numero,
            props.capacidade, props.status, props.createdBy, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.mapToProps(rows[0])
    }

    async update(mesa: Mesa): Promise<MesaProps> {
        const props = mesa.toJSON()
        const query = `
            UPDATE app.mesas SET 
                numero = $3,
                capacidade = $4,
                status = $5,
                updated_by = $6,
                updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
            RETURNING *
        `
        const values = [
            props.tenantId, props.uuid,
            props.numero, props.capacidade, props.status, props.updatedBy
        ]
        const { rows } = await pool.query(query, values)
        return this.mapToProps(rows[0])
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        const query = `
            UPDATE app.mesas 
            SET deleted_at = NOW() 
            WHERE tenant_id = $1 AND uuid = $2
        `
        await pool.query(query, [tenantId, uuid])
    }

    async updateStatus(tenantId: string, uuid: string, status: string): Promise<void> {
        const query = `
            UPDATE app.mesas SET 
                status = $3,
                updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
        `
        const values = [tenantId, uuid, status]
        await pool.query(query, values)
    }

    async closeTable(tenantId: string, mesaId: string, userId: string): Promise<void> {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // 1. Atualizar todas as comandas não pagas/canceladas desta mesa para PAGA
            await client.query(`
                UPDATE app.comandas 
                SET status = 'PAGA',
                    fechada_em = NOW(),
                    updated_by = $3,
                    updated_at = NOW()
                WHERE tenant_id = $1 AND mesa_id = $2 AND status IN ('ABERTA', 'FECHADA')
            `, [tenantId, mesaId, userId])

            // 2. Atualizar o status da mesa para LIVRE
            await client.query(`
                UPDATE app.mesas 
                SET status = 'LIVRE',
                    updated_at = NOW(),
                    updated_by = $3
                WHERE tenant_id = $1 AND uuid = $2
            `, [tenantId, mesaId, userId])

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    private mapToProps(row: any): MesaProps {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            numero: row.numero,
            capacidade: row.capacidade,
            status: row.status,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at
        }
    }
}

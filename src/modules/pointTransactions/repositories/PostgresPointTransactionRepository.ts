import { pool } from '../../../infra/database/pool'
import { PointTransaction, PointTransactionProps } from '../entities/PointTransaction'
import { IPointTransactionRepository } from './IPointTransactionRepository'

export class PostgresPointTransactionRepository implements IPointTransactionRepository {
    private async mapRowToProps(row: any): Promise<PointTransactionProps & { clientName?: string, rewardItemName?: string }> {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            clientId: row.client_id,
            type: row.type,
            points: row.points,
            resultingBalance: row.resulting_balance,
            origin: row.origin,
            rewardItemId: row.reward_item_id,
            lojaId: row.loja_id,
            observation: row.observation,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            clientName: row.client_name,
            rewardItemName: row.reward_item_name
        }
    }

    async findAll(tenantId: string, filters?: { clientId?: string }): Promise<any[]> {
        let query = `
            SELECT t.*, p.name as client_name, prod.nome as reward_item_name
            FROM app.point_transactions t
            LEFT JOIN app.pluvyt_clients c ON c.uuid = t.client_id
            LEFT JOIN app.people p ON p.uuid = c.person_id
            LEFT JOIN app.recompensas r ON r.uuid = t.reward_item_id
            LEFT JOIN app.produtos prod ON prod.uuid = r.produto_id
            WHERE t.tenant_id = $1
        `
        const params: any[] = [tenantId]

        if (filters?.clientId) {
            query += ` AND t.client_id = $2`
            params.push(filters.clientId)
        }

        query += ` ORDER BY t.created_at DESC`

        const result = await pool.query(query, params)
        return Promise.all(result.rows.map(row => this.mapRowToProps(row)))
    }

    async findById(tenantId: string, uuid: string): Promise<any | null> {
        const result = await pool.query(
            `SELECT t.*, p.name as client_name, prod.nome as reward_item_name
             FROM app.point_transactions t
             LEFT JOIN app.pluvyt_clients c ON c.uuid = t.client_id
             LEFT JOIN app.people p ON p.uuid = c.person_id
             LEFT JOIN app.recompensas r ON r.uuid = t.reward_item_id
             LEFT JOIN app.produtos prod ON prod.uuid = r.produto_id
             WHERE t.tenant_id = $1 AND t.uuid = $2`,
            [tenantId, uuid]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async create(transaction: PointTransaction): Promise<PointTransactionProps> {
        const data = transaction.toJSON()
        const result = await pool.query(
            `INSERT INTO app.point_transactions (
                uuid, tenant_id, client_id, type, points, resulting_balance, 
                origin, reward_item_id, loja_id, observation, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                data.uuid, data.tenantId, data.clientId, data.type, data.points,
                data.resultingBalance, data.origin, data.rewardItemId || null,
                data.lojaId || null, data.observation || null, data.createdBy, data.updatedBy
            ]
        )

        return this.mapRowToProps(result.rows[0])
    }

    async update(transaction: PointTransaction): Promise<PointTransactionProps> {
        const data = transaction.toJSON()
        const result = await pool.query(
            `UPDATE app.point_transactions SET
                client_id = $3, type = $4, points = $5, resulting_balance = $6,
                origin = $7, reward_item_id = $8, loja_id = $9, observation = $10, 
                updated_by = $11, updated_at = NOW()
            WHERE tenant_id = $1 AND uuid = $2
            RETURNING *`,
            [
                data.tenantId, data.uuid, data.clientId, data.type, data.points,
                data.resultingBalance, data.origin, data.rewardItemId || null,
                data.lojaId || null, data.observation || null, data.updatedBy
            ]
        )

        return this.mapRowToProps(result.rows[0])
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.point_transactions WHERE tenant_id = $1 AND uuid = $2', [tenantId, uuid])
    }
}

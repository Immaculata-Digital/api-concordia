import { pool } from '../../../infra/database/pool'
import { PluvytClient, PluvytClientProps } from '../entities/PluvytClient'
import { IPluvytClientRepository } from './IPluvytClientRepository'

export class PostgresPluvytClientRepository implements IPluvytClientRepository {
    private async mapRowToEntity(row: any): Promise<PluvytClient> {
        return PluvytClient.restore({
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            personId: row.person_id,
            saldo: row.saldo,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            deletedAt: row.deleted_at,
            // Enriched data from JOIN
            ...(row.person_name && { personName: row.person_name }),
            ...(row.person_cpf_cnpj && { personCpfCnpj: row.person_cpf_cnpj })
        } as any)
    }

    async findAll(tenantId: string): Promise<PluvytClient[]> {
        const result = await pool.query(
            `SELECT c.*, p.name as person_name, p.cpf_cnpj as person_cpf_cnpj
             FROM app.pluvyt_clients c
             JOIN app.people p ON p.uuid = c.person_id
             WHERE c.tenant_id = $1 AND c.deleted_at IS NULL
             ORDER BY c.created_at DESC`,
            [tenantId]
        )
        return Promise.all(result.rows.map(row => this.mapRowToEntity(row)))
    }

    async findById(uuid: string, tenantId: string): Promise<PluvytClient | null> {
        const result = await pool.query(
            `SELECT c.*, p.name as person_name, p.cpf_cnpj as person_cpf_cnpj
             FROM app.pluvyt_clients c
             JOIN app.people p ON p.uuid = c.person_id
             WHERE c.uuid = $1 AND c.tenant_id = $2 AND c.deleted_at IS NULL`,
            [uuid, tenantId]
        )
        return result.rows[0] ? this.mapRowToEntity(result.rows[0]) : null
    }

    async findByPersonId(personId: string, tenantId: string): Promise<PluvytClient | null> {
        const result = await pool.query(
            `SELECT * FROM app.pluvyt_clients 
             WHERE person_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
            [personId, tenantId]
        )
        return result.rows[0] ? this.mapRowToEntity(result.rows[0]) : null
    }

    async create(client: PluvytClient): Promise<void> {
        const data = client.toJSON()
        await pool.query(
            `INSERT INTO app.pluvyt_clients (
                uuid, tenant_id, person_id, saldo, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $5)`,
            [data.uuid, data.tenantId, data.personId, data.saldo, data.createdBy]
        )
    }

    async update(client: PluvytClient): Promise<void> {
        const data = client.toJSON()
        await pool.query(
            `UPDATE app.pluvyt_clients SET
                saldo = $3, updated_by = $4, updated_at = NOW()
            WHERE uuid = $1 AND tenant_id = $2`,
            [data.uuid, data.tenantId, data.saldo, data.updatedBy]
        )
    }

    async delete(uuid: string, tenantId: string): Promise<void> {
        await pool.query(
            `UPDATE app.pluvyt_clients SET deleted_at = NOW() 
             WHERE uuid = $1 AND tenant_id = $2`,
            [uuid, tenantId]
        )
    }
}

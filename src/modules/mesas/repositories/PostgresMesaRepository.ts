import { pool } from '../../../infra/database/pool'
import { Mesa, MesaProps } from '../entities/Mesa'

export class PostgresMesaRepository {
    async findAll(tenantId: string): Promise<MesaProps[]> {
        const query = `
            SELECT * FROM app.mesas 
            WHERE tenant_id = $1 AND deleted_at IS NULL
            ORDER BY numero ASC
        `
        const { rows } = await pool.query(query, [tenantId])
        return rows.map(this.mapToProps)
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

import { pool } from '../../../infra/database/pool'
import { encryptPassword, decryptPassword } from '../../../utils/passwordCipher'

export type RemetenteProps = {
    uuid: string
    tenantId: string
    nome: string
    email: string
    senha?: string
    smtpHost: string
    smtpPort: number
    smtpSecure: boolean
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export class PostgresRemetenteRepository {
    private mapRowToProps(row: any, includePassword = false): RemetenteProps {
        return {
            uuid: row.uuid,
            tenantId: row.tenant_id,
            nome: row.nome,
            email: row.email,
            smtpHost: row.smtp_host,
            smtpPort: row.smtp_port,
            smtpSecure: row.smtp_secure,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
            ...(includePassword ? { senha: row.senha } : {}),
        }
    }

    async findAll(tenantId: string): Promise<RemetenteProps[]> {
        const result = await pool.query(
            'SELECT * FROM app.remetentes_smtp WHERE tenant_id = $1 ORDER BY nome ASC',
            [tenantId]
        )
        return result.rows.map(row => this.mapRowToProps(row))
    }

    async findById(tenantId: string, uuid: string, includePassword = false): Promise<RemetenteProps | null> {
        const result = await pool.query(
            'SELECT * FROM app.remetentes_smtp WHERE tenant_id = $1 AND uuid = $2',
            [tenantId, uuid]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0], includePassword) : null
    }

    async create(tenantId: string, data: any): Promise<RemetenteProps> {
        const encryptedSenha = encryptPassword(data.senha)
        const result = await pool.query(
            `INSERT INTO app.remetentes_smtp (
                tenant_id, nome, email, senha, smtp_host, smtp_port, smtp_secure, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                tenantId, data.nome, data.email, encryptedSenha, data.smtpHost, 
                data.smtpPort, data.smtpSecure, data.createdBy, data.createdBy
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async update(tenantId: string, uuid: string, data: any): Promise<RemetenteProps> {
        const fields: string[] = []
        const values: any[] = []
        let i = 3

        fields.push(`nome = $${i++}`)
        values.push(data.nome)
        fields.push(`email = $${i++}`)
        values.push(data.email)
        fields.push(`smtp_host = $${i++}`)
        values.push(data.smtpHost)
        fields.push(`smtp_port = $${i++}`)
        values.push(data.smtpPort)
        fields.push(`smtp_secure = $${i++}`)
        values.push(data.smtpSecure)
        fields.push(`updated_by = $${i++}`)
        values.push(data.updatedBy)
        fields.push(`updated_at = NOW()`)

        if (data.senha) {
            fields.push(`senha = $${i++}`)
            values.push(encryptPassword(data.senha))
        }

        const query = `UPDATE app.remetentes_smtp SET ${fields.join(', ')} WHERE tenant_id = $1 AND uuid = $2 RETURNING *`
        const result = await pool.query(query, [tenantId, uuid, ...values])
        
        if (result.rows.length === 0) throw new Error('Remetente não encontrado')
        return this.mapRowToProps(result.rows[0])
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.remetentes_smtp WHERE tenant_id = $1 AND uuid = $2', [tenantId, uuid])
    }
}

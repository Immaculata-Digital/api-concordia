import { pool } from '../../../infra/database/pool'
import { User, UserProps } from '../entities/User'
import { IUserRepository } from './IUserRepository'

export class PostgresUserRepository implements IUserRepository {
    private async mapRowToProps(row: any): Promise<UserProps> {
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            fullName: row.full_name,
            login: row.login,
            email: row.email,
            password: row.password,
            allowFeatures: row.allow_features || [],
            deniedFeatures: row.denied_features || [],
            groupIds: row.group_ids || [],
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async findAll(tenantId: string): Promise<UserProps[]> {
        const result = await pool.query(
            `SELECT u.*, 
       COALESCE(ARRAY_AGG(m.group_id) FILTER (WHERE m.group_id IS NOT NULL), '{}') as group_ids
       FROM app.users u
       LEFT JOIN app.access_group_memberships m ON m.user_id = u.uuid
       WHERE u.tenant_id = $1
       GROUP BY u.uuid`,
            [tenantId]
        )
        return Promise.all(result.rows.map(row => this.mapRowToProps(row)))
    }

    async findById(tenantId: string, uuid: string): Promise<UserProps | null> {
        const result = await pool.query(
            `SELECT u.*, 
       COALESCE(ARRAY_AGG(m.group_id) FILTER (WHERE m.group_id IS NOT NULL), '{}') as group_ids
       FROM app.users u
       LEFT JOIN app.access_group_memberships m ON m.user_id = u.uuid
       WHERE u.tenant_id = $1 AND u.uuid = $2
       GROUP BY u.uuid`,
            [tenantId, uuid]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async findByLogin(tenantId: string, login: string): Promise<UserProps | null> {
        const result = await pool.query(
            'SELECT * FROM app.users WHERE tenant_id = $1 AND login = $2',
            [tenantId, login]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async findByEmail(tenantId: string, email: string): Promise<UserProps | null> {
        const result = await pool.query(
            'SELECT * FROM app.users WHERE tenant_id = $1 AND email = $2',
            [tenantId, email]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<(UserProps & { passwordHash: string, emailVerifiedAt?: Date | null }) | null> {
        const result = await pool.query(
            'SELECT * FROM app.users WHERE login = $1 OR email = $1',
            [loginOrEmail]
        )
        const row = result.rows[0]
        if (!row) return null
        const props = await this.mapRowToProps(row)
        return { ...props, passwordHash: row.password_hash || row.password, emailVerifiedAt: row.email_verified_at }
    }

    async create(user: User): Promise<UserProps> {
        const data = user.toJSON()
        const result = await pool.query(
            `INSERT INTO app.users (
        uuid, tenant_id, full_name, login, email, password, 
        allow_features, denied_features, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
            [
                data.uuid, data.tenantId, data.fullName, data.login, data.email, data.password,
                JSON.stringify(data.allowFeatures), JSON.stringify(data.deniedFeatures),
                data.createdBy, data.updatedBy
            ]
        )

        // Sync groups if any
        await this.syncGroups(data.uuid, data.tenantId, data.groupIds)

        return this.mapRowToProps({ ...result.rows[0], group_ids: data.groupIds })
    }

    async update(user: User): Promise<UserProps> {
        const data = user.toJSON()
        const result = await pool.query(
            `UPDATE app.users SET
        full_name = $3, login = $4, email = $5, password = $6,
        allow_features = $7, denied_features = $8, updated_by = $9, updated_at = NOW()
      WHERE tenant_id = $1 AND uuid = $2
      RETURNING *`,
            [
                data.tenantId, data.uuid, data.fullName, data.login, data.email, data.password,
                JSON.stringify(data.allowFeatures), JSON.stringify(data.deniedFeatures),
                data.updatedBy
            ]
        )

        await this.syncGroups(data.uuid, data.tenantId, data.groupIds)

        return this.mapRowToProps({ ...result.rows[0], group_ids: data.groupIds })
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.users WHERE tenant_id = $1 AND uuid = $2', [tenantId, uuid])
    }

    private async syncGroups(userUuid: string, tenantId: string, groupIds: string[] = []): Promise<void> {
        await pool.query('DELETE FROM app.access_group_memberships WHERE user_id = $1', [userUuid])
        for (const groupId of groupIds) {
            await pool.query(
                'INSERT INTO app.access_group_memberships (tenant_id, user_id, group_id) VALUES ($1, $2, $3)',
                [tenantId, userUuid, groupId]
            )
        }
    }
}

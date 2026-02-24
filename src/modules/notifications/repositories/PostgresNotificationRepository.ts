import { pool } from '../../../infra/database/pool'

export interface NotificationProps {
    uuid: string
    tenantId: string
    titulo: string
    mensagem: string
    tipo: string
    dataId?: string
    link?: string
    lida: boolean
    createdAt: Date
    createdBy?: string
}

export class PostgresNotificationRepository {
    async findAll(tenantId: string, userId: string, limit: number = 20): Promise<NotificationProps[]> {
        const query = `
            SELECT n.*, 
            CASE WHEN nl.notificacao_id IS NOT NULL THEN TRUE ELSE FALSE END as lida_por_usuario
            FROM app.notificacoes n
            LEFT JOIN app.notificacoes_lidas nl ON nl.notificacao_id = n.uuid AND nl.usuario_id = $2
            WHERE n.tenant_id = $1 
            ORDER BY n.created_at DESC 
            LIMIT $3
        `
        const { rows } = await pool.query(query, [tenantId, userId, limit])
        return rows.map(row => this.mapToProps({ ...row, lida: row.lida_por_usuario }))
    }

    async findUnreadCount(tenantId: string, userId: string): Promise<number> {
        const query = `
            SELECT COUNT(*) 
            FROM app.notificacoes n
            LEFT JOIN app.notificacoes_lidas nl ON nl.notificacao_id = n.uuid AND nl.usuario_id = $2
            WHERE n.tenant_id = $1 AND nl.notificacao_id IS NULL
        `
        const { rows } = await pool.query(query, [tenantId, userId])
        return parseInt(rows[0].count)
    }

    async create(data: Partial<NotificationProps>): Promise<NotificationProps> {
        const query = `
            INSERT INTO app.notificacoes (
                tenant_id, titulo, mensagem, tipo, data_id, link, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `
        const values = [
            data.tenantId, data.titulo, data.mensagem,
            data.tipo, data.dataId, data.link, data.createdBy
        ]
        const { rows } = await pool.query(query, values)
        // Por padrão uma nova notificação é não lida para o criador também (se houver)
        return this.mapToProps({ ...rows[0], lida: false })
    }

    async markAsRead(tenantId: string, userId: string, uuid: string): Promise<void> {
        // Verifica se a notificação pertence ao tenant
        const checkQuery = 'SELECT uuid FROM app.notificacoes WHERE tenant_id = $1 AND uuid = $2'
        const { rows } = await pool.query(checkQuery, [tenantId, uuid])

        if (rows.length > 0) {
            await pool.query(
                `INSERT INTO app.notificacoes_lidas (notificacao_id, usuario_id)
                 VALUES ($1, $2)
                 ON CONFLICT (notificacao_id, usuario_id) DO NOTHING`,
                [uuid, userId]
            )
        }
    }

    async markAllAsRead(tenantId: string, userId: string): Promise<void> {
        await pool.query(
            `INSERT INTO app.notificacoes_lidas (notificacao_id, usuario_id)
             SELECT uuid, $2 FROM app.notificacoes WHERE tenant_id = $1
             ON CONFLICT (notificacao_id, usuario_id) DO NOTHING`,
            [tenantId, userId]
        )
    }

    async markAsUnread(tenantId: string, userId: string, uuid: string): Promise<void> {
        await pool.query(
            'DELETE FROM app.notificacoes_lidas WHERE notificacao_id = $1 AND usuario_id = $2',
            [uuid, userId]
        )
    }

    private mapToProps(row: any): NotificationProps {
        return {
            uuid: row.uuid,
            tenantId: row.tenant_id,
            titulo: row.titulo,
            mensagem: row.mensagem,
            tipo: row.tipo,
            dataId: row.data_id,
            link: row.link,
            lida: row.lida,
            createdAt: row.created_at,
            createdBy: row.created_by
        }
    }
}

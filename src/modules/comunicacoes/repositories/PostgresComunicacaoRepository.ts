import { pool } from '../../../infra/database/pool'

export type ComunicacaoProps = {
    uuid: string
    tenantId: string
    tipo: string
    descricao: string
    assunto: string
    html: string
    remetenteId: string
    tipoEnvio: string
    dataAgendamento?: Date
    status: string
    totalEnviados: number
    totalEntregues: number
    totalAbertos: number
    totalCliques: number
    chave?: string
    tipoDestinatario: string
    lojasIds?: string
    clientesIds?: string
    clientePodeExcluir: boolean
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export class PostgresComunicacaoRepository {
    private mapRowToProps(row: any): ComunicacaoProps {
        return {
            uuid: row.uuid,
            tenantId: row.tenant_id,
            tipo: row.tipo,
            descricao: row.descricao,
            assunto: row.assunto,
            html: row.html,
            remetenteId: row.remetente_id,
            tipoEnvio: row.tipo_envio,
            dataAgendamento: row.data_agendamento,
            status: row.status,
            totalEnviados: row.total_enviados || 0,
            totalEntregues: row.total_entregues || 0,
            totalAbertos: row.total_abertos || 0,
            totalCliques: row.total_cliques || 0,
            chave: row.chave,
            tipoDestinatario: row.tipo_destinatario,
            lojasIds: row.lojas_ids,
            clientesIds: row.clientes_ids,
            clientePodeExcluir: row.cliente_pode_excluir,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    async findAll(tenantId: string): Promise<ComunicacaoProps[]> {
        const result = await pool.query(
            'SELECT * FROM app.campanhas_disparo WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenantId]
        )
        return result.rows.map(row => this.mapRowToProps(row))
    }

    async findById(tenantId: string, uuid: string): Promise<ComunicacaoProps | null> {
        const result = await pool.query(
            'SELECT * FROM app.campanhas_disparo WHERE tenant_id = $1 AND uuid = $2',
            [tenantId, uuid]
        )
        return result.rows[0] ? this.mapRowToProps(result.rows[0]) : null
    }

    async create(tenantId: string, data: any): Promise<ComunicacaoProps> {
        const result = await pool.query(
            `INSERT INTO app.campanhas_disparo (
                tenant_id, tipo, descricao, assunto, html, remetente_id, tipo_envio, chave, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                tenantId, data.tipo || 'email', data.descricao, data.assunto, data.html, 
                data.remetenteId || null, data.tipoEnvio || 'manual', data.chave || null, 
                data.createdBy, data.createdBy
            ]
        )
        return this.mapRowToProps(result.rows[0])
    }

    async update(tenantId: string, uuid: string, data: any): Promise<ComunicacaoProps> {
        const fields: string[] = []
        const values: any[] = []
        let i = 3

        if (data.tipo !== undefined) { fields.push(`tipo = $${i++}`); values.push(data.tipo) }
        if (data.descricao !== undefined) { fields.push(`descricao = $${i++}`); values.push(data.descricao) }
        if (data.assunto !== undefined) { fields.push(`assunto = $${i++}`); values.push(data.assunto) }
        if (data.html !== undefined) { fields.push(`html = $${i++}`); values.push(data.html) }
        if (data.remetenteId !== undefined) { fields.push(`remetente_id = $${i++}`); values.push(data.remetenteId) }
        if (data.tipoEnvio !== undefined) { fields.push(`tipo_envio = $${i++}`); values.push(data.tipoEnvio) }
        
        fields.push(`updated_by = $${i++}`)
        values.push(data.updatedBy)
        fields.push(`updated_at = NOW()`)

        const query = `UPDATE app.campanhas_disparo SET ${fields.join(', ')} WHERE tenant_id = $1 AND uuid = $2 RETURNING *`
        const result = await pool.query(query, [tenantId, uuid, ...values])
        
        if (result.rows.length === 0) throw new Error('Comunicação não encontrada')
        return this.mapRowToProps(result.rows[0])
    }

    async delete(tenantId: string, uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.campanhas_disparo WHERE tenant_id = $1 AND uuid = $2', [tenantId, uuid])
    }
}

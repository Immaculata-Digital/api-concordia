import { pool } from '../../../infra/database/pool'

export class PostgresReportRepository {
    async getOrdersDashboardSummary(tenantId: string) {
        const query = `
            WITH stats_hoje AS (
                SELECT 
                    COALESCE(SUM(total), 0) as faturamento,
                    COALESCE(AVG(total), 0) as ticket_medio,
                    COUNT(*) as pedidos_hoje
                FROM app.pedidos 
                WHERE tenant_id = $1 AND status != 'CANCELADO' 
                  AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
                  AND deleted_at IS NULL
            ),
            mesas_ativas AS (
                SELECT COUNT(*) as count FROM app.mesas 
                WHERE tenant_id = $1 AND status = 'OCUPADA' AND deleted_at IS NULL
            ),
            stats_ontem AS (
                SELECT 
                    COALESCE(SUM(total), 0) as faturamento,
                    COALESCE(AVG(total), 0) as ticket_medio,
                    COUNT(*) as pedidos_ontem
                FROM app.pedidos 
                WHERE tenant_id = $1 AND status != 'CANCELADO' 
                  AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date - INTERVAL '1 day'
                  AND deleted_at IS NULL
            )
            SELECT 
                (SELECT faturamento FROM stats_hoje) as faturamento_hoje,
                (SELECT faturamento FROM stats_ontem) as faturamento_ontem,
                (SELECT pedidos_hoje FROM stats_hoje) as pedidos_hoje,
                (SELECT pedidos_ontem FROM stats_ontem) as pedidos_ontem,
                (SELECT ticket_medio FROM stats_hoje) as ticket_medio_hoje,
                (SELECT ticket_medio FROM stats_ontem) as ticket_medio_ontem,
                (SELECT count FROM mesas_ativas) as mesas_ativas
        `
        const { rows } = await pool.query(query, [tenantId])
        const row = rows[0]

        const calcTrend = (today: number, yesterday: number) => {
            if (yesterday === 0) return today > 0 ? 100 : 0
            return ((today - yesterday) / yesterday) * 100
        }

        return {
            faturamento: {
                valor: Number(row.faturamento_hoje),
                trend: calcTrend(Number(row.faturamento_hoje), Number(row.faturamento_ontem))
            },
            pedidos: {
                valor: Number(row.pedidos_hoje),
                trend: calcTrend(Number(row.pedidos_hoje), Number(row.pedidos_ontem))
            },
            ticketMedio: {
                valor: Number(row.ticket_medio_hoje),
                trend: calcTrend(Number(row.ticket_medio_hoje), Number(row.ticket_medio_ontem))
            },
            mesasAtivas: Number(row.mesas_ativas)
        }
    }

    async getOrdersSalesPerHour(tenantId: string) {
        const query = `
            SELECT 
                EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Sao_Paulo') as hour, 
                COALESCE(SUM(total), 0) as total
            FROM app.pedidos
            WHERE tenant_id = $1 AND status != 'CANCELADO' 
              AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
              AND deleted_at IS NULL
            GROUP BY hour 
            ORDER BY hour
        `
        const { rows } = await pool.query(query, [tenantId])
        
        // Ensure all hours from 08 to 22 are present for the chart
        const hours = Array.from({ length: 15 }, (_, i) => i + 8) // 08h to 22h
        return hours.map(h => {
             const found = rows.find((r: any) => Number(r.hour) === h)
             return {
                 hour: `${String(h).padStart(2, '0')}h`,
                 total: found ? Number(found.total) : 0
             }
        })
    }

    async getOrdersStatusSummary(tenantId: string) {
        const query = `
            SELECT status, COUNT(*) as count
            FROM app.pedidos
            WHERE tenant_id = $1 AND status != 'CANCELADO' 
              AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
              AND deleted_at IS NULL
            GROUP BY status
        `
        const { rows } = await pool.query(query, [tenantId])

        const tempoQuery = `
            SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60), 0) as avg_min
            FROM app.pedidos
            WHERE tenant_id = $1 AND status IN ('PRONTO', 'ENTREGUE', 'PAGO') 
              AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
              AND deleted_at IS NULL
        `
        const { rows: tempoRows } = await pool.query(tempoQuery, [tenantId])

        const statusMap: Record<string, number> = {
            'EM_PREPARO': 0,
            'PRONTO': 0,
            'ENTREGUE': 0,
            'PAGO': 0,
            'NOVO': 0
        }

        rows.forEach((r: any) => {
            statusMap[r.status] = Number(r.count)
        })

        return {
            preparando: (statusMap['NOVO'] || 0) + (statusMap['EM_PREPARO'] || 0),
            prontos: statusMap['PRONTO'] || 0,
            finalizados: (statusMap['ENTREGUE'] || 0) + (statusMap['PAGO'] || 0),
            tempoMedioPreparo: Math.round(Number(tempoRows[0].avg_min))
        }
    }
}

import { Pool } from 'pg'
import { env } from '../../config/env'

export const pool = new Pool({
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    password: env.database.password,
    max: 10, // Diminuído para ser mais gentil com o servidor remoto
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Aumentado para 30s para conexões lentas
    keepAlive: true
})

pool.on('connect', (client) => {
    // console.log('[DB] New client connected to pool')
})

pool.on('error', (error) => {
    console.error('[DB] Unexpected error on idle client', error)
})

import { createServer } from 'http'
import { app } from './app'
import { env } from './config/env'
import { socketManager } from './infra/websocket/SocketManager'
import { pool } from './infra/database/pool'
import fs from 'fs'
import path from 'path'

const port = env.port
const server = createServer(app)

socketManager.initialize(server)

async function updateLandingPageIcon() {
    try {
        console.log('[DB] Atualizando ícone de Landing Page...')
        const res = await pool.query("UPDATE app.menus SET icon = 'LandingPage', updated_at = CURRENT_TIMESTAMP WHERE key = 'erp:landing-pages:listar'")
        fs.writeFileSync(path.join(__dirname, 'update_landing_success.txt'), 'SUCCESS ' + new Date().toISOString())
        console.log('[DB] ✅ ÍCONES ATUALIZADOS:', res.rowCount)
    } catch (error) {
        fs.writeFileSync(path.join(__dirname, 'update_landing_error.txt'), error instanceof Error ? error.message : String(error))
        console.error('[DB] ❌ ERRO AO ATUALIZAR ÍCONE DE LANDING PAGE:', error)
    }
}
updateLandingPageIcon()

server.listen(port, () => {
    console.log(`[Server] API Concordia rodando na porta ${port}`)
})

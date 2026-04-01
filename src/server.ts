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

server.listen(port, () => {
    console.log(`[Server] API Concordia rodando na porta ${port}`)
})

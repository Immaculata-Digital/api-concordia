import { app } from './app'
import { env } from './config/env'

const port = env.port

app.listen(port, () => {
    console.log(`[Server] API Concordia rodando na porta ${port}`)
})

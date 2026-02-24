import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { publicRoutes, routes } from './routes'

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use('/api', publicRoutes)
app.use('/api', routes)

// Middleware de erro genérico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            message: 'O arquivo enviado é muito grande. O limite máximo é de 10MB.'
        })
    }
    console.error(err)
    res.status(500).json({ message: 'Erro interno do servidor' })
})

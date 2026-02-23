import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { publicRoutes, routes } from './routes'

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api', publicRoutes)
app.use('/api', routes)

// Middleware de erro genérico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ message: 'Erro interno do servidor' })
})

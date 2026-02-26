import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { publicRoutes, routes } from './routes'

export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/api', publicRoutes)
app.use('/api', routes)

// Middleware de erro genérico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);

    const status = err.statusCode || err.status || 500;

    if (status >= 400 && status < 500) {
        return res.status(status).json({
            status: 'error',
            message: err.message || 'Erro na requisição'
        });
    }

    return res.status(500).json({ 
        status: 'error',
        message: 'Ocorreu um problema em nosso servidor. Tente novamente mais tarde' 
    });
})

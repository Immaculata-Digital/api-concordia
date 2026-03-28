import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { publicRoutes, routes } from './routes'
import { convertImagesMiddleware } from './core/middlewares/convertImagesMiddleware'
import { telemetryMiddleware } from './core/middlewares/telemetryMiddleware'
import { errorHandler } from './core/middlewares/errorHandler'

export const app = express()

// Comece a medir o tempo e preparar os intercepts o mais cedo possível
app.use(telemetryMiddleware)

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '200mb' }))

// Converte automaticamente todas as imagens raster (base64) para WebP em todo POST/PUT/PATCH
app.use(convertImagesMiddleware)

app.use('/api', publicRoutes)
app.use('/api', routes)

// Middleware de erro genérico
app.use(errorHandler)

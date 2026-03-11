import { Router } from 'express'
import { getConfigHandler } from './brand.routes'

export const publicBrandRoutes = Router()

// Rota pública para obter configuração (necessário passar tenantId como parâmetro ou query)
publicBrandRoutes.get('/', getConfigHandler)
publicBrandRoutes.get('/:tenantId', getConfigHandler)

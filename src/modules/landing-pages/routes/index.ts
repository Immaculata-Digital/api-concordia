import { Router } from 'express'
import { landingPageRoutes } from './landing-page.routes'
import { identidadeVisualRoutes } from './identidade-visual.routes'

export const landingPagesRouter = Router()

landingPagesRouter.use('/identidade-visual', identidadeVisualRoutes)
landingPagesRouter.use('/', landingPageRoutes) // Mantém as rotas de landing-pages na raiz do prefixo

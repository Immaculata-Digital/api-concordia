import { Router } from 'express'
import { authenticate } from '../core/middlewares/authenticate'
import { userRoutes } from '../modules/users/routes/user.routes'
import { authRoutes } from '../modules/auth/routes/auth.routes'
import { menuRoutes } from '../modules/menus/routes/menu.routes'
import { featureRoutes } from '../modules/features/routes/feature.routes'
import { accessGroupRoutes } from '../modules/accessGroups/routes/accessGroup.routes'
import { peopleRoutes } from '../modules/people/routes/people.routes'
import { tenantRoutes } from '../modules/tenants/routes/tenant.routes'
import { pluvytClientRoutes } from '../modules/pluvyt-clients/routes/pluvytClient.routes'
import { produtosRoutes } from '../modules/produtos/routes/produtos.routes'
import { publicRecompensasRoutes, protectedRecompensasRoutes } from '../modules/recompensas/routes/recompensas.routes'
import { pointTransactionRoutes } from '../modules/pointTransactions/routes/pointTransaction.routes'
import { cardapioItemRoutes } from '../modules/cardapio/routes/cardapioItem.routes'
import { produtoCategoriaRoutes } from '../modules/produtos/routes/produtoCategoria.routes'
import { mesaRoutes } from '../modules/mesas/routes/mesa.routes'
import { comandaRoutes } from '../modules/comandas/routes/comanda.routes'

import { publicCardapioRoutes } from '../modules/cardapio/routes/public.routes'
import { publicComandaRoutes } from '../modules/comandas/routes/public.routes'

export const publicRoutes = Router()
export const routes = Router()

// Rotas exclusivas de Login/Auth
publicRoutes.use('/auth', authRoutes)

// Rotas Públicas (Sem autenticação)
publicRoutes.use('/public/cardapio', publicCardapioRoutes)
publicRoutes.use('/public/pedidos', publicComandaRoutes)

// Rotas públicas de leitura de recompensas (homepage carousel, etc.)
publicRoutes.use('/recompensas', publicRecompensasRoutes)

// Rotas protegidas
routes.use(authenticate)
routes.use('/usuarios', userRoutes)
routes.use('/grupos-acesso', accessGroupRoutes)
routes.use('/funcionalidades', featureRoutes)
routes.use('/menus', menuRoutes)
routes.use('/peoples', peopleRoutes)
routes.use('/tenants', tenantRoutes)
routes.use('/pluvyt-clients', pluvytClientRoutes)
routes.use('/produtos', produtosRoutes)
routes.use('/recompensas', protectedRecompensasRoutes)
routes.use('/point-transactions', pointTransactionRoutes)
routes.use('/produtos-categorias', produtoCategoriaRoutes)
routes.use('/cardapio-itens', cardapioItemRoutes)
routes.use('/mesas', mesaRoutes)
routes.use('/comandas', comandaRoutes)

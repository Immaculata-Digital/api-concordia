import { Router } from 'express'
import { authenticate } from '../core/middlewares/authenticate'
import { userRoutes } from '../modules/users/routes/user.routes'
import { authRoutes } from '../modules/auth/routes/auth.routes'
import { remetenteRoutes } from '../modules/remetentes/routes/remetente.routes'
import { comunicacaoRoutes } from '../modules/comunicacoes/routes/comunicacao.routes'
import { menuRoutes } from '../modules/menus/routes/menu.routes'
import { featureRoutes } from '../modules/features/routes/feature.routes'
import { appModuleRoutes } from '../modules/app-modules/routes/app-modules.routes'
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
import { brandRoutes } from '../modules/brand/routes/brand.routes'
import { landingPageRoutes } from '../modules/landing-pages/routes/landing-page.routes'
import { productListRoutes } from '../modules/product-lists/routes/product-list.routes'
import { reportRoutes } from '../modules/reports/routes/report.routes'
import { notificationRoutes } from '../modules/notifications/routes/notifications.routes'

import { publicComandaRoutes } from '../modules/comandas/routes/public.routes'
import { publicPeopleRoutes } from '../modules/people/routes/public.routes'
import { publicProdutoCategoriaRoutes, publicProdutoRoutes } from '../modules/produtos/routes/public.routes'
import { publicBrandRoutes } from '../modules/brand/routes/public.routes'
import { publicTenantRoutes } from '../modules/tenants/routes/public.routes'
import { publicLandingPageRoutes } from '../modules/landing-pages/routes/public.routes'
import { publicMesaRoutes } from '../modules/mesas/routes/public.routes'
import { googleMapsRoutes } from '../modules/google-maps/routes/google-maps.routes'

export const publicRoutes = Router()
export const routes = Router()

// Rotas exclusivas de Login/Auth
publicRoutes.use('/auth', authRoutes)
 
// Rotas Públicas (Sem autenticação)
publicRoutes.use('/public/categorias', publicProdutoCategoriaRoutes)
publicRoutes.use('/public/produtos', publicProdutoRoutes)
publicRoutes.use('/public/pedidos', publicComandaRoutes)
publicRoutes.use('/public/people', publicPeopleRoutes)
publicRoutes.use('/public/identidade-visual', publicBrandRoutes)
publicRoutes.use('/public/tenants', publicTenantRoutes)
publicRoutes.use('/public/landing-pages', publicLandingPageRoutes)
publicRoutes.use('/public/mesas', publicMesaRoutes)
publicRoutes.use('/public/google-maps', googleMapsRoutes)
publicRoutes.use('/recompensas', publicRecompensasRoutes)

// Rotas protegidas
routes.use(authenticate)
routes.use('/usuarios', userRoutes)
routes.use('/grupos-acesso', accessGroupRoutes)
routes.use('/funcionalidades', featureRoutes)
routes.use('/modules', appModuleRoutes)
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
routes.use('/identidade-visual', brandRoutes)
routes.use('/landing-pages', landingPageRoutes)
routes.use('/product-lists', productListRoutes)
routes.use('/reports', reportRoutes)
routes.use('/notifications', notificationRoutes)
routes.use('/remetentes', remetenteRoutes)
routes.use('/comunicacoes', comunicacaoRoutes)

import { Router } from 'express'
import { BrandController } from '../controllers/BrandController'

export const brandRoutes = Router()
const brandController = new BrandController()

brandRoutes.get('/', brandController.getConfig)
brandRoutes.put('/', brandController.updateConfig)

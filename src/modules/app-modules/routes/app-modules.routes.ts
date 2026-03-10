import { Router } from 'express'
import modules from '../modules.json'

export const appModuleRoutes = Router()

appModuleRoutes.get('/', (req, res) => {
    return res.json(modules)
})

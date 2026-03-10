import { Router } from 'express'
import menus from '../menus.json'
import views from '../views.json'

export const menuRoutes = Router()

menuRoutes.get('/', (req, res) => {
    return res.json(menus)
})

menuRoutes.get('/views', (req, res) => {
    return res.json(views)
})

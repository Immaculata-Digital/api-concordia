import { Router } from 'express'
import menus from '../menus.json'

export const menuRoutes = Router()

menuRoutes.get('/', (req, res) => {
    return res.json(menus)
})

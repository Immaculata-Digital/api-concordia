import { Router } from 'express'
import features from '../features.json'

export const featureRoutes = Router()

featureRoutes.get('/', (req, res) => {
    return res.json(features)
})

import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../../infra/auth/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' })
    }

    const [, token] = authHeader.split(' ')

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' })
    }
}

// Estender o tipo Request do Express para incluir o usuário
declare global {
    namespace Express {
        interface Request {
            user?: {
                uuid: string
                tenantId: string
                login: string
                email: string
            }
        }
    }
}

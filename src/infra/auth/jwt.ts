import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

export interface TokenPayload {
    uuid: string
    tenantId: string
    login: string
    email: string
    permissions?: string[]
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, env.auth.jwtSecret, {
        expiresIn: env.auth.jwtExpiresIn || '12h',
    })
}

export const generateRefreshToken = (uuid: string): string => {
    return jwt.sign({ uuid }, env.auth.jwtSecret, {
        expiresIn: '7d',
    })
}

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, env.auth.jwtSecret) as TokenPayload
}

export const verifyRefreshToken = (token: string): { uuid: string } => {
    return jwt.verify(token, env.auth.jwtSecret) as { uuid: string }
}

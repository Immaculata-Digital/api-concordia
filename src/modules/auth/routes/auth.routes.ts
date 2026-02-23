import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PostgresUserRepository } from '../../users/repositories/PostgresUserRepository'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../infra/auth/jwt'
import menus from '../../menus/menus.json'
import { pool } from '../../../infra/database/pool'

export const authRoutes = Router()
const userRepository = new PostgresUserRepository()

async function getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    // 1. Get features from groups
    const groupFeaturesResult = await pool.query(
        `SELECT DISTINCT unnest(g.features) as feature
         FROM app.access_groups g
         JOIN app.access_group_memberships m ON m.group_id = g.uuid
         WHERE m.user_id = $1 AND g.tenant_id = $2`,
        [userId, tenantId]
    )
    const groupFeatures = groupFeaturesResult.rows.map(row => row.feature)

    // 2. Get user specific features
    const userResult = await pool.query(
        'SELECT allow_features, denied_features FROM app.users WHERE uuid = $1',
        [userId]
    )
    const userRow = userResult.rows[0]
    const allowFeatures: string[] = userRow?.allow_features || []
    const deniedFeatures: string[] = userRow?.denied_features || []

    // 3. Merge: (Group + Allow) - Denied
    const allFeatures = new Set([...groupFeatures, ...allowFeatures])
    deniedFeatures.forEach(f => allFeatures.delete(f))

    return Array.from(allFeatures)
}

authRoutes.post('/login', async (req, res) => {
    try {
        const { loginOrEmail, password } = req.body

        const user = await userRepository.findByLoginOrEmail(loginOrEmail)
        console.log(`[AUTH_LOGIN] Tentativa de login para: ${loginOrEmail}. Usuário encontrado: ${!!user}`)

        if (!user) {
            console.warn(`[AUTH_LOGIN] Usuário não encontrado: ${loginOrEmail}`)
            return res.status(401).json({ message: 'Credenciais inválidas' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            console.warn(`[AUTH_LOGIN] Senha incorreta para: ${loginOrEmail}`)
            return res.status(401).json({ message: 'Credenciais inválidas' })
        }

        const permissions = await getUserPermissions(user.uuid, user.tenantId)

        const accessToken = generateAccessToken({
            uuid: user.uuid,
            tenantId: user.tenantId,
            login: user.login,
            email: user.email,
            permissions
        })

        const refreshToken = generateRefreshToken(user.uuid)

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.uuid,
                fullName: user.fullName,
                login: user.login,
                email: user.email,
                tenantId: user.tenantId
            },
            menus,
            permissions
        })
    } catch (error: any) {
        console.error('[AUTH_ROUTES] Login error:', error)
        return res.status(500).json({
            message: 'Erro interno ao realizar login',
            details: error.message || String(error)
        })
    }
})

authRoutes.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token é obrigatório' })
        }

        const decoded = verifyRefreshToken(refreshToken)
        if (!decoded || !decoded.uuid) {
            return res.status(401).json({ message: 'Refresh token inválido ou expirado' })
        }

        const userId = decoded.uuid

        const userResult = await pool.query('SELECT * FROM app.users WHERE uuid = $1', [userId])
        const userRow = userResult.rows[0]

        if (!userRow) {
            return res.status(401).json({ message: 'Usuário não encontrado' })
        }

        const permissions = await getUserPermissions(userRow.uuid, userRow.tenant_id)

        const newAccessToken = generateAccessToken({
            uuid: userRow.uuid,
            tenantId: userRow.tenant_id,
            login: userRow.login,
            email: userRow.email,
            permissions
        })

        const newRefreshToken = generateRefreshToken(userRow.uuid)

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })

    } catch (error) {
        console.error('[AUTH_ROUTES] Refresh token error:', error)
        return res.status(401).json({ message: 'Erro ao renovar token' })
    }
})

authRoutes.post('/check-permission', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.json({ hasPermission: false })

        const token = authHeader.split(' ')[1]
        // Simple decode to check permissions in token
        const decoded = jwt.decode(token) as any
        const permissions = decoded?.permissions || []

        const { permission } = req.body
        const hasPermission = permissions.includes(permission)

        return res.json({ hasPermission })
    } catch (e) {
        return res.status(401).json({ hasPermission: false })
    }
})

authRoutes.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return res.status(401).json({ message: 'No token' })
        const token = authHeader.split(' ')[1]
        const decoded = jwt.decode(token) as any
        return res.json({ user: decoded, permissions: decoded?.permissions || [] })
    } catch (e) {
        return res.status(500).json({ error: 'Error' })
    }
})

// Novos endpoints para esqueci minha senha
authRoutes.post('/password/reset-request', async (req, res) => {
    // Mock implementation
    return res.json({ status: 'ok', message: 'E-mail de recuperação enviado (mock)' })
})

authRoutes.post('/password/reset', async (req, res) => {
    // Mock implementation
    const { token, password } = req.body
    return res.json({ status: 'ok', message: 'Senha alterada com sucesso (mock)' })
})

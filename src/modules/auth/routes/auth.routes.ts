import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { comparePassword } from '../../../utils/passwordCipher'
import { PostgresUserRepository } from '../../users/repositories/PostgresUserRepository'
import { PostgresPluvytClientRepository } from '../../pluvyt-clients/repositories/PostgresPluvytClientRepository'
import { PluvytClient } from '../../pluvyt-clients/entities/PluvytClient'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../infra/auth/jwt'
import menus from '../../menus/menus.json'
import { pool } from '../../../infra/database/pool'
import { sendMail } from '../../../infra/email/mailer'
import { getEmailVerificationTemplate, getPasswordResetTemplate } from '../../../infra/email/templates'

export const authRoutes = Router()
const userRepository = new PostgresUserRepository()
const pluvytClientRepository = new PostgresPluvytClientRepository()

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

        // Validar senha (suporta múltiplos formatos de hash em produção, incluindo AES legado)
        const isPasswordValid = await comparePassword(password, user.passwordHash)

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
                tenantId: user.tenantId,
                emailVerified: !!user.emailVerifiedAt
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

// --- ROTAS DO PLUVYT ---

authRoutes.post('/register/pluvyt', async (req, res) => {
    const tenantIdentifier = process.env.PLUVYT_TENANT_ID || 'app'
    const { fullName, email, password, whatsapp, cep, sexo, dataNascimento } = req.body

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Nome, E-mail e Senha são obrigatórios' })
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        
        // Fetch valid UUID for tenant
        const tenantRes = await client.query('SELECT uuid FROM app.tenants WHERE slug = $1 OR name = $1', [tenantIdentifier])
        if (tenantRes.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({ message: 'Tenant inválido ou não encontrado' })
        }
        
        const tenantId = tenantRes.rows[0].uuid

        // 1. Verificar se a pessoa existe pelo e-mail
        // Assumindo que o e-mail não seja a PK na tabela people, mas pode haver cpf/cnpj.
        // O mais seguro é verificar se usuário já existe com esse login/email
        const userRes = await client.query('SELECT * FROM app.users WHERE (email = $1 OR login = $1) AND tenant_id = $2', [email, tenantId])
        let userId: string | null = null
        let personId: string | null = null

        if (userRes.rowCount && userRes.rowCount > 0) {
            const user = userRes.rows[0]
            userId = user.uuid

            // Busca pessoa atrelada ao usuario
            const personRes = await client.query('SELECT uuid FROM app.people WHERE usuario_id = $1 AND tenant_id = $2', [userId, tenantId])
            
            if (personRes.rowCount && personRes.rowCount > 0) {
                personId = personRes.rows[0].uuid
            } else {
                // Se o usuário existe mas não tem pessoa atrelada, cria a pessoa
                const personIdRes = await client.query(
                    `INSERT INTO app.people (uuid, tenant_id, name, usuario_id, created_by, updated_by) 
                     VALUES (gen_random_uuid(), $1, $2, $3, $3, $3) RETURNING uuid`,
                    [tenantId, fullName, userId]
                )
                personId = personIdRes.rows[0].uuid
            }

            // Verifica se já é cliente pluvyt
            const pluvytRes = await client.query('SELECT * FROM app.pluvyt_clients WHERE person_id = $1 AND tenant_id = $2 AND deleted_at IS NULL', [personId, tenantId])
            if (pluvytRes.rowCount && pluvytRes.rowCount > 0) {
                await client.query('ROLLBACK')
                return res.status(400).json({ message: 'Você já possui uma conta no Clube Pluvyt.', isClient: true })
            }
        } else {
            // Usuario nao existe, cria tudo
            const passwordHash = await bcrypt.hash(password, 10)
            const token = crypto.randomBytes(32).toString('hex')
            const expires = new Date()
            expires.setHours(expires.getHours() + 24) // 24h

            const newUserId = crypto.randomUUID()
            userId = newUserId

            const userInsertRes = await client.query(
                `INSERT INTO app.users (
                    uuid, tenant_id, full_name, login, email, password, 
                    email_verified_at, email_verification_token, email_verification_expires_at, 
                    created_by, updated_by
                 ) VALUES (
                    $1, $2, $3, $4, $4, $5, 
                    NULL, $6, $7, 
                    $1, $1
                 ) RETURNING uuid`,
                [newUserId, tenantId, fullName, email, passwordHash, token, expires]
            )

            const newPersonId = crypto.randomUUID()
            personId = newPersonId

            const personIdRes = await client.query(
                `INSERT INTO app.people (uuid, tenant_id, name, usuario_id, created_by, updated_by) 
                 VALUES ($1, $2, $3, $4, $5, $5) RETURNING uuid`,
                [newPersonId, tenantId, fullName, newUserId, newUserId]
            )

            if (whatsapp) {
                await client.query(
                    `INSERT INTO app.people_contacts (uuid, tenant_id, people_id, label, contact_value, contact_type, is_default, created_by, updated_by)
                     VALUES (gen_random_uuid(), $1, $2, 'WhatsApp', $3, 'CELL', true, $4, $4)`,
                    [tenantId, newPersonId, whatsapp, newUserId]
                )
            }

            // Disparar e-mail fire-and-forget
            sendMail({
                to: email,
                subject: '✅ Confirme seu e-mail — Clube Pluvyt',
                html: getEmailVerificationTemplate(fullName.split(' ')[0], token)
            })
        }

        // Criar o Pluvyt Client associado à pessoa
        const pClient = PluvytClient.create({
            tenantId,
            personId: personId as string,
            saldo: 0,
            createdBy: userId as string
        })

        const dataClient = pClient.toJSON()
        await client.query(
            `INSERT INTO app.pluvyt_clients (
                uuid, tenant_id, person_id, saldo, created_at, updated_at, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [dataClient.id, dataClient.tenantId, dataClient.personId, dataClient.saldo, dataClient.createdAt, dataClient.updatedAt, dataClient.createdBy, dataClient.createdBy]
        )

        await client.query('COMMIT')
        return res.status(201).json({ 
            message: 'Cadastro realizado com sucesso.', 
            user: { id: userId, email, fullName } 
        })
    } catch (err: any) {
        await client.query('ROLLBACK')
        console.error('[AUTH_ROUTES] Erro no registro pluvyt:', err)
        return res.status(500).json({ message: 'Erro interno no cadastro.', details: err.message })
    } finally {
        client.release()
    }
})

authRoutes.get('/verify-email', async (req, res) => {
    const { token } = req.query
    if (!token) return res.status(400).json({ message: 'Token não fornecido' })

    try {
        const result = await pool.query(
            `UPDATE app.users 
             SET email_verified_at = NOW(), email_verification_token = NULL 
             WHERE email_verification_token = $1 AND email_verification_expires_at > NOW() 
             RETURNING uuid, email`,
             [token]
        )
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' })
        }

        return res.json({ message: 'E-mail verificado com sucesso.', user: result.rows[0] })
    } catch (e) {
        return res.status(500).json({ message: 'Erro ao verificar e-mail' })
    }
})

authRoutes.post('/resend-verification', async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'E-mail obrigatório' })

    try {
        const userRes = await pool.query('SELECT uuid, full_name, email_verified_at, email_verification_expires_at FROM app.users WHERE email = $1', [email])
        if (userRes.rowCount === 0) return res.json({ message: 'Se o e-mail existir, um link foi enviado.' })
        
        const user = userRes.rows[0]
        if (user.email_verified_at) return res.status(400).json({ message: 'E-mail já verificado.' })

        // Rate limit simples de 60s
        const now = new Date()
        const expiresAt = user.email_verification_expires_at ? new Date(user.email_verification_expires_at) : null
        if (expiresAt && (expiresAt.getTime() - now.getTime()) > (24 * 60 * 60 * 1000) - 60000) {
            return res.status(429).json({ message: 'Aguarde um momento para enviar novamente.' })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date()
        expires.setHours(expires.getHours() + 24)

        await pool.query(
            'UPDATE app.users SET email_verification_token = $1, email_verification_expires_at = $2 WHERE uuid = $3',
            [token, expires, user.uuid]
        )

        sendMail({
            to: email,
            subject: '✅ Confirme seu e-mail — Clube Pluvyt',
            html: getEmailVerificationTemplate(user.full_name.split(' ')[0], token)
        })

        return res.json({ message: 'E-mail de verificação reenviado.' })
    } catch (e) {
        return res.status(500).json({ message: 'Erro ao reenviar verificação' })
    }
})

// --- ESQUECI MINHA SENHA ---

authRoutes.post('/password/reset-request', async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'E-mail obrigatório' })

    try {
        const userRes = await pool.query('SELECT uuid, full_name, password_reset_expires_at FROM app.users WHERE email = $1', [email])
        if (userRes.rowCount === 0) {
            // Retorna OK de qualquer forma p/ não vazar infos
            return res.json({ message: 'Se o e-mail existir, um link de recuperação foi enviado.' })
        }
        
        const user = userRes.rows[0]
        
        // Rate limit simples 60s
        const now = new Date()
        const expiresAt = user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null
        if (expiresAt && (expiresAt.getTime() - now.getTime()) > (60 * 60 * 1000) - 60000) {
            return res.status(429).json({ message: 'Aguarde um momento para tentar novamente.' })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date()
        expires.setHours(expires.getHours() + 1)

        await pool.query(
            'UPDATE app.users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE uuid = $3',
            [token, expires, user.uuid]
        )

        sendMail({
            to: email,
            subject: 'Recuperação de Senha — Clube Pluvyt',
            html: getPasswordResetTemplate(user.full_name.split(' ')[0], token)
        })

        return res.json({ message: 'Se o e-mail existir, um link de recuperação foi enviado.' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Erro processando recuperação.' })
    }
})

authRoutes.post('/password/reset', async (req, res) => {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' })

    try {
        const userRes = await pool.query(
            'SELECT uuid FROM app.users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()',
            [token]
        )

        if (userRes.rowCount === 0) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        
        await pool.query(
            'UPDATE app.users SET password = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE uuid = $2',
            [passwordHash, userRes.rows[0].uuid]
        )

        return res.json({ message: 'Senha atualizada com sucesso.' })
    } catch (e) {
        return res.status(500).json({ message: 'Erro ao atualizar senha.' })
    }
})

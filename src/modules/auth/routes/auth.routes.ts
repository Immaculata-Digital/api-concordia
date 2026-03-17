import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendWhatsAppMessage } from '../../../infra/whatsapp/evolution-api'
import { comparePassword } from '../../../utils/passwordCipher'
import { PostgresUserRepository } from '../../users/repositories/PostgresUserRepository'
import { PostgresPluvytClientRepository } from '../../pluvyt-clients/repositories/PostgresPluvytClientRepository'
import { PluvytClient } from '../../pluvyt-clients/entities/PluvytClient'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../infra/auth/jwt'
import menus from '../../menus/menus.json'
import { pool } from '../../../infra/database/pool'
import { sendMail } from '../../../infra/email/mailer'
import { getEmailVerificationTemplate, getPasswordResetTemplate } from '../../../infra/email/templates'
import { filterMenusByTenant } from '../../menus/utils/menuUtils'

export const authRoutes = Router()
const userRepository = new PostgresUserRepository()
const pluvytClientRepository = new PostgresPluvytClientRepository()

async function getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    // 1. Get features from groups
    const groupFeaturesResult = await pool.query(
        `SELECT DISTINCT unnest(g.features) as feature
         FROM app.access_groups g
         JOIN app.access_group_memberships m ON m.group_id = g.uuid
         WHERE m.user_id = $1 AND m.tenant_id = $2 AND g.tenant_id = $2`,
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
        const tenantIdentifier = process.env.PLUVYT_TENANT_ID || 'app'

        let user: any = null

        // 1. Tentar encontrar diretamente por login/email
        user = await userRepository.findByLoginOrEmail(loginOrEmail)

        // 2. Se não encontrou, e parece um CPF, tenta buscar pela tabela de pessoas
        if (!user) {
            const cleanLogin = loginOrEmail.replace(/\D/g, '')
            if (cleanLogin.length === 11) {
                const personRes = await pool.query(
                    'SELECT usuario_id FROM app.people WHERE REPLACE(REPLACE(cpf_cnpj, \'.\', \'\'), \'-\', \'\') = $1 AND tenant_id = (SELECT uuid FROM app.tenants WHERE slug = $2 OR name = $2 LIMIT 1)',
                    [cleanLogin, tenantIdentifier]
                )
                if (personRes.rowCount && personRes.rowCount > 0 && personRes.rows[0].usuario_id) {
                    const userId = personRes.rows[0].usuario_id
                    const userRes = await pool.query('SELECT * FROM app.users WHERE uuid = $1', [userId])
                    if (userRes.rowCount && userRes.rowCount > 0) {
                        const row = userRes.rows[0]
                        const props = {
                            uuid: row.uuid,
                            fullName: row.full_name,
                            login: row.login,
                            email: row.email,
                            tenantId: row.tenant_id,
                            passwordHash: row.password_hash || row.password,
                            emailVerifiedAt: row.email_verified_at
                        }
                        user = props
                    }
                }
            }
        }

        console.log(`[AUTH_LOGIN] Tentativa de login para: ${loginOrEmail}. Usuário encontrado: ${!!user}`)

        if (!user) {
            console.warn(`[AUTH_LOGIN] Usuário não encontrado: ${loginOrEmail}`)
            return res.status(401).json({ message: 'Credenciais inválidas' })
        }

        // Validar senha
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

        // Buscar dados extras do Pluvyt (incluindo endereço e pessoa_id)
        const pluvytData = await pool.query(
            `SELECT 
                p.uuid as person_id,
                p.cpf_cnpj, 
                p.birth_date, 
                pc.contact_value as phone, 
                cl.saldo as points,
                pa.uuid as addr_id,
                pa.postal_code,
                pa.street,
                pa.number,
                pa.complement,
                pa.neighborhood,
                pa.city,
                pa.state,
                pa.latitude,
                pa.longitude,
                pa.plus_code
             FROM app.people p
             LEFT JOIN app.people_contacts pc ON pc.people_id = p.uuid AND pc.is_default = true
             LEFT JOIN app.pluvyt_clients cl ON cl.person_id = p.uuid
             LEFT JOIN app.people_addresses pa ON pa.people_id = p.uuid
             WHERE p.usuario_id = $1
             LIMIT 1`,
            [user.uuid]
        )
        const extra = pluvytData.rows[0] || {}

        // Buscar extrato (point_transactions)
        const statementRes = await pool.query(
            `SELECT 
                uuid as id,
                observation as description,
                points,
                created_at as date,
                CASE WHEN type = 'CREDITO' THEN 'credit' ELSE 'debit' END as type
             FROM app.point_transactions
             WHERE client_id = (SELECT uuid FROM app.pluvyt_clients WHERE person_id = $1 LIMIT 1)
             ORDER BY created_at DESC
             LIMIT 10`,
            [extra.person_id]
        )


        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [user.tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []
        const filteredMenus = filterMenusByTenant(menus, tenantModules)

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.uuid,
                personId: extra.person_id,
                fullName: user.fullName,
                login: user.login,
                email: user.email,
                tenantId: user.tenantId,
                emailVerified: !!user.emailVerifiedAt,
                cpf: extra.cpf_cnpj,
                phone: extra.phone,
                birthDate: extra.birth_date,
                points: Number(extra.points || 0),
                address: extra.addr_id ? {
                    id: extra.addr_id,
                    zipCode: extra.postal_code,
                    street: extra.street,
                    number: extra.number,
                    complement: extra.complement,
                    neighborhood: extra.neighborhood,
                    city: extra.city,
                    state: extra.state,
                    latitude: extra.latitude,
                    longitude: extra.longitude,
                    plusCode: extra.plus_code
                } : null,
                statement: statementRes.rows.map(row => ({
                    ...row,
                    points: Number(row.points)
                })),
                redemptions: []
            },
            menus: filteredMenus,
            permissions,
            modules: tenantModules
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

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [userRow.tenant_id])
        const tenantModules = tenantRes.rows[0]?.modules || []

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            modules: tenantModules
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
        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [decoded?.tenantId])
        const tenantModules = tenantRes.rows[0]?.modules || []
        
        return res.json({ user: decoded, permissions: decoded?.permissions || [], modules: tenantModules })
    } catch (e) {
        return res.status(500).json({ error: 'Error' })
    }
})

// --- ROTAS DO PLUVYT ---

authRoutes.post('/register/pluvyt', async (req, res) => {
    const tenantIdentifier = process.env.PLUVYT_TENANT_ID || 'app'
    const lpUrl = process.env.PLUVYT_LP_URL || 'http://localhost:3000'
    const { email, whatsapp, cpf } = req.body

    if (!email || !whatsapp || !cpf) {
        return res.status(400).json({ message: 'CPF, WhatsApp e E-mail são obrigatórios' })
    }

    const cleanCpf = cpf.replace(/\D/g, '')
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        
        const tenantRes = await client.query('SELECT uuid FROM app.tenants WHERE slug = $1 OR name = $1', [tenantIdentifier])
        if (tenantRes.rowCount === 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({ message: 'Tenant inválido ou não encontrado' })
        }
        const tenantId = tenantRes.rows[0].uuid

        // 1. Verificar se já existe pessoa com esse CPF, email ou whatsapp
        const existingPersonRes = await client.query(
            `SELECT p.uuid FROM app.people p 
             LEFT JOIN app.users u ON u.uuid = p.usuario_id
             LEFT JOIN app.people_contacts pc ON pc.people_id = p.uuid
             WHERE (REPLACE(REPLACE(p.cpf_cnpj, '.', ''), '-', '') = $1 
                OR u.email = $2 
                OR REPLACE(REPLACE(REPLACE(pc.contact_value, ' ', ''), '-', ''), '(', '') LIKE $3)
             AND p.tenant_id = $4`,
            [cleanCpf, email, `%${cleanWhatsapp.slice(-8)}`, tenantId]
        )

        if (existingPersonRes.rowCount && existingPersonRes.rowCount > 0) {
            await client.query('ROLLBACK')
            return res.status(400).json({ message: 'Já existe um cadastro com estes dados.' })
        }

        // 2. Criar Usuário (Inativo/Sem senha definida)
        const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10)
        const activationToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date()
        expires.setHours(expires.getHours() + 48) // 48h para ativar

        const userId = crypto.randomUUID()
        await client.query(
            `INSERT INTO app.users (
                uuid, tenant_id, full_name, login, email, password, 
                password_reset_token, password_reset_expires_at,
                created_by, updated_by
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $1, $1)`,
            [userId, tenantId, 'Novo Cliente Pluvyt', cleanCpf, email, passwordHash, activationToken, expires]
        )

        // 3. Criar Pessoa
        const personId = crypto.randomUUID()
        await client.query(
            `INSERT INTO app.people (uuid, tenant_id, name, cpf_cnpj, usuario_id, created_by, updated_by, views) 
             VALUES ($1, $2, $3, $4, $5, $5, $5, $6)`,
            [personId, tenantId, 'Novo Cliente Pluvyt', cleanCpf, userId, ['clientes-pluvyt']]
        )

        // 4. Criar Contato (WhatsApp)
        await client.query(
            `INSERT INTO app.people_contacts (uuid, tenant_id, people_id, label, contact_value, contact_type, is_default, created_by, updated_by)
             VALUES (gen_random_uuid(), $1, $2, 'WhatsApp', $3, 'CELL', true, $4, $4)`,
            [tenantId, personId, cleanWhatsapp, userId]
        )

        // 5. Criar Pluvyt Client
        await client.query(
            `INSERT INTO app.pluvyt_clients (uuid, tenant_id, person_id, saldo, created_by, updated_by)
             VALUES (gen_random_uuid(), $1, $2, 0, $3, $3)`,
            [tenantId, personId, userId]
        )

        await client.query('COMMIT')

        // 6. Disparar WhatsApp (Fire and forget)
        const activationLink = `${lpUrl}/ativar-conta?token=${activationToken}`
        const welcomeMessage = `Olá! Seja bem-vindo ao Clube Pluvyt. 🥳\n\nPara começar a acumular pontos e ganhar prêmios, você precisa definir sua senha e completar seu cadastro.\n\nClique no link enviado na próxima mensagem para ativar sua conta:`
        
        // Garante o prefixo 55 se o número tiver apenas 10 ou 11 dígitos
        const finalNumber = (cleanWhatsapp.length === 10 || cleanWhatsapp.length === 11) 
            ? `55${cleanWhatsapp}` 
            : cleanWhatsapp;

        // Envia as duas mensagens em sequência
        const sendMessages = async () => {
            try {
                await sendWhatsAppMessage(finalNumber, welcomeMessage)
                await sendWhatsAppMessage(finalNumber, activationLink)
            } catch (err) {
                console.error('[AUTH_REGISTER] Erro ao enviar mensagens de WhatsApp:', err)
            }
        }
        
        sendMessages()

        return res.status(201).json({ 
            message: 'Cadastro realizado! Enviamos um link de ativação para o seu WhatsApp.', 
            user: { id: userId, email } 
        })
    } catch (err: any) {
        await client.query('ROLLBACK')
        console.error('[AUTH_ROUTES] Erro no registro pluvyt:', err)
        return res.status(500).json({ message: 'Erro interno no cadastro.', details: err.message })
    } finally {
        client.release()
    }
})

authRoutes.post('/pluvyt/activate', async (req, res) => {
    const { token, fullName, password } = req.body
    if (!token || !fullName || !password) {
        return res.status(400).json({ message: 'Token, Nome Completo e Senha são obrigatórios.' })
    }

    try {
        const userRes = await pool.query(
            'SELECT * FROM app.users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()',
            [token]
        )

        if (userRes.rowCount === 0) {
            return res.status(400).json({ message: 'Link de ativação inválido ou expirado.' })
        }

        const user = userRes.rows[0]
        const passwordHash = await bcrypt.hash(password, 10)

        // Update User and Person Name
        await pool.query('BEGIN')
        await pool.query(
            `UPDATE app.users 
             SET full_name = $1, password = $2, password_reset_token = NULL, password_reset_expires_at = NULL, email_verified_at = NOW() 
             WHERE uuid = $3`,
            [fullName, passwordHash, user.uuid]
        )
        await pool.query('UPDATE app.people SET name = $1 WHERE usuario_id = $2', [fullName, user.uuid])
        await pool.query('COMMIT')

        // Auto login
        const permissions = await getUserPermissions(user.uuid, user.tenant_id)
        const accessToken = generateAccessToken({
            uuid: user.uuid,
            tenantId: user.tenant_id,
            login: user.login,
            email: user.email,
            permissions
        })
        const refreshToken = generateRefreshToken(user.uuid)

        // Buscar dados extras do Pluvyt (incluindo endereço e pessoa_id)
        const pluvytData = await pool.query(
            `SELECT 
                p.uuid as person_id,
                p.cpf_cnpj, 
                p.birth_date, 
                pc.contact_value as phone, 
                cl.saldo as points,
                pa.uuid as addr_id,
                pa.postal_code,
                pa.street,
                pa.number,
                pa.complement,
                pa.neighborhood,
                pa.city,
                pa.state,
                pa.latitude,
                pa.longitude,
                pa.plus_code
             FROM app.people p
             LEFT JOIN app.people_contacts pc ON pc.people_id = p.uuid AND pc.is_default = true
             LEFT JOIN app.pluvyt_clients cl ON cl.person_id = p.uuid
             LEFT JOIN app.people_addresses pa ON pa.people_id = p.uuid
             WHERE p.usuario_id = $1
             LIMIT 1`,
            [user.uuid]
        )
        const extra = pluvytData.rows[0] || {}

        return res.json({ 
            message: 'Conta ativada com sucesso!',
            accessToken,
            refreshToken,
            user: {
                id: user.uuid,
                personId: extra.person_id,
                fullName,
                login: user.login,
                email: user.email,
                tenantId: user.tenant_id,
                emailVerified: true,
                cpf: extra.cpf_cnpj,
                phone: extra.phone,
                birthDate: extra.birth_date,
                points: Number(extra.points || 0),
                address: extra.addr_id ? {
                    id: extra.addr_id,
                    zipCode: extra.postal_code,
                    street: extra.street,
                    number: extra.number,
                    complement: extra.complement,
                    neighborhood: extra.neighborhood,
                    city: extra.city,
                    state: extra.state,
                    latitude: extra.latitude,
                    longitude: extra.longitude,
                    plusCode: extra.plus_code
                } : null
            },
            permissions
        })
    } catch (e) {
        await pool.query('ROLLBACK')
        console.error(e)
        return res.status(500).json({ message: 'Erro ao ativar conta.' })
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

// --- PERFIL DO USUÁRIO ---

authRoutes.get('/profile', async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: 'Não autorizado' })
    
    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, String(process.env.JWT_SECRET)) as any
        const userId = decoded.uuid

        const userRes = await pool.query('SELECT uuid, full_name, email, tenant_id, email_verified_at FROM app.users WHERE uuid = $1', [userId])
        if (userRes.rowCount === 0) return res.status(404).json({ message: 'Usuário não encontrado' })
        const user = userRes.rows[0]

        const pluvytData = await pool.query(
            `SELECT 
                p.uuid as person_id,
                p.cpf_cnpj, 
                p.birth_date, 
                pc.contact_value as phone, 
                cl.saldo as points,
                pa.uuid as addr_id,
                pa.postal_code,
                pa.street,
                pa.number,
                pa.complement,
                pa.neighborhood,
                pa.city,
                pa.state,
                pa.latitude,
                pa.longitude,
                pa.plus_code
             FROM app.people p
             LEFT JOIN app.people_contacts pc ON pc.people_id = p.uuid AND pc.is_default = true
             LEFT JOIN app.pluvyt_clients cl ON cl.person_id = p.uuid
             LEFT JOIN app.people_addresses pa ON pa.people_id = p.uuid
             WHERE p.usuario_id = $1
             LIMIT 1`,
            [userId]
        )
        const extra = pluvytData.rows[0] || {}

        // Buscar extrato (point_transactions)
        const statementRes = await pool.query(
            `SELECT 
                uuid as id,
                observation as description,
                points,
                created_at as date,
                CASE WHEN type = 'CREDITO' THEN 'credit' ELSE 'debit' END as type
             FROM app.point_transactions
             WHERE client_id = (SELECT uuid FROM app.pluvyt_clients WHERE person_id = $1 LIMIT 1)
             ORDER BY created_at DESC
             LIMIT 50`,
            [extra.person_id]
        )

        const tenantRes = await pool.query('SELECT modules FROM app.tenants WHERE uuid = $1', [user.tenant_id])
        const tenantModules = tenantRes.rows[0]?.modules || []

        return res.json({
            id: user.uuid,
            personId: extra.person_id,
            fullName: user.full_name,
            email: user.email,
            tenantId: user.tenant_id,
            emailVerified: !!user.email_verified_at,
            cpf: extra.cpf_cnpj,
            phone: extra.phone,
            birthDate: extra.birth_date,
            points: Number(extra.points || 0),
            address: extra.addr_id ? {
                id: extra.addr_id,
                zipCode: extra.postal_code,
                street: extra.street,
                number: extra.number,
                complement: extra.complement,
                neighborhood: extra.neighborhood,
                city: extra.city,
                state: extra.state,
                latitude: extra.latitude,
                longitude: extra.longitude,
                plusCode: extra.plus_code
            } : null,
            statement: statementRes.rows.map((row: any) => ({
                ...row,
                points: Number(row.points)
            })),
            modules: tenantModules
        })
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' })
    }
})

authRoutes.put('/profile', async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ message: 'Não autorizado' })
    
    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, String(process.env.JWT_SECRET)) as any
        const userId = decoded.uuid

        const { fullName, email, birthDate, phone, cpf, password, address } = req.body

        if (!password) {
            return res.status(400).json({ message: 'Senha é obrigatória para salvar alterações.' })
        }

        // Buscar usuário para comparar senha
        const userRes = await pool.query('SELECT password FROM app.users WHERE uuid = $1', [userId])
        if (userRes.rowCount === 0) return res.status(404).json({ message: 'Usuário não encontrado' })

        const user = userRes.rows[0]
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta.' })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            
            // Atualiza Usuário
            await client.query(
                'UPDATE app.users SET full_name = $1, email = $2 WHERE uuid = $3',
                [fullName, email, userId]
            )

            // Buscar Pessoa
            const personRes = await client.query('SELECT uuid, tenant_id FROM app.people WHERE usuario_id = $1', [userId])
            if (personRes && personRes.rows && personRes.rows.length > 0) {
                const person = personRes.rows[0]
                
                // Atualiza Pessoa
                await client.query(
                    'UPDATE app.people SET name = $1, birth_date = $2, cpf_cnpj = $3 WHERE uuid = $4',
                    [fullName, birthDate || null, cpf || null, person.uuid]
                )
                
                // Atualiza Telefone (people_contacts)
                if (phone) {
                    const contactExists = await client.query(
                        'SELECT uuid FROM app.people_contacts WHERE people_id = $1 AND is_default = true',
                        [person.uuid]
                    )
                    
                    if (contactExists && contactExists.rows && contactExists.rows.length > 0) {
                        await client.query(
                            'UPDATE app.people_contacts SET contact_value = $1, updated_at = NOW() WHERE uuid = $2',
                            [phone, contactExists.rows[0].uuid]
                        )
                    } else {
                        await client.query(
                            'INSERT INTO app.people_contacts (people_id, contact_type, contact_value, is_default) VALUES ($1, $2, $3, $4)',
                            [person.uuid, 'whatsapp', phone, true]
                        )
                    }
                }

                // Atualiza ou Cria Endereço
                if (address) {
                    const addrExists = await client.query('SELECT uuid FROM app.people_addresses WHERE people_id = $1', [person.uuid])
                    
                    if (addrExists && addrExists.rows && addrExists.rows.length > 0) {
                        await client.query(
                            `UPDATE app.people_addresses SET 
                                postal_code = $1, street = $2, number = $3, complement = $4, 
                                neighborhood = $5, city = $6, state = $7, 
                                latitude = $8, longitude = $9, plus_code = $10,
                                updated_at = NOW()
                             WHERE people_id = $11`,
                            [
                                address.zipCode, address.street, address.number, address.complement, 
                                address.neighborhood, address.city, address.state, 
                                address.latitude || null, address.longitude || null, address.plusCode || null,
                                person.uuid
                            ]
                        )
                    } else {
                        await client.query(
                            `INSERT INTO app.people_addresses 
                                (people_id, tenant_id, postal_code, street, number, complement, neighborhood, city, state, address_type, latitude, longitude, plus_code)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'residencial', $10, $11, $12)`,
                            [
                                person.uuid, person.tenant_id, address.zipCode, address.street, address.number, address.complement, 
                                address.neighborhood, address.city, address.state,
                                address.latitude || null, address.longitude || null, address.plusCode || null
                            ]
                        )
                    }
                }
            }

            await client.query('COMMIT')
            return res.json({ message: 'Perfil e endereço atualizados com sucesso' })
        } catch (e) {
            await client.query('ROLLBACK')
            console.error(e)
            return res.status(500).json({ message: 'Erro ao analisar/atualizar perfil' })
        } finally {
            client.release()
        }
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' })
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

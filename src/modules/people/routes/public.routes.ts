import { Router } from 'express'
import { pool } from '../../../infra/database/pool'
import { generateUUID } from '../../../utils/uuid'
import bcrypt from 'bcrypt'

export const publicPeopleRoutes = Router()

publicPeopleRoutes.post('/cadastro-parceiro', async (req, res) => {
    const client = await pool.connect()
    try {
        const {
            tenantId,
            cpfCnpj,
            email,
            phone,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            login,
            senha,
            latitude,
            longitude,
            plusCode
        } = req.body

        if (!tenantId || !cpfCnpj || !login || !senha) {
            return res.status(400).json({ message: 'Tenant ID, CPF/CNPJ, Login e Senha são obrigatórios.' })
        }

        // Check if tenant exists
        const tenantQuery = await client.query('SELECT uuid, name, pessoa_id FROM app.tenants WHERE uuid = $1', [tenantId])
        if (tenantQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant não encontrado.' })
        }

        const tenant = tenantQuery.rows[0]
        if (tenant.pessoa_id) {
            return res.status(400).json({ message: 'Este parceiro já concluiu o cadastro.' })
        }

        const existingUser = await client.query('SELECT uuid FROM app.users WHERE (login = $1 OR email = $2) AND tenant_id = $3', [login, email, tenantId])
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            return res.status(400).json({ message: 'Login ou E-mail já utilizado.' })
        }

        await client.query('BEGIN')

        const passwordHash = await bcrypt.hash(senha, 10)
        const userId = generateUUID()
        await client.query(
            `INSERT INTO app.users (uuid, tenant_id, full_name, login, email, password, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6, $1, $1)`,
            [userId, tenantId, tenant.name, login, email, passwordHash]
        )

        // Find MASTERTENANT group and associate user
        const masterGroupRes = await client.query("SELECT uuid FROM app.access_groups WHERE code = 'MASTERTENANT' LIMIT 1")

        if (masterGroupRes.rowCount && masterGroupRes.rowCount > 0) {
            const groupId = masterGroupRes.rows[0].uuid
            await client.query(
                `INSERT INTO app.access_group_memberships (uuid, group_id, user_id, tenant_id, created_by, updated_by)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $4)`,
                [groupId, userId, tenantId, userId]
            )
        }

        // Normalize CPF/CNPJ
        const normalizedCpfCnpj = cpfCnpj.replace(/\D/g, '')

        // Create Person based on tenant name
        const personId = generateUUID()
        await client.query(
            `INSERT INTO app.people (uuid, tenant_id, name, cpf_cnpj, usuario_id, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [personId, tenantId, tenant.name, normalizedCpfCnpj, userId]
        )

        // Add Contacts
        if (email) {
            await client.query(
                `INSERT INTO app.people_contacts (people_id, contact_type, contact_value, label, is_default, tenant_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [personId, 'email', email, 'Principal', true, tenantId]
            )
        }
        if (phone) {
            await client.query(
                `INSERT INTO app.people_contacts (people_id, contact_type, contact_value, label, is_default, tenant_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [personId, 'phone', phone, 'Principal', false, tenantId]
            )
        }

        // Add Address
        if (cep && endereco) {
            await client.query(
                `INSERT INTO app.people_addresses (people_id, address_type, postal_code, street, number, complement, neighborhood, city, state, tenant_id, latitude, longitude, plus_code, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
                [personId, 'commercial', cep, endereco, numero, complemento, bairro, cidade, estado, tenantId, latitude, longitude, plusCode]
            )
        }

        // Associate Person to Tenant
        await client.query(
            "UPDATE app.tenants SET pessoa_id = $1 WHERE uuid = $2",
            [personId, tenantId]
        )

        await client.query('COMMIT')

        return res.status(201).json({ message: 'Cadastro concluído com sucesso!', pessoaId: personId })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error in public partner registration:', error)
        return res.status(500).json({ message: 'Erro ao realizar cadastro.' })
    } finally {
        client.release()
    }
})

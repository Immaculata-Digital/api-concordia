import { Router } from 'express'
import { pool } from '../../../infra/database/pool'

export const peopleRoutes = Router()

// --- Relationship Types ---
peopleRoutes.get('/relationship-types', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const result = await pool.query(
            'SELECT * FROM app.people_relationship_types WHERE tenant_id = $1 ORDER BY item_order',
            [tenantId]
        )
        return res.json(result.rows.map(row => ({
            id: row.uuid,
            code: row.code,
            connector_prefix: row.connector_prefix,
            relationship_source: row.relationship_source,
            connector_suffix: row.connector_suffix,
            relationship_target: row.relationship_target,
            inverse_type_id: row.inverse_type_id,
            created_at: row.created_at,
            updated_at: row.updated_at
        })))
    } catch (error) {
        console.error('Error listing relationship types:', error)
        return res.status(500).json({ message: 'Erro ao listar tipos de relacionamento' })
    }
})

peopleRoutes.post('/relationship-types', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { code, connectorPrefix, relationshipSource, connectorSuffix, relationshipTarget, inverseTypeId } = req.body
        const result = await pool.query(
            `INSERT INTO app.people_relationship_types 
            (tenant_id, code, connector_prefix, relationship_source, connector_suffix, relationship_target, inverse_type_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING *`,
            [tenantId, code, connectorPrefix, relationshipSource, connectorSuffix, relationshipTarget, inverseTypeId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            code: row.code,
            connector_prefix: row.connector_prefix,
            relationship_source: row.relationship_source,
            connector_suffix: row.connector_suffix,
            relationship_target: row.relationship_target,
            inverse_type_id: row.inverse_type_id,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar tipo de relacionamento' })
    }
})

peopleRoutes.put('/relationship-types/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        const { code, connectorPrefix, relationshipSource, connectorSuffix, relationshipTarget, inverseTypeId } = req.body
        const result = await pool.query(
            `UPDATE app.people_relationship_types SET
            code = $3, connector_prefix = $4, relationship_source = $5, connector_suffix = $6, relationship_target = $7, inverse_type_id = $8, updated_by = $9, updated_at = NOW()
            WHERE uuid = $2 AND tenant_id = $1 RETURNING *`,
            [tenantId, id, code, connectorPrefix, relationshipSource, connectorSuffix, relationshipTarget, inverseTypeId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            code: row.code,
            connector_prefix: row.connector_prefix,
            relationship_source: row.relationship_source,
            connector_suffix: row.connector_suffix,
            relationship_target: row.relationship_target,
            inverse_type_id: row.inverse_type_id,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar tipo de relacionamento' })
    }
})

peopleRoutes.delete('/relationship-types/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        await pool.query('DELETE FROM app.people_relationship_types WHERE uuid = $2 AND tenant_id = $1', [tenantId, id])
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir tipo de relacionamento' })
    }
})

// --- Document Categories (Mock) ---
peopleRoutes.get('/documents-categories', (req, res) => {
    return res.json([
        { code: 'RG', name: 'RG', enabled: true },
        { code: 'CPF', name: 'CPF', enabled: true },
        { code: 'CNH', name: 'CNH', enabled: true },
        { code: 'COMPROVANTE_RESIDENCIA', name: 'Comprovante de Residência', enabled: true }
    ])
})

// --- People CRUD ---
peopleRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { search, page = 1, limit = 100 } = req.query
        const offset = (Number(page) - 1) * Number(limit)

        let query = `
            SELECT p.*, t.name as tenant_name, u.login as usuario_login, u.full_name as usuario_nome
            FROM app.people p
            LEFT JOIN app.tenants t ON t.uuid = p.tenant_id
            LEFT JOIN app.users u ON u.uuid = p.usuario_id
            WHERE p.tenant_id = $1
        `
        const params: any[] = [tenantId]

        if (search) {
            query += ` AND (p.name ILIKE $2 OR p.cpf_cnpj ILIKE $2)`
            params.push(`%${search}%`)
        }

        query += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`

        const result = await pool.query(query, params)

        // Also fetch total count
        const countQuery = `SELECT COUNT(*) FROM app.people WHERE tenant_id = $1 ${search ? 'AND (name ILIKE $2 OR cpf_cnpj ILIKE $2)' : ''}`
        const countResult = await pool.query(countQuery, params)

        const people = result.rows.map(row => ({
            id: row.uuid,
            seqId: row.seq_id,
            name: row.name,
            cpfCnpj: row.cpf_cnpj,
            birthDate: row.birth_date,
            tenantId: row.tenant_id,
            tenantName: row.tenant_name,
            usuarioId: row.usuario_id,
            usuarioLogin: row.usuario_login,
            usuarioNome: row.usuario_nome,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by
        }))

        if (req.query.page) {
            return res.json({
                data: people,
                total: parseInt(countResult.rows[0].count)
            })
        }
        return res.json(people)

    } catch (error) {
        console.error('Error listing people:', error)
        return res.status(500).json({ message: 'Erro ao listar pessoas' })
    }
})

peopleRoutes.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params

        const personResult = await pool.query(`
            SELECT p.*, t.name as tenant_name, u.login as usuario_login, u.full_name as usuario_nome
            FROM app.people p
            LEFT JOIN app.tenants t ON t.uuid = p.tenant_id
            LEFT JOIN app.users u ON u.uuid = p.usuario_id
            WHERE p.uuid = $1 AND p.tenant_id = $2
        `, [id, tenantId])

        if (personResult.rows.length === 0) return res.status(404).json({ message: 'Pessoa não encontrada' })
        const person = personResult.rows[0]

        // Fetch related data
        const addresses = await pool.query('SELECT * FROM app.people_addresses WHERE people_id = $1', [id])
        const contacts = await pool.query('SELECT * FROM app.people_contacts WHERE people_id = $1', [id])
        const documents = await pool.query('SELECT * FROM app.people_documents WHERE people_id = $1', [id])
        const accounts = await pool.query('SELECT * FROM app.people_bank_accounts WHERE people_id = $1', [id])
        const details = await pool.query('SELECT * FROM app.people_details WHERE people_id = $1', [id])

        const relationships = await pool.query(`
            SELECT 
                r.*,
                rt.code,
                rt.connector_prefix,
                rt.relationship_source,
                rt.connector_suffix,
                rt.relationship_target,
                rt.inverse_type_id,
                p_target.name as target_name,
                p_target.cpf_cnpj as target_cpf_cnpj
            FROM app.people_relationships r
            LEFT JOIN app.people_relationship_types rt ON rt.uuid = r.people_relationship_types_id
            LEFT JOIN app.people p_target ON p_target.uuid = r.people_id_target
            WHERE r.people_id_source = $1
            UNION ALL
            SELECT 
                r.*,
                rt_inv.code,
                rt_inv.connector_prefix,
                rt_inv.relationship_source,
                rt_inv.connector_suffix,
                rt_inv.relationship_target,
                rt_inv.inverse_type_id,
                p_source.name as target_name,
                p_source.cpf_cnpj as target_cpf_cnpj
            FROM app.people_relationships r
            LEFT JOIN app.people_relationship_types rt ON rt.uuid = r.people_relationship_types_id
            LEFT JOIN app.people_relationship_types rt_inv ON rt_inv.uuid = rt.inverse_type_id
            LEFT JOIN app.people p_source ON p_source.uuid = r.people_id_source
            WHERE r.people_id_target = $1
        `, [id])

        // Map to DTO
        const response = {
            id: person.uuid,
            seqId: person.seq_id,
            name: person.name,
            cpfCnpj: person.cpf_cnpj,
            birthDate: person.birth_date,
            tenantId: person.tenant_id,
            tenantName: person.tenant_name,
            usuarioId: person.usuario_id,
            usuarioLogin: person.usuario_login,
            usuarioNome: person.usuario_nome,
            createdAt: person.created_at,
            updatedAt: person.updated_at,
            createdBy: person.created_by,
            updatedBy: person.updated_by,
            addresses: addresses.rows.map(r => ({
                id: r.uuid,
                address_type: r.address_type,
                postal_code: r.postal_code,
                street: r.street,
                number: r.number,
                complement: r.complement,
                neighborhood: r.neighborhood,
                city: r.city,
                state: r.state,
                created_at: r.created_at,
                updated_at: r.updated_at
            })),
            contacts: contacts.rows.map(r => ({
                id: r.uuid,
                contact_type: r.contact_type,
                contact_value: r.contact_value,
                label: r.label,
                is_default: r.is_default,
                created_at: r.created_at,
                updated_at: r.updated_at
            })),
            bankAccounts: accounts.rows.map(r => ({
                id: r.uuid,
                bank_code: r.bank_code,
                branch_code: r.branch_code,
                account_number: r.account_number,
                account_type: r.account_type,
                pix_key: r.pix_key,
                is_default_receipt: r.is_default_receipt,
                created_at: r.created_at,
                updated_at: r.updated_at
            })),
            documents: documents.rows.map(r => ({
                id: r.uuid,
                category_code: r.category_code,
                category_name: r.category_name,
                file: r.file,
                verification_status: r.verification_status,
                rejection_reason: r.rejection_reason,
                expiration_date: r.expiration_date,
                file_name: r.file_name,
                file_size: r.file_size,
                created_at: r.created_at,
                updated_at: r.updated_at
            })),
            details: details.rows[0] ? {
                id: details.rows[0].uuid,
                sex: details.rows[0].sex,
                marital_status: details.rows[0].marital_status,
                nationality: details.rows[0].nationality,
                occupation: details.rows[0].occupation,
                birth_date: details.rows[0].birth_date,
                first_name: details.rows[0].first_name,
                surname: details.rows[0].surname,
                legal_name: details.rows[0].legal_name,
                trade_name: details.rows[0].trade_name,
                created_at: details.rows[0].created_at,
                updated_at: details.rows[0].updated_at
            } : null,
            relationships: relationships.rows.map(r => ({
                id: r.uuid,
                people_relationship_types_id: r.people_relationship_types_id,
                people_id_source: r.people_id_source,
                people_id_target: r.people_id_target,
                inverse_type_id: r.inverse_type_id,
                connector_prefix: r.connector_prefix,
                relationship_source: r.relationship_source,
                connector_suffix: r.connector_suffix,
                relationship_target: r.relationship_target,
                target_name: r.target_name,
                target_cpf_cnpj: r.target_cpf_cnpj,
                created_at: r.created_at,
                updated_at: r.updated_at
            }))
        }

        return res.json(response)

    } catch (error) {
        console.error('Error getting person:', error)
        return res.status(500).json({ message: 'Erro ao obter pessoa' })
    }
})

peopleRoutes.post('/', async (req, res) => {
    try {
        const loggedTenantId = req.user!.tenantId
        const { name, cpfCnpj, birthDate, tenantId, usuarioId } = req.body

        // Use provided tenantId if available, otherwise use logged user's
        const targetTenantId = tenantId || loggedTenantId
        const normalizedCpfCnpj = cpfCnpj ? cpfCnpj.replace(/\D/g, '') : null

        // Uniqueness check: CPF/CNPJ must be unique within the same tenant
        if (normalizedCpfCnpj) {
            const existing = await pool.query(
                'SELECT uuid FROM app.people WHERE REPLACE(REPLACE(REPLACE(cpf_cnpj, \'.\', \'\'), \'-\', \'\'), \'/\', \'\') = $1 AND tenant_id = $2',
                [normalizedCpfCnpj, targetTenantId]
            )
            if (existing.rows.length > 0) {
                return res.status(400).json({ message: 'Já existe uma pessoa cadastrada com este CPF/CNPJ neste tenant.' })
            }
        }

        const result = await pool.query(
            `INSERT INTO app.people (tenant_id, name, cpf_cnpj, birth_date, usuario_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
            [targetTenantId, name, normalizedCpfCnpj, birthDate || null, usuarioId || null, req.user!.uuid]
        )
        return res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Error creating person:', error)
        return res.status(500).json({ message: 'Erro ao criar pessoa' })
    }
})

peopleRoutes.put('/:id', async (req, res) => {
    try {
        const loggedTenantId = req.user!.tenantId
        const { id } = req.params
        const { name, cpfCnpj, birthDate, tenantId, usuarioId } = req.body

        const targetTenantId = tenantId || loggedTenantId
        const normalizedCpfCnpj = cpfCnpj ? cpfCnpj.replace(/\D/g, '') : null

        // Uniqueness check: CPF/CNPJ must be unique within the same tenant (excluding self)
        if (normalizedCpfCnpj) {
            const existing = await pool.query(
                'SELECT uuid FROM app.people WHERE REPLACE(REPLACE(REPLACE(cpf_cnpj, \'.\', \'\'), \'-\', \'\'), \'/\', \'\') = $1 AND tenant_id = $2 AND uuid != $3',
                [normalizedCpfCnpj, targetTenantId, id]
            )
            if (existing.rows.length > 0) {
                return res.status(400).json({ message: 'Já existe outra pessoa cadastrada com este CPF/CNPJ neste tenant.' })
            }
        }

        const result = await pool.query(
            `UPDATE app.people SET name = $3, cpf_cnpj = $4, birth_date = $5, tenant_id = $6, usuario_id = $7, updated_by = $8, updated_at = NOW()
            WHERE uuid = $2 AND tenant_id = $1 RETURNING *`,
            [loggedTenantId, id, name, normalizedCpfCnpj, birthDate, targetTenantId, usuarioId || null, req.user!.uuid]
        )
        if (result.rowCount === 0) return res.status(404).json({ message: 'Pessoa não encontrada' })
        return res.json(result.rows[0])
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar pessoa' })
    }
})

peopleRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const { id } = req.params
        // Manually cascade delete related tables first if no cascade in DB
        await pool.query('DELETE FROM app.people_details WHERE people_id = $1', [id])
        await pool.query('DELETE FROM app.people_contacts WHERE people_id = $1', [id])
        await pool.query('DELETE FROM app.people_addresses WHERE people_id = $1', [id])
        await pool.query('DELETE FROM app.people_bank_accounts WHERE people_id = $1', [id])
        await pool.query('DELETE FROM app.people_documents WHERE people_id = $1', [id])
        await pool.query('DELETE FROM app.people_relationships WHERE people_id_source = $1 OR people_id_target = $1', [id]) // Careful with relationships

        const result = await pool.query('DELETE FROM app.people WHERE uuid = $2 AND tenant_id = $1', [tenantId, id])
        if (result.rowCount === 0) return res.status(404).json({ message: 'Pessoa não encontrada' })

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir pessoa' })
    }
})

// --- Sub-resource Routes (Basic Implementations) ---

// Contacts
peopleRoutes.post('/:id/contacts', async (req, res) => {
    try {
        const { id } = req.params
        const { contactType, contactValue, label, isDefault } = req.body
        const result = await pool.query(
            `INSERT INTO app.people_contacts (people_id, contact_type, contact_value, label, is_default, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING *`,
            [id, contactType, contactValue, label, isDefault || false, req.user!.tenantId, req.user!.uuid]
        )
        // Map to snake_case for frontend adapter
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            contact_type: row.contact_type,
            contact_value: row.contact_value,
            label: row.label,
            is_default: row.is_default,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.put('/:id/contacts/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params
        const { contactType, contactValue, label, isDefault } = req.body
        const result = await pool.query(
            `UPDATE app.people_contacts SET contact_type=$1, contact_value=$2, label=$3, is_default=$4, updated_by=$5, updated_at=NOW()
            WHERE uuid=$6 RETURNING *`,
            [contactType, contactValue, label, isDefault, req.user!.uuid, contactId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            contact_type: row.contact_type,
            contact_value: row.contact_value,
            label: row.label,
            is_default: row.is_default,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/contacts/:contactId', async (req, res) => {
    await pool.query('DELETE FROM app.people_contacts WHERE uuid=$1', [req.params.contactId])
    return res.status(204).send()
})

// Addresses
peopleRoutes.post('/:id/addresses', async (req, res) => {
    try {
        const { id } = req.params
        const b = req.body
        const result = await pool.query(
            `INSERT INTO app.people_addresses (people_id, address_type, postal_code, street, number, complement, neighborhood, city, state, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11) RETURNING *`,
            [id, b.addressType, b.postalCode, b.street, b.number, b.complement, b.neighborhood, b.city, b.state, req.user!.tenantId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            address_type: row.address_type,
            postal_code: row.postal_code,
            street: row.street,
            number: row.number,
            complement: row.complement,
            neighborhood: row.neighborhood,
            city: row.city,
            state: row.state,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.put('/:id/addresses/:addressId', async (req, res) => {
    try {
        const { addressId } = req.params
        const b = req.body
        const result = await pool.query(
            `UPDATE app.people_addresses SET address_type=$1, postal_code=$2, street=$3, number=$4, complement=$5, neighborhood=$6, city=$7, state=$8, updated_by=$9, updated_at=NOW()
            WHERE uuid=$10 RETURNING *`,
            [b.addressType, b.postalCode, b.street, b.number, b.complement, b.neighborhood, b.city, b.state, req.user!.uuid, addressId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            address_type: row.address_type,
            postal_code: row.postal_code,
            street: row.street,
            number: row.number,
            complement: row.complement,
            neighborhood: row.neighborhood,
            city: row.city,
            state: row.state,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/addresses/:addressId', async (req, res) => {
    await pool.query('DELETE FROM app.people_addresses WHERE uuid=$1', [req.params.addressId])
    return res.status(204).send()
})

// Details
peopleRoutes.post('/:id/details', async (req, res) => {
    try {
        const { id } = req.params
        const b = req.body
        // Check if exists
        const exists = await pool.query('SELECT uuid FROM app.people_details WHERE people_id=$1', [id])
        if (exists.rows.length > 0) {
            // Update instead
            return res.status(400).json({ message: 'Details already exist' })
        }

        const result = await pool.query(
            `INSERT INTO app.people_details (people_id, sex, marital_status, nationality, occupation, birth_date, first_name, surname, legal_name, trade_name, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12) RETURNING *`,
            [id, b.sex, b.maritalStatus, b.nationality, b.occupation, b.birthDate, b.firstName, b.surname, b.legalName, b.tradeName, req.user!.tenantId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            sex: row.sex,
            marital_status: row.marital_status,
            nationality: row.nationality,
            occupation: row.occupation,
            birth_date: row.birth_date,
            first_name: row.first_name,
            surname: row.surname,
            legal_name: row.legal_name,
            trade_name: row.trade_name,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.put('/:id/details/:detailId', async (req, res) => {
    try {
        const { detailId } = req.params
        const b = req.body
        const result = await pool.query(
            `UPDATE app.people_details SET sex=$1, marital_status=$2, nationality=$3, occupation=$4, birth_date=$5, first_name=$6, surname=$7, legal_name=$8, trade_name=$9, updated_by=$10, updated_at=NOW()
            WHERE uuid=$11 RETURNING *`,
            [b.sex, b.maritalStatus, b.nationality, b.occupation, b.birthDate, b.firstName, b.surname, b.legalName, b.tradeName, req.user!.uuid, detailId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            sex: row.sex,
            marital_status: row.marital_status,
            nationality: row.nationality,
            occupation: row.occupation,
            birth_date: row.birth_date,
            first_name: row.first_name,
            surname: row.surname,
            legal_name: row.legal_name,
            trade_name: row.trade_name,
            created_at: row.created_at,
            updated_at: row.updated_at
        })

    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/details/:detailId', async (req, res) => {
    await pool.query('DELETE FROM app.people_details WHERE uuid=$1', [req.params.detailId])
    return res.status(204).send()
})

// Bank Accounts
peopleRoutes.post('/:id/bank-accounts', async (req, res) => {
    try {
        const { id } = req.params
        const b = req.body
        const result = await pool.query(
            `INSERT INTO app.people_bank_accounts (people_id, bank_code, branch_code, account_number, account_type, pix_key, is_default_receipt, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) RETURNING *`,
            [id, b.bankCode, b.branchCode, b.accountNumber, b.accountType, b.pixKey, b.isDefaultReceipt || false, req.user!.tenantId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            bank_code: row.bank_code,
            branch_code: row.branch_code,
            account_number: row.account_number,
            account_type: row.account_type,
            pix_key: row.pix_key,
            is_default_receipt: row.is_default_receipt,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.put('/:id/bank-accounts/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params
        const b = req.body
        const result = await pool.query(
            `UPDATE app.people_bank_accounts SET bank_code=$1, branch_code=$2, account_number=$3, account_type=$4, pix_key=$5, is_default_receipt=$6, updated_by=$7, updated_at=NOW()
            WHERE uuid=$8 RETURNING *`,
            [b.bankCode, b.branchCode, b.accountNumber, b.accountType, b.pixKey, b.isDefaultReceipt, req.user!.uuid, accountId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            bank_code: row.bank_code,
            branch_code: row.branch_code,
            account_number: row.account_number,
            account_type: row.account_type,
            pix_key: row.pix_key,
            is_default_receipt: row.is_default_receipt,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/bank-accounts/:accountId', async (req, res) => {
    await pool.query('DELETE FROM app.people_bank_accounts WHERE uuid=$1', [req.params.accountId])
    return res.status(204).send()
})

// Documents
peopleRoutes.post('/:id/documents', async (req, res) => {
    try {
        const { id } = req.params
        const b = req.body
        const result = await pool.query(
            `INSERT INTO app.people_documents (people_id, category_code, category_name, file, verification_status, rejection_reason, expiration_date, file_name, file_size, document_internal_data, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12) RETURNING *`,
            [id, b.categoryCode, b.categoryName, b.file, b.verificationStatus || 'PENDING', b.rejectionReason, b.expirationDate, b.fileName, b.fileSize, b.documentInternalData, req.user!.tenantId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            category_code: row.category_code,
            category_name: row.category_name,
            file: row.file,
            verification_status: row.verification_status,
            rejection_reason: row.rejection_reason,
            expiration_date: row.expiration_date,
            file_name: row.file_name,
            file_size: row.file_size,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

peopleRoutes.put('/:id/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params
        const b = req.body
        // Dynamic update based on fields provided would be better, but simple update for now
        const result = await pool.query(
            `UPDATE app.people_documents SET category_code=$1, category_name=$2, file=$3, verification_status=$4, rejection_reason=$5, expiration_date=$6, file_name=$7, file_size=$8, updated_by=$9, updated_at=NOW()
            WHERE uuid=$10 RETURNING *`,
            [b.categoryCode, b.categoryName, b.file, b.verificationStatus, b.rejectionReason, b.expirationDate, b.fileName, b.fileSize, req.user!.uuid, documentId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            category_code: row.category_code,
            category_name: row.category_name,
            file: row.file,
            verification_status: row.verification_status,
            rejection_reason: row.rejection_reason,
            expiration_date: row.expiration_date,
            file_name: row.file_name,
            file_size: row.file_size,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/documents/:documentId', async (req, res) => {
    await pool.query('DELETE FROM app.people_documents WHERE uuid=$1', [req.params.documentId])
    return res.status(204).send()
})

// Relationships
peopleRoutes.post('/:id/relationships', async (req, res) => {
    try {
        const { id } = req.params
        const b = req.body
        const result = await pool.query(
            `INSERT INTO app.people_relationships (people_relationship_types_id, people_id_source, people_id_target, tenant_id, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
            [b.peopleRelationshipTypesId, id, b.peopleIdTarget, req.user!.tenantId, req.user!.uuid]
        )
        const row = result.rows[0]
        return res.status(201).json({
            id: row.uuid,
            people_relationship_types_id: row.people_relationship_types_id,
            people_id_source: row.people_id_source,
            people_id_target: row.people_id_target,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

peopleRoutes.put('/:id/relationships/:relationshipId', async (req, res) => {
    try {
        const { relationshipId } = req.params
        const b = req.body
        const result = await pool.query(
            `UPDATE app.people_relationships SET people_relationship_types_id=$1, people_id_target=$2, updated_by=$3, updated_at=NOW()
            WHERE uuid=$4 RETURNING *`,
            [b.peopleRelationshipTypesId, b.peopleIdTarget, req.user!.uuid, relationshipId]
        )
        const row = result.rows[0]
        return res.json({
            id: row.uuid,
            people_relationship_types_id: row.people_relationship_types_id,
            people_id_source: row.people_id_source,
            people_id_target: row.people_id_target,
            created_at: row.created_at,
            updated_at: row.updated_at
        })
    } catch (e) { return res.status(500).json({ error: e }) }
})

peopleRoutes.delete('/:id/relationships/:relationshipId', async (req, res) => {
    await pool.query('DELETE FROM app.people_relationships WHERE uuid=$1', [req.params.relationshipId])
    return res.status(204).send()
})


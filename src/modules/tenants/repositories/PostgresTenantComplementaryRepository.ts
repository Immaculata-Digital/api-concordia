import { pool } from '../../../infra/database/pool'
import { TenantAddressProps } from '../entities/TenantAddress'
import { TenantContactProps } from '../entities/TenantContact'

export class PostgresTenantComplementaryRepository {
    async findAddressByTenantId(tenantId: string): Promise<TenantAddressProps | null> {
        const result = await pool.query('SELECT * FROM app.tenant_addresses WHERE tenant_id = $1', [tenantId])
        if (!result.rows[0]) return null
        const row = result.rows[0]
        return {
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            postalCode: row.postal_code,
            street: row.street,
            number: row.number,
            complement: row.complement,
            neighborhood: row.neighborhood,
            city: row.city,
            state: row.state,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by
        }
    }

    async findContactsByTenantId(tenantId: string): Promise<TenantContactProps[]> {
        const result = await pool.query('SELECT * FROM app.tenant_contacts WHERE tenant_id = $1 ORDER BY is_default DESC, created_at ASC', [tenantId])
        return result.rows.map(row => ({
            uuid: row.uuid,
            seqId: row.seq_id,
            tenantId: row.tenant_id,
            contactType: row.contact_type,
            contactValue: row.contact_value,
            label: row.label,
            isDefault: row.is_default,
            createdAt: row.created_at,
            createdBy: row.created_by,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by
        }))
    }

    async upsertAddress(data: any): Promise<void> {
        const { tenantId, postalCode, street, number, complement, neighborhood, city, state, updatedBy } = data
        await pool.query(
            `INSERT INTO app.tenant_addresses (
                tenant_id, postal_code, street, number, complement, neighborhood, city, state, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
            ON CONFLICT (tenant_id) DO UPDATE SET
                postal_code = EXCLUDED.postal_code,
                street = EXCLUDED.street,
                number = EXCLUDED.number,
                complement = EXCLUDED.complement,
                neighborhood = EXCLUDED.neighborhood,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                updated_by = EXCLUDED.updated_by,
                updated_at = NOW()`,
            [tenantId, postalCode, street, number, complement, neighborhood, city, state, updatedBy]
        )
    }

    async createContact(data: any): Promise<void> {
        await pool.query(
            `INSERT INTO app.tenant_contacts (
                tenant_id, contact_type, contact_value, label, is_default, created_by, updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $6)`,
            [data.tenantId, data.contactType, data.contactValue, data.label, data.isDefault, data.createdBy]
        )
    }

    async updateContact(uuid: string, data: any): Promise<void> {
        await pool.query(
            `UPDATE app.tenant_contacts SET
                contact_type = $2,
                contact_value = $3,
                label = $4,
                is_default = $5,
                updated_by = $6,
                updated_at = NOW()
            WHERE uuid = $1`,
            [uuid, data.contactType, data.contactValue, data.label, data.isDefault, data.updatedBy]
        )
    }

    async deleteContact(uuid: string): Promise<void> {
        await pool.query('DELETE FROM app.tenant_contacts WHERE uuid = $1', [uuid])
    }
}

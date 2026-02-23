import { PluvytClient, PluvytClientProps } from '../entities/PluvytClient'

export interface IPluvytClientRepository {
    findAll(tenantId: string): Promise<PluvytClient[]>
    findById(uuid: string, tenantId: string): Promise<PluvytClient | null>
    findByPersonId(personId: string, tenantId: string): Promise<PluvytClient | null>
    create(client: PluvytClient): Promise<void>
    update(client: PluvytClient): Promise<void>
    delete(uuid: string, tenantId: string): Promise<void>
}

import { Tenant, TenantProps } from '../entities/Tenant'

export interface ITenantRepository {
    findAll(): Promise<TenantProps[]>
    findById(uuid: string): Promise<TenantProps | null>
    findBySlug(slug: string): Promise<TenantProps | null>
    create(tenant: Tenant): Promise<TenantProps>
    update(tenant: Tenant): Promise<TenantProps>
    delete(uuid: string): Promise<void>
}

import { Brand } from '../entities/Brand'

export interface IBrandRepository {
    getConfigByTenantId(tenantId: string): Promise<Brand | null>
    getConfigByTenantSlug(slug: string): Promise<Brand | null>
    upsertConfig(tenantId: string, content: Partial<Brand>, userId: string): Promise<Brand>
}

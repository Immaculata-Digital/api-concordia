import { BrandConfig, BrandConfigContent } from '../domain/BrandConfig'

export interface IBrandRepository {
    getConfigByTenantId(tenantId: string): Promise<BrandConfig | null>
    getConfigByTenantSlug(slug: string): Promise<BrandConfig | null>
    upsertConfig(tenantId: string, content: Partial<BrandConfigContent>, userId: string): Promise<BrandConfig>
}

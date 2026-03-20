export interface LogoVariantConfig {
    principal?: string;
    wordmark?: string;
    icon?: string;
}

export interface LogoConfig {
    principal?: string;
    wordmark?: string;
    icon?: string;
    favicon?: string;
    light?: LogoVariantConfig;
    dark?: LogoVariantConfig;
}

export interface PaletteConfig {
    primary?: string;
    secondary?: string;
    accent?: string;
    system?: string;
    background_light?: string;
    background_dark?: string;
}

export interface TypographyConfig {
    headings?: string;
    body?: string;
}

export interface SocialMediaConfig {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    x?: string;
}

export interface TenantInfoConfig {
    name?: string;
    document?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        postalCode?: string;
    };
    phone?: string;
}

export interface BrandConfigContent {
    logo?: LogoConfig
    palette?: PaletteConfig
    typography?: TypographyConfig
    social?: SocialMediaConfig
    tenantInfo?: TenantInfoConfig
    name?: string
    description?: string
    category?: string
}

export interface BrandConfig {
    seqId?: number
    tenantId: string
    content: BrandConfigContent
    createdAt?: Date
    createdBy?: string
    updatedAt?: Date
    updatedBy?: string
}

export interface LogoVariantConfig {
    principal?: string;
    letreiro?: string;
    icone?: string;
}

export interface LogoConfig extends LogoVariantConfig {
    light?: LogoVariantConfig;
    dark?: LogoVariantConfig;
    favicon?: string;
}

export interface PaletteConfig {
    primario?: string
    secundario?: string
    destaque?: string
    fundoClaro?: string
    fundoEscuro?: string
}

export interface TypographyConfig {
    cabecalho?: string
    corpo?: string
}

export interface IdentidadeVisualContent {
    logo?: LogoConfig
    palette?: PaletteConfig
    typography?: TypographyConfig
}

export interface IdentidadeVisual {
    seqId?: number
    tenantId: string
    content: IdentidadeVisualContent
    createdAt?: Date
    createdBy?: string
    updatedAt?: Date
    updatedBy?: string
}

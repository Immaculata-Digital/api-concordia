export interface LogoConfig {
    principal?: string
    principalLight?: string
    principalDark?: string
    letreiro?: string
    letreiroLight?: string
    letreiroDark?: string
    icone?: string
    iconeLight?: string
    iconeDark?: string
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

export interface BrandConfigContent {
    logo?: LogoConfig
    palette?: PaletteConfig
    typography?: TypographyConfig
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

import { generateUUID } from '../../../utils/uuid'

export interface ProdutoProps {
    uuid: string
    seqId?: number
    tenantId: string
    nome: string
    codigo?: string
    unidade: string
    marca?: string
    tipo_code?: string
    situacao_code?: string
    classe_produto_code?: string
    categoria_code?: string
    categoria_nome?: string
    garantia?: string
    descricao?: string
    descricao_complementar?: string
    obs?: string
    dias_preparacao?: number
    tags?: string[]
    views?: string[]
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date
    image_url?: string
    image_base64?: string
    images?: Array<{ url?: string; arquivo?: string }>
    precos?: {
        preco: number
        preco_custo?: number
        preco_promocional?: number
    }
    cardapio?: {
        uuid?: string
        ordem: number
        ativo: boolean
        tempoPreparo_min?: number
        tempoPreparo_max?: number
        exibir_tempo_preparo?: boolean
    }
    recompensa?: {
        uuid?: string
        qtd_pontos_resgate: number
        voucher_digital: boolean
    }
    produtoId?: string
    produtoCategoriaId?: string
    produtoNome?: string
    produtoPreco?: number
    produtoImagem?: string
    fichaTecnica?: any[]
    tempoPreparo_min?: string
    tempoPreparo_max?: string
    seo?: {
        slug: string
    }
    variants?: any[]
}

export type CreateProdutoProps = Omit<ProdutoProps, 'uuid' | 'createdAt' | 'updatedAt'>

export type UpdateProdutoProps = Partial<Omit<ProdutoProps, 'uuid' | 'createdAt' | 'updatedAt'>> & {
    updatedBy: string
}

export class Produto {
    private constructor(private props: ProdutoProps) { }

    static create(data: CreateProdutoProps) {
        const timestamp = new Date()
        return new Produto({
            ...data,
            uuid: generateUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: ProdutoProps) {
        return new Produto(props)
    }

    update(data: UpdateProdutoProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): ProdutoProps {
        return { ...this.props }
    }
}

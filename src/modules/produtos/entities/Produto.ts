import { randomUUID } from 'crypto'

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
    produtoCategoriaId?: string
    image_url?: string
    image_base64?: string
    produto_imagem?: string
    produtoImagem?: string
    produtoId?: string
    produtoNome?: string
    categoriaNome?: string
    produtoPreco?: number
    garantia?: string
    descricao_complementar?: string
    obs?: string
    dias_preparacao?: number
    tags?: string[]
    views?: string[]
    fichaTecnica?: any[]
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date
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
            uuid: randomUUID(),
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

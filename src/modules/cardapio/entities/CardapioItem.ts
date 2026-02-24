import { randomUUID } from 'crypto'

export interface CardapioItemProps {
    uuid: string
    seqId?: number
    tenantId: string
    produtoId: string
    ordem: number
    ativo: boolean
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date

    // Virtual fields joined from product/categories
    produtoNome?: string
    produtoPreco?: number
    produtoImagem?: string
    categoriaCode?: string
    categoriaNome?: string
}

export type CreateCardapioItemProps = Omit<CardapioItemProps, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export type UpdateCardapioItemProps = Partial<Omit<CardapioItemProps, 'uuid' | 'tenantId' | 'produtoId' | 'createdAt' | 'updatedAt' | 'deletedAt'>> & {
    updatedBy: string
}

export class CardapioItem {
    private constructor(private props: CardapioItemProps) { }

    static create(data: CreateCardapioItemProps) {
        const timestamp = new Date()
        return new CardapioItem({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: CardapioItemProps) {
        return new CardapioItem(props)
    }

    update(data: UpdateCardapioItemProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): CardapioItemProps {
        return { ...this.props }
    }
}

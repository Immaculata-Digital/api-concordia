import { randomUUID } from 'crypto'

export interface ComandaItemProps {
    uuid: string
    seqId?: number
    tenantId: string
    comandaId: string
    produtoId: string
    quantidade: number
    precoUnitario: number
    total: number
    status: 'PENDENTE' | 'ENTREGUE' | 'CANCELADO'
    observacao?: string
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date

    // Virtual
    produtoNome?: string
}

export interface ComandaProps {
    uuid: string
    seqId?: number
    tenantId: string
    mesaId: string
    clienteNome?: string
    status: 'ABERTA' | 'FECHADA' | 'PAGA' | 'CANCELADA'
    total: number
    abertaEm: Date
    fechadaEm?: Date
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date

    // Virtual
    mesaNumero?: string
    itens?: ComandaItemProps[]
}

export type CreateComandaProps = Omit<ComandaProps, 'uuid' | 'total' | 'abertaEm' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export class Comanda {
    private constructor(private props: ComandaProps) { }

    static create(data: CreateComandaProps) {
        const timestamp = new Date()
        return new Comanda({
            ...data,
            uuid: randomUUID(),
            status: 'ABERTA',
            total: 0,
            abertaEm: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: ComandaProps) {
        return new Comanda(props)
    }

    update(data: Partial<ComandaProps>) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): ComandaProps {
        return { ...this.props }
    }
}

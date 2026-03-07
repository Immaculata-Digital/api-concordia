import { randomUUID } from 'crypto'

export interface PedidoProps {
    uuid: string
    seqId?: number
    tenantId: string
    comandaId: string
    status: 'NOVO' | 'EM_PREPARO' | 'PRONTO' | 'ENTREGUE' | 'PAGO'
    total: number
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date

    // Virtual
    mesaNumero?: string
    mesaId?: string
    qtdItens?: number
    tempoAtendimento?: string
}

export type CreatePedidoProps = Omit<PedidoProps, 'uuid' | 'total' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export class Pedido {
    private constructor(private props: PedidoProps) { }

    static create(data: CreatePedidoProps) {
        const timestamp = new Date()
        return new Pedido({
            ...data,
            uuid: randomUUID(),
            status: 'NOVO',
            total: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: PedidoProps) {
        return new Pedido(props)
    }

    update(data: Partial<PedidoProps>) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): PedidoProps {
        return { ...this.props }
    }
}

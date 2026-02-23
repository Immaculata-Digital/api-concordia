
import { randomUUID } from 'crypto'

export interface RecompensaProps {
    uuid: string
    seqId?: number
    tenantId: string
    produtoId: string
    qtd_pontos_resgate: number
    voucher_digital: boolean
    createdBy?: string
    updatedBy?: string
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date
    // Embedded Product Info for Listing
    produto?: {
        nome: string
        codigo?: string
        unidade: string
        marca?: string
    }
}

export type CreateRecompensaProps = Omit<RecompensaProps, 'uuid' | 'createdAt' | 'updatedAt' | 'produto'>

export type UpdateRecompensaProps = Partial<Omit<RecompensaProps, 'uuid' | 'createdAt' | 'updatedAt' | 'produto'>> & {
    updatedBy: string
}

export class Recompensa {
    private constructor(private props: RecompensaProps) { }

    static create(data: CreateRecompensaProps) {
        const timestamp = new Date()
        return new Recompensa({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: RecompensaProps) {
        return new Recompensa(props)
    }

    update(data: UpdateRecompensaProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): RecompensaProps {
        return { ...this.props }
    }
}

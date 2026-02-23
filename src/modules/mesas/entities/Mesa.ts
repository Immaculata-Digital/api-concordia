import { randomUUID } from 'crypto'

export interface MesaProps {
    uuid: string
    seqId?: number
    tenantId: string
    numero: string
    capacidade: number
    status: 'LIVRE' | 'OCUPADA' | 'RESERVADA' | 'MANUTENCAO'
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date
}

export type CreateMesaProps = Omit<MesaProps, 'uuid' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export type UpdateMesaProps = Partial<Omit<MesaProps, 'uuid' | 'tenantId' | 'createdAt' | 'updatedAt' | 'deletedAt'>>

export class Mesa {
    private constructor(private props: MesaProps) { }

    static create(data: CreateMesaProps) {
        const timestamp = new Date()
        return new Mesa({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: MesaProps) {
        return new Mesa(props)
    }

    update(data: UpdateMesaProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): MesaProps {
        return { ...this.props }
    }
}

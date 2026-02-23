import { randomUUID } from 'crypto'

export interface PointTransactionProps {
    uuid: string
    seqId?: number
    tenantId: string
    clientId: string
    type: 'CREDITO' | 'DEBITO' | 'ESTORNO'
    points: number
    resultingBalance: number
    origin: 'MANUAL' | 'RESGATE' | 'AJUSTE' | 'PROMO' | 'OUTRO'
    rewardItemId?: string
    lojaId?: string
    observation?: string
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export type CreatePointTransactionProps = Omit<PointTransactionProps, 'uuid' | 'createdAt' | 'updatedAt'>

export type UpdatePointTransactionProps = Partial<Omit<PointTransactionProps, 'uuid' | 'tenantId' | 'createdAt' | 'updatedAt'>> & {
    updatedBy: string
}

export class PointTransaction {
    private constructor(private props: PointTransactionProps) { }

    static create(data: CreatePointTransactionProps) {
        const timestamp = new Date()
        return new PointTransaction({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: PointTransactionProps) {
        return new PointTransaction(props)
    }

    update(data: UpdatePointTransactionProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): PointTransactionProps {
        return { ...this.props }
    }
}

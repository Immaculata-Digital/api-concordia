import { randomUUID } from 'crypto'

export interface PluvytClientProps {
    uuid: string
    seqId?: number
    tenantId: string
    personId: string
    saldo: number
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
    deletedAt?: Date
}

export type CreatePluvytClientProps = Omit<PluvytClientProps, 'uuid' | 'createdAt' | 'updatedAt'>

export type UpdatePluvytClientProps = Partial<Omit<PluvytClientProps, 'uuid' | 'tenantId' | 'personId' | 'createdAt' | 'updatedAt'>> & {
    updatedBy: string
}

export class PluvytClient {
    private constructor(private props: PluvytClientProps) { }

    static create(data: CreatePluvytClientProps) {
        const timestamp = new Date()
        return new PluvytClient({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: PluvytClientProps) {
        return new PluvytClient(props)
    }

    update(data: UpdatePluvytClientProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON() {
        return {
            id: this.props.uuid,
            ...this.props
        }
    }
}

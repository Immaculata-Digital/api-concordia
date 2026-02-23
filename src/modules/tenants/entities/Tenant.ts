import { randomUUID } from 'crypto'

export interface TenantProps {
    uuid: string
    seqId?: number
    name: string
    slug: string
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export type CreateTenantProps = Omit<TenantProps, 'uuid' | 'createdAt' | 'updatedAt'>

export type UpdateTenantProps = Partial<Omit<TenantProps, 'uuid' | 'createdAt' | 'updatedAt'>> & {
    updatedBy: string
}

export class Tenant {
    private constructor(private props: TenantProps) { }

    static create(data: CreateTenantProps) {
        const timestamp = new Date()
        return new Tenant({
            ...data,
            uuid: randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: TenantProps) {
        return new Tenant(props)
    }

    update(data: UpdateTenantProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): TenantProps {
        return { ...this.props }
    }
}

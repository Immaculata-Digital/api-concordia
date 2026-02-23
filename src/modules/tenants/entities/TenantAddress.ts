
export interface TenantAddressProps {
    uuid: string
    seqId?: number
    tenantId: string
    postalCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export class TenantAddress {
    private constructor(private props: TenantAddressProps) { }

    static create(data: Omit<TenantAddressProps, 'uuid' | 'createdAt' | 'updatedAt'>) {
        const timestamp = new Date()
        return new TenantAddress({
            ...data,
            uuid: crypto.randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        } as any)
    }

    static restore(props: TenantAddressProps) {
        return new TenantAddress(props)
    }

    toJSON() {
        return {
            id: this.props.uuid,
            ...this.props
        }
    }
}

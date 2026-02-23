
export interface TenantContactProps {
    uuid: string
    seqId?: number
    tenantId: string
    contactType: string
    contactValue: string
    label?: string
    isDefault: boolean
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export class TenantContact {
    private constructor(private props: TenantContactProps) { }

    static create(data: Omit<TenantContactProps, 'uuid' | 'createdAt' | 'updatedAt'>) {
        const timestamp = new Date()
        return new TenantContact({
            ...data,
            uuid: crypto.randomUUID(),
            createdAt: timestamp,
            updatedAt: timestamp,
        } as any)
    }

    static restore(props: TenantContactProps) {
        return new TenantContact(props)
    }

    toJSON() {
        return {
            id: this.props.uuid,
            ...this.props
        }
    }
}

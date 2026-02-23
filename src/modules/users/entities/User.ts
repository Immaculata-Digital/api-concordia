import { randomUUID } from 'crypto'

export interface UserProps {
    uuid: string
    seqId?: number
    tenantId: string
    fullName: string
    login: string
    email: string
    password?: string
    groupIds: string[]
    allowFeatures: string[]
    deniedFeatures: string[]
    createdAt: Date
    createdBy?: string
    updatedAt: Date
    updatedBy?: string
}

export type CreateUserProps = Omit<UserProps, 'uuid' | 'createdAt' | 'updatedAt'>

export type UpdateUserProps = Partial<Omit<UserProps, 'uuid' | 'tenantId' | 'createdAt' | 'updatedAt'>> & {
    updatedBy: string
}

export class User {
    private constructor(private props: UserProps) { }

    static create(data: CreateUserProps) {
        const timestamp = new Date()
        return new User({
            ...data,
            uuid: randomUUID(),
            allowFeatures: data.allowFeatures ?? [],
            deniedFeatures: data.deniedFeatures ?? [],
            groupIds: data.groupIds ?? [],
            createdAt: timestamp,
            updatedAt: timestamp,
        })
    }

    static restore(props: UserProps) {
        return new User(props)
    }

    update(data: UpdateUserProps) {
        Object.assign(this.props, data)
        this.props.updatedAt = new Date()
    }

    toJSON(): UserProps {
        return { ...this.props }
    }
}

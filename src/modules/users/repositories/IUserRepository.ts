import { User, UserProps } from '../entities/User'

export interface IUserRepository {
    findAll(tenantId: string): Promise<UserProps[]>
    findById(tenantId: string, uuid: string): Promise<UserProps | null>
    findByLogin(tenantId: string, login: string): Promise<UserProps | null>
    findByEmail(tenantId: string, email: string): Promise<UserProps | null>
    findByLoginOrEmail(loginOrEmail: string): Promise<(UserProps & { passwordHash: string }) | null>
    create(user: User): Promise<UserProps>
    update(user: User): Promise<UserProps>
    delete(tenantId: string, uuid: string): Promise<void>
}

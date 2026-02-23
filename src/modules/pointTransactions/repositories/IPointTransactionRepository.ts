import { PointTransaction, PointTransactionProps } from '../entities/PointTransaction'

export interface IPointTransactionRepository {
    findAll(tenantId: string, filters?: { clientId?: string }): Promise<PointTransactionProps[]>
    findById(tenantId: string, uuid: string): Promise<PointTransactionProps | null>
    create(transaction: PointTransaction): Promise<PointTransactionProps>
    update(transaction: PointTransaction): Promise<PointTransactionProps>
    delete(tenantId: string, uuid: string): Promise<void>
}

import { randomUUID } from 'crypto'

export interface ProductListProps {
    uuid: string
    tenant_id: string
    name: string
    product_uuids: string[]
    created_at: Date
    created_by?: string
    updated_at: Date
    updated_by?: string
    deleted_at?: Date | null
}

export type CreateProductListProps = Omit<ProductListProps, 'uuid' | 'created_at' | 'updated_at' | 'deleted_at'>

export type UpdateProductListProps = Partial<Omit<ProductListProps, 'uuid' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at'>> & {
    updated_by?: string
}

export class ProductList {
    private constructor(private props: ProductListProps) { }

    static create(data: CreateProductListProps) {
        const timestamp = new Date()
        return new ProductList({
            ...data,
            uuid: randomUUID(),
            product_uuids: data.product_uuids || [],
            created_at: timestamp,
            updated_at: timestamp,
        })
    }

    static restore(props: ProductListProps) {
        return new ProductList(props)
    }

    update(data: UpdateProductListProps) {
        Object.assign(this.props, data)
        this.props.updated_at = new Date()
    }

    toJSON(): ProductListProps {
        return { ...this.props }
    }
}

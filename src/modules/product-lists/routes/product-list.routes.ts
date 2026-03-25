import { Router } from 'express'
import { PostgresProductListRepository } from '../repositories/PostgresProductListRepository'
import { ProductList } from '../entities/ProductList'

export const productListRoutes = Router()
const repository = new PostgresProductListRepository()

productListRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.query.tenantId as string || req.user!.tenantId
        const view = req.query.view as string
        const lists = await repository.findAll(tenantId, view)
        return res.json(lists)
    } catch (error) {
        console.error('Error listing product lists:', error)
        return res.status(500).json({ message: 'Erro ao listar listas de produtos' })
    }
})

productListRoutes.get('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const list = await repository.findById(req.params.id, tenantId)
        if (!list) return res.status(404).json({ message: 'Lista não encontrada' })

        const detailedProducts = await repository.getDetailedProducts(list.product_uuids, tenantId)

        return res.json({
            ...list,
            detailed_products: detailedProducts
        })
    } catch (error) {
        console.error('Error getting product list:', error)
        return res.status(500).json({ message: 'Erro ao buscar lista de produtos' })
    }
})

productListRoutes.post('/', async (req, res) => {
    try {
        const tenant_id = req.user!.tenantId
        const { name, product_uuids } = req.body
        
        const productList = ProductList.create({
            tenant_id,
            name,
            product_uuids: product_uuids || [],
            created_by: req.user!.uuid,
            updated_by: req.user!.uuid
        })

        const created = await repository.create(productList)
        return res.status(201).json(created)
    } catch (error) {
        console.error('Error creating product list:', error)
        return res.status(500).json({ message: 'Erro ao criar lista de produtos' })
    }
})

productListRoutes.put('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        const existing = await repository.findById(req.params.id, tenantId)
        if (!existing) return res.status(404).json({ message: 'Lista não encontrada' })

        const productList = ProductList.restore(existing)
        productList.update({
            ...req.body,
            updated_by: req.user!.uuid
        })

        const updated = await repository.update(productList)
        return res.json(updated)
    } catch (error) {
        console.error('Error updating product list:', error)
        return res.status(500).json({ message: 'Erro ao atualizar lista de produtos' })
    }
})

productListRoutes.delete('/:id', async (req, res) => {
    try {
        const tenantId = req.user!.tenantId
        await repository.delete(req.params.id, tenantId)
        return res.status(204).send()
    } catch (error) {
        console.error('Error deleting product list:', error)
        return res.status(500).json({ message: 'Erro ao excluir lista de produtos' })
    }
})

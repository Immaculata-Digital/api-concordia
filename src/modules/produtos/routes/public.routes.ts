import { Router } from 'express'
import { PostgresProdutoCategoriaRepository } from '../repositories/PostgresProdutoCategoriaRepository'
import { PostgresProdutoRepository } from '../repositories/PostgresProdutoRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'

export const publicProdutoCategoriaRoutes = Router({ mergeParams: true })
const repository = new PostgresProdutoCategoriaRepository()
const produtoRepository = new PostgresProdutoRepository()
const tenantRepository = new PostgresTenantRepository()

// Helper para encontrar tenant por slug (param/query) ou id (query)
const findTenant = async (req: any) => {
    const { tenantSlug: paramSlug } = req.params
    const { tenantSlug: querySlug, tenantId: queryId } = req.query
    
    if (paramSlug && paramSlug !== ':tenantSlug') {
        return await tenantRepository.findBySlug(paramSlug)
    }
    if (querySlug) {
        return await tenantRepository.findBySlug(querySlug)
    }
    if (queryId) {
        return await tenantRepository.findById(queryId)
    }
    return null
}

// Listar categorias de um tenant (Público)
publicProdutoCategoriaRoutes.get('/', async (req, res) => {
    try {
        const tenant = await findTenant(req)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado (slug ou id)' })
        }

        const categories = await repository.findAll(tenant.uuid!)
        return res.json(categories.map(c => ({
            uuid: c.uuid,
            nome: c.name,
            codigo: c.code,
            imagem: c.image_url,
            descricao: c.description,
            ordem: c.sort,
            enabled: c.enabled
        })))
    } catch (error) {
        console.error('Error fetching public categories:', error)
        return res.status(500).json({ message: 'Erro ao listar categorias' })
    }
})

export const publicProdutoRoutes = Router({ mergeParams: true })

// Listar produtos de um tenant (Público) com suporte a view
publicProdutoRoutes.get('/', async (req, res) => {
    try {
        const tenant = await findTenant(req)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const { view, categoria_code, limit, offset, page } = req.query
        
        const products = await produtoRepository.findAll(
            tenant.uuid!,
            view as string,
            limit ? Number(limit) : undefined,
            offset ? Number(offset) : undefined,
            categoria_code as string
        )

        return res.json(products)
    } catch (error) {
        console.error('Error fetching public products:', error)
        return res.status(500).json({ message: 'Erro ao listar produtos' })
    }
})

// Listar produtos por categoria (Público)
publicProdutoRoutes.get('/category/:categorySlug', async (req, res) => {
    try {
        const tenant = await findTenant(req)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const { categorySlug } = req.params
        const { page = 1, limit = 20, ...rest } = req.query as any

        const filters: Record<string, string> = {};
        Object.keys(rest).forEach(key => {
            if (key.startsWith('f_')) {
                filters[key.replace('f_', '')] = rest[key];
            }
        });

        const products = await produtoRepository.getProductsByPublicCategory(
            categorySlug, 
            tenant.uuid!, 
            Number(page), 
            Number(limit),
            filters
        )
        
        return res.json(products)
    } catch (error) {
        console.error('Error fetching public category products:', error)
        return res.status(500).json({ message: 'Erro ao listar produtos da categoria' })
    }
})

// Buscar filtros por categoria (Público)
publicProdutoRoutes.get('/category/:categorySlug/filters', async (req, res) => {
    try {
        const tenant = await findTenant(req)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const { categorySlug } = req.params

        const filtersQueryParam: Record<string, string> = {}
        Object.entries(req.query).forEach(([key, value]) => {
            if (key.startsWith('f_') && typeof value === 'string') {
                const cleanKey = key.replace('f_', '')
                filtersQueryParam[cleanKey] = value
            }
        })

        const filters = await produtoRepository.getCategoryFilters(categorySlug, tenant.uuid!, filtersQueryParam)
        return res.json(filters)
    } catch (error) {
        console.error('Error fetching public category filters:', error)
        return res.status(500).json({ message: 'Erro ao buscar filtros da categoria' })
    }
})

// Buscar detalhe de um produto (Público) - Suporta ID ou Slug
publicProdutoRoutes.get('/:idOrSlug', async (req, res) => {
    try {
        const tenant = await findTenant(req)
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const { idOrSlug } = req.params
        const product = await produtoRepository.findBySlugOrId(idOrSlug, tenant.uuid!)
        
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' })
        }

        return res.json(product)
    } catch (error) {
        console.error('Error fetching public product detail:', error)
        return res.status(500).json({ message: 'Erro ao buscar detalhes do produto' })
    }
})

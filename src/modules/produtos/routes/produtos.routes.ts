import { Router } from 'express'
import { PostgresProdutoRepository } from '../repositories/PostgresProdutoRepository'
import { Produto } from '../entities/Produto'
import { PostgresProdutoComplementaryRepository } from '../repositories/PostgresProdutoComplementaryRepository'
import { convertImageToWebP } from '../../../core/convertImageToWebP'

export const produtosRoutes = Router()
const repository = new PostgresProdutoRepository()
const complementaryRepository = new PostgresProdutoComplementaryRepository()

produtosRoutes.get('/', async (req, res) => {
    try {
        const tenantId = req.query.tenantId as string
        const produtos = await repository.findAll(tenantId)
        return res.json(produtos)
    } catch (error) {
        console.error('Error listing produits:', error)
        return res.status(500).json({ message: 'Erro ao listar produtos' })
    }
})

produtosRoutes.get('/:id', async (req, res) => {
    try {
        const produto = await repository.findById(req.params.id)
        if (!produto) return res.status(404).json({ message: 'Produto não encontrado' })

        const fiscal = await complementaryRepository.getFiscal(req.params.id)
        const logistica = await complementaryRepository.getLogistica(req.params.id)
        const precos = await complementaryRepository.getPrecos(req.params.id)
        const seo = await complementaryRepository.getSeo(req.params.id)
        const fichaTecnica = await complementaryRepository.getFichaTecnica(req.params.id)
        const media = await complementaryRepository.getMedia(req.params.id)
        const kit = await complementaryRepository.getKit(req.params.id)
        const variacoes = await complementaryRepository.getVariacoes(req.params.id)

        return res.json({
            ...produto,
            fiscal,
            logistica,
            precos,
            seo,
            fichaTecnica,
            media,
            kit,
            variacoes
        })
    } catch (error) {
        console.error('Error getting product:', error)
        return res.status(500).json({ message: 'Erro ao buscar produto' })
    }
})

produtosRoutes.post('/', async (req, res) => {
    try {
        const { tenantId, nome, unidade, ...rest } = req.body
        const produto = Produto.create({
            tenantId,
            nome,
            unidade,
            ...rest,
            createdBy: req.user!.uuid,
            updatedBy: req.user!.uuid
        })

        const created = await repository.create(produto)
        return res.status(201).json(created)
    } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({ message: 'Erro ao criar produto' })
    }
})

produtosRoutes.put('/:id', async (req, res) => {
    try {
        const existing = await repository.findById(req.params.id)
        if (!existing) return res.status(404).json({ message: 'Produto não encontrado' })

        const produto = Produto.restore(existing)
        produto.update({
            ...req.body,
            updatedBy: req.user!.uuid
        })

        const updated = await repository.update(produto)
        return res.json(updated)
    } catch (error) {
        console.error('Error updating product:', error)
        return res.status(500).json({ message: 'Erro ao atualizar produto' })
    }
})

produtosRoutes.delete('/:id', async (req, res) => {
    try {
        await repository.delete(req.params.id)
        return res.status(204).send()
    } catch (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({ message: 'Erro ao excluir produto' })
    }
})

// --- Complementary Routes ---

produtosRoutes.post('/:id/fiscal', async (req, res) => {
    try {
        await complementaryRepository.upsertFiscal(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.json({ message: 'Dados fiscais atualizados' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao salvar dados fiscais' })
    }
})

produtosRoutes.post('/:id/logistica', async (req, res) => {
    try {
        await complementaryRepository.upsertLogistica(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.json({ message: 'Dados de logística atualizados' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao salvar dados de logística' })
    }
})

produtosRoutes.post('/:id/precos', async (req, res) => {
    try {
        await complementaryRepository.upsertPrecos(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.json({ message: 'Preços atualizados' })
    } catch (error: any) {
        console.error('Error saving prices:', error)
        try {
            const fs = await import('fs')
            fs.appendFileSync('/Users/macbook/immaculata-workspace/api-concordia/error.log', `[${new Date().toISOString()}] Error saving prices: ${error.stack || error.message || error}\n`)
        } catch (e) { }
        return res.status(500).json({ message: 'Erro ao salvar preços' })
    }
})

produtosRoutes.post('/:id/seo', async (req, res) => {
    try {
        await complementaryRepository.upsertSeo(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.json({ message: 'SEO atualizado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao salvar SEO' })
    }
})

// Ficha Técnica
produtosRoutes.post('/:id/ficha-tecnica', async (req, res) => {
    try {
        await complementaryRepository.addFichaTecnica(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.status(201).json({ message: 'Item de ficha técnica adicionado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao adicionar item de ficha técnica' })
    }
})

produtosRoutes.delete('/ficha-tecnica/:itemId', async (req, res) => {
    try {
        await complementaryRepository.deleteFichaTecnica(req.params.itemId)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir item de ficha técnica' })
    }
})

// Mídia
produtosRoutes.post('/:id/media', async (req, res) => {
    try {
        // Normalização do tipo_code para evitar violação de FK
        if (req.body.tipo_code) {
            const tipoMap: { [key: string]: string } = {
                'IMG': 'imagem',
                'IMAGE': 'imagem',
                'IMG_PRODUTO': 'imagem',
                'VID': 'video',
                'VIDEO': 'video',
            }
            const normalized = tipoMap[req.body.tipo_code.toUpperCase()]
            if (normalized) req.body.tipo_code = normalized
        }

        if (req.body.arquivo) {
            const converted = await convertImageToWebP(req.body.arquivo)
            req.body.arquivo = converted.base64
            req.body.file_size = converted.fileSize
            if (req.body.file_name) {
                req.body.file_name = req.body.file_name.replace(/\.(png|jpe?g|avif)$/i, '.webp')
            }
        }

        const tenantId = req.body.tenantId || req.user!.tenantId
        await complementaryRepository.addMedia(req.params.id, tenantId, req.body, req.user!.uuid)
        return res.status(201).json({ message: 'Mídia adicionada' })
    } catch (error) {
        console.error('[produtosRoutes.post/:id/media] Error:', error)

        return res.status(500).json({ message: 'Erro ao adicionar mídia', error: error instanceof Error ? error.message : String(error) })
    }
})

produtosRoutes.delete('/media/:mediaId', async (req, res) => {
    try {
        await complementaryRepository.deleteMedia(req.params.mediaId)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir mídia' })
    }
})

produtosRoutes.put('/media/:mediaId', async (req, res) => {
    try {
        if (req.body.tipo_code) {
            const tipoMap: { [key: string]: string } = {
                'IMG': 'imagem',
                'IMAGE': 'imagem',
                'IMG_PRODUTO': 'imagem',
                'VID': 'video',
                'VIDEO': 'video',
            }
            const normalized = tipoMap[req.body.tipo_code.toUpperCase()]
            if (normalized) req.body.tipo_code = normalized
        }

        if (req.body.arquivo && req.body.arquivo.startsWith('data:')) {
            const converted = await convertImageToWebP(req.body.arquivo)
            req.body.arquivo = converted.base64
            req.body.file_size = converted.fileSize
            if (req.body.file_name) {
                req.body.file_name = req.body.file_name.replace(/\.(png|jpe?g|avif)$/i, '.webp')
            }
        }

        await complementaryRepository.updateMedia(req.params.mediaId, req.body, req.user!.uuid)
        return res.json({ message: 'Mídia atualizada' })
    } catch (error) {
        console.error('[produtosRoutes.put/media/:mediaId] Error:', error)
        return res.status(500).json({ message: 'Erro ao atualizar mídia' })
    }
})

// Kit
produtosRoutes.post('/:id/kit', async (req, res) => {
    try {
        await complementaryRepository.addKitItem(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.status(201).json({ message: 'Item de kit adicionado' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao adicionar item de kit' })
    }
})

produtosRoutes.delete('/kit/:itemId', async (req, res) => {
    try {
        await complementaryRepository.deleteKitItem(req.params.itemId)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir item de kit' })
    }
})

// Variacoes
produtosRoutes.post('/:id/variacoes', async (req, res) => {
    try {
        await complementaryRepository.addVariacao(req.params.id, req.body.tenantId, req.body, req.user!.uuid)
        return res.status(201).json({ message: 'Variação adicionada' })
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao adicionar variação' })
    }
})

produtosRoutes.delete('/variacoes/:id', async (req, res) => {
    try {
        await complementaryRepository.deleteVariacao(req.params.id)
        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao excluir variação' })
    }
})

import { Router, Request, Response } from 'express'
import { PostgresIdentidadeVisualRepository } from '../repositories/PostgresIdentidadeVisualRepository'
import { IdentidadeVisualContent } from '../entities/IdentidadeVisual'

export const identidadeVisualRoutes = Router()
const repository = new PostgresIdentidadeVisualRepository()

identidadeVisualRoutes.get('/', async (req: Request, res: Response) => {
    try {
        const tenantId = req.user!.tenantId
        const config = await repository.getConfigByTenantId(tenantId)
        
        if (!config) {
            // Return an empty template so the frontend doesn't break
            return res.json({
                logo: {},
                palette: {},
                typography: {}
            })
        }

        return res.json(config.content)
    } catch (error) {
        console.error('Error fetching brand config:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar configuração de marca' })
    }
})

identidadeVisualRoutes.put('/', async (req: Request, res: Response) => {
    try {
        const tenantId = req.user!.tenantId
        const userId = req.user!.uuid
        const { type } = req.query

        if (!['logo', 'palette', 'typography'].includes(type as string)) {
            return res.status(400).json({ message: 'Tipo de configuração inválido. Use type=logo|palette|typography' })
        }

        // payload structure should match the type
        const contentToMerge: Partial<IdentidadeVisualContent> = {
            [type as string]: req.body
        }

        const updatedConfig = await repository.upsertConfig(tenantId, contentToMerge, userId)

        return res.json(updatedConfig.content)
    } catch (error) {
        console.error('Error updating brand config:', error)
        return res.status(500).json({ message: 'Erro interno ao atualizar configuração de marca' })
    }
})

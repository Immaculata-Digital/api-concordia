import { Request, Response } from 'express'
import { PostgresBrandRepository } from '../repositories/PostgresBrandRepository'
import { BrandConfigContent } from '../domain/BrandConfig'

export class BrandController {
    private repository: PostgresBrandRepository

    constructor() {
        this.repository = new PostgresBrandRepository()
    }

    getConfig = async (req: Request, res: Response) => {
        try {
            const tenantId = req.user!.tenantId
            const config = await this.repository.getConfigByTenantId(tenantId)
            
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
    }

    updateConfig = async (req: Request, res: Response) => {
        try {
            const tenantId = req.user!.tenantId
            const userId = req.user!.uuid
            const { type } = req.query

            if (!['logo', 'palette', 'typography'].includes(type as string)) {
                return res.status(400).json({ message: 'Tipo de configuração inválido. Use type=logo|palette|typography' })
            }

            // payload structure should match the type
            // e.g., if type=logo, req.body is { principal: '...', ... }
            const contentToMerge: Partial<BrandConfigContent> = {
                [type as string]: req.body
            }

            const updatedConfig = await this.repository.upsertConfig(tenantId, contentToMerge, userId)

            return res.json(updatedConfig.content)
        } catch (error) {
            console.error('Error updating brand config:', error)
            return res.status(500).json({ message: 'Erro interno ao atualizar configuração de marca' })
        }
    }
}

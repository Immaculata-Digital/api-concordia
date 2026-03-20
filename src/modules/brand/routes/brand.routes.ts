import { Router, Request, Response } from 'express'
import { PostgresBrandRepository } from '../repositories/PostgresBrandRepository'
import { Brand } from '../entities/Brand'

export const brandRoutes = Router()
const repository = new PostgresBrandRepository()

export const getConfigHandler = async (req: Request, res: Response) => {
    try {
        const tenantId = (req.params.tenantId as string) || (req.query.tenantId as string) || req.user?.tenantId

        if (!tenantId) {
            return res.status(400).json({ message: 'tenantId é obrigatório' })
        }

        // Regex para validar se tenantId é um UUID v4
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(tenantId);

        const config = isUuid 
            ? await repository.getConfigByTenantId(tenantId)
            : await repository.getConfigByTenantSlug(tenantId);
        
        if (!config) {
            return res.json({
                logo: { principal: '', favicon: '' },
                cor_principal: '',
                social: {
                    facebook: '',
                    instagram: '',
                    x: '',
                    linkedin: '',
                    youtube: '',
                    threads: ''
                }
            })
        }

        return res.json(config)
    } catch (error) {
        console.error('Error fetching brand config:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar configuração de marca' })
    }
}

export const updateConfigHandler = async (req: Request, res: Response) => {
    try {
        const tenantId = (req.body.tenantId as string) || (req.query.tenantId as string) || req.user!.tenantId
        const userId = req.user!.uuid
        const { type } = req.query

        if (!['logo', 'cor', 'social'].includes(type as string)) {
            return res.status(400).json({ message: 'Tipo de configuração inválido. Use type=logo|cor|social' })
        }

        const { tenantId: _, ...cleanData } = req.body

        let contentToMerge: Partial<Brand> = {}

        if (type === 'logo') {
            contentToMerge = {
                logo: {
                    principal: cleanData.principal || cleanData.logo?.principal,
                    favicon: cleanData.favicon || cleanData.logo?.favicon
                }
            }
        } else if (type === 'cor') {
            contentToMerge = {
                cor_principal: cleanData.cor_principal || cleanData.cor
            }
        } else if (type === 'social') {
            contentToMerge = {
                social: cleanData
            }
        }

        const updatedConfig = await repository.upsertConfig(tenantId, contentToMerge, userId)

        return res.json(updatedConfig)
    } catch (error) {
        console.error('Error updating brand config:', error)
        return res.status(500).json({ message: 'Erro interno ao atualizar configuração de marca' })
    }
}

brandRoutes.get('/', getConfigHandler)
brandRoutes.get('/:tenantId', getConfigHandler)
brandRoutes.put('/', updateConfigHandler)

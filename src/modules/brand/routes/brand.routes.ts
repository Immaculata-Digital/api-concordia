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

        return res.json({
            name: config.name,
            cor_principal: config.cor_principal,
            logo: {
                principal: config.logo?.principal,
                favicon: config.logo?.favicon
            }
        });
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

        if (type && !['logo', 'cor', 'social'].includes(type as string)) {
            return res.status(400).json({ message: 'Tipo de configuração inválido. Use type=logo|cor|social' })
        }

        const { tenantId: _, ...cleanData } = req.body

        // Busca a configuração atual para realizar o merge aninhado (jsonb do Postgres por padrão faz merge apenas no nível raiz)
        const currentConfig = await repository.getConfigByTenantId(tenantId)

        let contentToMerge: Partial<Brand> = {}

        if (!type) {
            // Bulk update - merge aninhado manual
            if (cleanData.logo || cleanData.principal || cleanData.favicon) {
                contentToMerge.logo = {
                    principal: cleanData.principal ?? cleanData.logo?.principal ?? currentConfig?.logo?.principal ?? '',
                    favicon: cleanData.favicon ?? cleanData.logo?.favicon ?? currentConfig?.logo?.favicon ?? ''
                }
            }

            if (cleanData.cor_principal || cleanData.cor) {
                contentToMerge.cor_principal = cleanData.cor_principal ?? cleanData.cor ?? currentConfig?.cor_principal ?? ''
            }

            if (cleanData.social) {
                contentToMerge.social = {
                    ...(currentConfig?.social || {}),
                    ...cleanData.social
                } as any
            }
            
            // Fallback: se nenhum campo foi mapeado ainda, mas há dados (ex: estrutura vinda do frontend já correta)
            // mas que precisa de merge para não apagar sub-objetos
            if (Object.keys(contentToMerge).length === 0) {
                if (cleanData.logo) {
                    contentToMerge.logo = { ...(currentConfig?.logo || {}), ...cleanData.logo } as any;
                }
                if (cleanData.cor_principal) contentToMerge.cor_principal = cleanData.cor_principal;
                if (cleanData.social) {
                    contentToMerge.social = { ...(currentConfig?.social || {}), ...cleanData.social } as any;
                }
            }
        } else if (type === 'logo') {
            contentToMerge = {
                logo: {
                    principal: cleanData.principal ?? cleanData.logo?.principal ?? currentConfig?.logo?.principal ?? '',
                    favicon: cleanData.favicon ?? cleanData.logo?.favicon ?? currentConfig?.logo?.favicon ?? ''
                }
            }
        } else if (type === 'cor') {
            contentToMerge = {
                cor_principal: cleanData.cor_principal ?? cleanData.cor ?? currentConfig?.cor_principal ?? ''
            }
        } else if (type === 'social') {
            contentToMerge = {
                social: {
                    ...(currentConfig?.social || {}),
                    ...(cleanData.social || cleanData)
                } as any
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

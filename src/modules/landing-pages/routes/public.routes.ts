import { Router } from 'express'
import { PostgresLandingPageRepository } from '../repositories/PostgresLandingPageRepository'
import { PostgresTenantRepository } from '../../tenants/repositories/PostgresTenantRepository'
import { PostgresIdentidadeVisualRepository } from '../repositories/PostgresIdentidadeVisualRepository'
import { PostgresRemetenteRepository } from '../../remetentes/repositories/PostgresRemetenteRepository'
import { sendMail } from '../../../infra/email/mailer'
import { decryptPassword } from '../../../utils/passwordCipher'

export const publicLandingPageRoutes = Router({ mergeParams: true })
const repository = new PostgresLandingPageRepository()
const tenantRepository = new PostgresTenantRepository()
const identidadeVisualRepository = new PostgresIdentidadeVisualRepository()
const remetenteRepository = new PostgresRemetenteRepository()

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

export const publicIdentidadeVisualHandler = async (req: any, res: any) => {
    try {
        const tenant = await findTenant(req)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const config = await identidadeVisualRepository.getConfigByTenantId(tenant.uuid!)
        const baseConfig = config ? config.content : { logo: {}, palette: {}, typography: {} };

        return res.json({
            ...baseConfig
        })
    } catch (error) {
        console.error('Error fetching public identidade visual:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar identidade visual' })
    }
}

export const publicLandingPageHandler = async (req: any, res: any) => {
    try {
        const tenant = await findTenant(req)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const landingPages = await repository.listByTenantId(tenant.uuid!)
        const homePage = landingPages.find((lp: any) => lp.slug === 'home')

        if (!homePage) {
            return res.status(404).json({ message: 'Landing page não encontrada' })
        }

        return res.json({
            ...homePage.content,
            tenantId: tenant.uuid,
            ativa: homePage.ativa
        })
    } catch (error) {
        console.error('Error fetching public landing page:', error)
        return res.status(500).json({ message: 'Erro interno ao buscar landing page' })
    }
}

export const publicLandingPageContactHandler = async (req: any, res: any) => {
    try {
        const tenant = await findTenant(req)
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant não encontrado' })
        }

        const landingPages = await repository.listByTenantId(tenant.uuid!)
        const homePage = landingPages.find((lp: any) => lp.slug === 'home')

        if (!homePage) {
            return res.status(404).json({ message: 'Landing page não encontrada' })
        }

        const contactData = (homePage.content as any)?.['section-contact']
        if (!contactData) {
            return res.status(400).json({ message: 'Landing page não possui seção de contato configurada' })
        }

        const { smtp_remetente_uuid, notificacao_email } = contactData
        const { name, email, subject, details } = req.body

        if (!smtp_remetente_uuid || !notificacao_email) {
             // Se não tiver SMTP configurado, apenas retornamos sucesso para não travar o front,
             // mas logamos o aviso.
             console.warn(`[ContactForm] Landing page ${homePage.uuid} não possui SMTP/Notificação configurado.`);
             return res.json({ message: 'Mensagem recebida (sem notificação configurada)' })
        }

        const remetente = await remetenteRepository.findById(tenant.uuid!, smtp_remetente_uuid, true)
        
        if (!remetente) {
            console.error(`[ContactForm] Remetente ${smtp_remetente_uuid} não encontrado para o tenant ${tenant.uuid}`);
            return res.status(500).json({ message: 'Erro ao processar envio: Configuração SMTP inválida' })
        }

        const smtpConfig = {
            host: remetente.smtpHost,
            port: remetente.smtpPort,
            secure: remetente.smtpSecure,
            user: remetente.email,
            pass: decryptPassword(remetente.senha!),
            fromName: remetente.nome,
            fromEmail: remetente.email
        }

        const html = `
            <h3>Novo contato através da Landing Page</h3>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            <hr />
            <p><strong>Detalhes:</strong></p>
            <p>${details.replace(/\n/g, '<br />')}</p>
        `

        await sendMail({
            to: notificacao_email,
            subject: `[LP Contato] ${subject}`,
            html
        }, smtpConfig)

        return res.json({ message: 'Mensagem enviada com sucesso!' })

    } catch (error) {
        console.error('Error handling public contact form:', error)
        return res.status(500).json({ message: 'Erro interno ao enviar mensagem' })
    }
}

publicLandingPageRoutes.get('/identidade-visual', publicIdentidadeVisualHandler)

publicLandingPageRoutes.post('/contact', publicLandingPageContactHandler)

publicLandingPageRoutes.get('/', publicLandingPageHandler)

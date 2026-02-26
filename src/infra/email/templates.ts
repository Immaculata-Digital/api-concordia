import { env } from '../../config/env'

const BASE_URL = env.pluvytWebUrl || 'https://clube.pluvyt.com.br'

const PREHEADER = `
    <div style="text-align: center; padding: 32px 24px; background-color: #111827; border-radius: 8px 8px 0 0;">
        <img 
            src="${BASE_URL}/images/pluvyt-slogan-light.svg" 
            alt="Pluvyt - Clube de Vantagens" 
            width="200" 
            height="auto" 
            style="display: block; margin: 0 auto; max-width: 200px;"
        />
    </div>
`

// Fallback para clientes de e-mail que bloqueiam imagens
const PREHEADER_FALLBACK = `
    <!--[if !mso]><!-->
    <div style="text-align: center; padding: 24px 0; background-color: #111827; border-radius: 8px 8px 0 0;">
        <h1 style="color: #05C151; margin: 0; font-family: 'Arial Black', sans-serif; font-size: 28px; letter-spacing: -1px;">PLUVYT</h1>
        <p style="color: #9CA3AF; margin: 6px 0 0; font-size: 12px; font-family: Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase;">Clube de Vantagens</p>
    </div>
    <!--<![endif]-->
`

const FOOTER = `
    <div style="text-align: center; padding: 20px; background-color: #F3F4F6; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
            © ${new Date().getFullYear()} Pluvyt — Clube de Vantagens
        </p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #D1D5DB;">
            Este e-mail foi enviado automaticamente. Não responda.
        </p>
    </div>
`

export function getEmailVerificationTemplate(nome: string, token: string): string {
    const url = `${BASE_URL}/conta/email-confirmado?token=${token}`;
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 8px;">
        ${PREHEADER}
        <div style="padding: 32px;">
            <h2 style="color: #111827; margin-top: 0;">Confirme seu e-mail</h2>
            <p>Olá, <strong>${nome}</strong>!</p>
            <p>Você está a um clique de ativar sua conta no <strong>Clube Pluvyt</strong> e começar a acumular pontos em cada compra.</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background-color: #05C151; color: white; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
                    Confirmar meu e-mail
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 24px;">
                ⚠️ Este link expira em <strong>24 horas</strong>. Não compartilhe com ninguém.<br>
                Se você não criou esta conta, ignore este e-mail com segurança.
            </p>
        </div>
        ${FOOTER}
    </div>
    `;
}

export function getPasswordResetTemplate(nome: string, token: string): string {
    const url = `${BASE_URL}/esqueci-senha?token=${token}`;
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 8px;">
        ${PREHEADER}
        <div style="padding: 32px;">
            <h2 style="color: #111827; margin-top: 0;">Recuperação de Senha</h2>
            <p>Olá, <strong>${nome}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Clube Pluvyt</strong>. Se foi você, clique no botão abaixo para criar uma nova senha.</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background-color: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
                    Redefinir minha senha
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 24px;">
                ⚠️ Este link expira em <strong>1 hora</strong>.<br>
                Se não tiver solicitado, ignore este e-mail com segurança.
            </p>
        </div>
        ${FOOTER}
    </div>
    `;
}


import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendMail(options: SendMailOptions): Promise<void> {
    try {
        if (!env.smtp?.host || !env.smtp?.user || !env.smtp?.password) {
            console.warn('[Email] Faltam variáveis SMTP no .env. E-mail não enviado.');
            return;
        }

        const transporter = nodemailer.createTransport({
            host: env.smtp.host,
            port: env.smtp.port,
            secure: env.smtp.secure,
            auth: {
                user: env.smtp.user,
                pass: env.smtp.password,
            },
            authMethod: 'LOGIN',
        });

        const from = env.smtp.fromEmail 
            ? `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`
            : undefined;

        await transporter.sendMail({
            from: from,
            to: options.to,
            subject: options.subject,
            html: options.html
        });
        
        console.log(`[Email] Enviado com sucesso para ${options.to}`);
    } catch (err) {
        console.error(`[Email] Erro ao enviar para ${options.to}:`, err);
    }
}

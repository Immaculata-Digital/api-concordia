import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { pool } from '../database/pool';
import { decryptPassword } from '../../utils/passwordCipher';

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName?: string;
    fromEmail?: string;
}

export async function getSystemSmtpConfig(): Promise<SmtpConfig | undefined> {
    try {
        const res = await pool.query(
            'SELECT * FROM app.remetentes_smtp WHERE email = $1 LIMIT 1',
            ['no-reply@immaculatadigital.com.br']
        )
        if (res.rowCount === 0) return undefined
        const row = res.rows[0]
        return {
            host: row.smtp_host,
            port: row.smtp_port,
            secure: row.smtp_secure,
            user: row.email,
            pass: decryptPassword(row.senha),
            fromName: row.nome,
            fromEmail: row.email
        }
    } catch (error) {
        console.error('[Email] Erro ao buscar configuração SMTP do sistema:', error)
        return undefined
    }
}

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName?: string;
    fromEmail?: string;
}

export async function sendMail(options: SendMailOptions, smtpConfig?: SmtpConfig): Promise<void> {
    try {
        const host = smtpConfig?.host || env.smtp?.host;
        const port = smtpConfig?.port || env.smtp?.port;
        const secure = smtpConfig !== undefined ? smtpConfig.secure : env.smtp?.secure;
        const user = smtpConfig?.user || env.smtp?.user;
        const pass = smtpConfig?.pass || env.smtp?.password;

        if (!host || !user || !pass) {
            console.warn('[Email] Faltam configurações SMTP. E-mail não enviado.');
            return;
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
            authMethod: 'LOGIN',
        });

        const fromEmail = smtpConfig?.fromEmail || env.smtp?.fromEmail;
        const fromName = smtpConfig?.fromName || env.smtp?.fromName;

        const from = fromEmail 
            ? `"${fromName || ''}" <${fromEmail}>`
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

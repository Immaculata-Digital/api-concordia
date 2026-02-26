import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
    port: z.coerce.number().default(3001),
    database: z.object({
        host: z.string().default('localhost'),
        port: z.coerce.number().default(5432),
        user: z.string().default('postgres'),
        password: z.string().default('postgres'),
        name: z.string().default('concordia'),
    }),
    auth: z.object({
        jwtSecret: z.string().default('concordia-secret-key'),
        jwtExpiresIn: z.string().default('12h'),
        bcryptSaltRounds: z.coerce.number().default(12),
    }),
    security: z.object({
        cryptoSecret: z.string().default('concordia-crypto-secret-key'),
    }),
    smtp: z.object({
        host: z.string().optional(),
        port: z.coerce.number().optional().default(587),
        secure: z.coerce.boolean().optional().default(false),
        user: z.string().optional(),
        password: z.string().optional(),
        fromName: z.string().optional().default('Clube Pluvyt'),
        fromEmail: z.string().optional(),
    }).optional(),
    pluvytWebUrl: z.string().optional().default('https://clube.pluvyt.com.br'),
})

export const env = envSchema.parse({
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS || process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
        bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    },
    security: {
        cryptoSecret: process.env.CRYPTO_SECRET,
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASS,
        fromName: process.env.SMTP_FROM_NAME,
        fromEmail: process.env.SMTP_FROM_EMAIL,
    },
    pluvytWebUrl: process.env.PLUVYT_WEB_URL,
})

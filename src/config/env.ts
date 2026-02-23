import dotenv from 'dotenv'
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
})

export const env = envSchema.parse({
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
        bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    },
})

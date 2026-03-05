import type { Request, Response, NextFunction } from 'express'
import { convertImageToWebP } from '../convertImageToWebP'

/**
 * Percorre recursivamente um objeto/array e converte todos os campos
 * que sejam Data URIs de imagem raster (PNG, JPEG, AVIF, WebP) para WebP otimizado.
 *
 * SVGs e qualquer tipo não suportado são ignorados e passados sem alteração.
 */
async function convertDeep(value: unknown): Promise<unknown> {
    if (typeof value === 'string' && value.startsWith('data:image')) {
        // SVGs são vetoriais — não comprimimos nem convertemos
        if (value.startsWith('data:image/svg')) return value
        const { base64 } = await convertImageToWebP(value)
        return base64
    }

    if (Array.isArray(value)) {
        return Promise.all(value.map(convertDeep))
    }

    if (value !== null && typeof value === 'object') {
        const entries = await Promise.all(
            Object.entries(value as Record<string, unknown>).map(
                async ([k, v]) => [k, await convertDeep(v)] as const
            )
        )
        return Object.fromEntries(entries)
    }

    return value
}

/**
 * Middleware Express que intercepta automaticamente todos os requests
 * com body JSON e converte imagens raster em base64 para WebP.
 *
 * - Aplica-se apenas a métodos com body: POST, PUT, PATCH
 * - SVGs são preservados sem alteração
 */
export async function convertImagesMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    const methodsWithBody = ['POST', 'PUT', 'PATCH']

    if (!methodsWithBody.includes(req.method) || !req.body) {
        return next()
    }

    try {
        req.body = await convertDeep(req.body)
    } catch (err) {
        console.error('[convertImagesMiddleware] Falha na conversão de imagens:', err)
        // Melhor deixar o request prosseguir do que bloquear
    }

    next()
}

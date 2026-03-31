import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { pool } from '../../infra/database/pool';
import jwt from 'jsonwebtoken';

// Filtro simples de campos sensíveis para não salvar logs com senhas
const sanitizePayload = (payload: any) => {
    if (!payload) return payload;
    let stringified: string;
    try {
        stringified = typeof payload === 'string' ? payload : JSON.stringify(payload);
    } catch {
        return { message: '[Circular or Invalid JSON]' };
    }
    
    // Expressão regular simples para limpar a palavra que pareça com password/senha
    let sanitized = stringified.replace(/"(password|senha)":\s*".*?"/gi, '"$1": "***"');
    
    // Expressões regulares para substituir imagens em base64 e evitar payloads gigantes no banco
    const getEstimateSize = (b64str: string) => {
        const bytes = Math.max(0, Math.floor((b64str.length * 3) / 4));
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    };

    sanitized = sanitized.replace(/"([^"]*)":\s*"data:[a-zA-Z0-9+-]+\/([a-zA-Z0-9+.-]+);base64,([^"]+)"/gi, (match: string, key: string, ext: string, b64: string) => {
        return `"${key}": "<${key}.${ext} ${getEstimateSize(b64)}>"`;
    });
    
    sanitized = sanitized.replace(/"([^"]*(?:image|logo|foto|picture|base64|file)[^"]*)":\s*"([a-zA-Z0-9+/=\\n]{200,})"/gi, (match: string, key: string, b64: string) => {
        let ext = 'bin';
        if (b64.startsWith('/9j/')) ext = 'jpeg';
        else if (b64.startsWith('iVBORw0KGgo')) ext = 'png';
        else if (b64.startsWith('UklGR')) ext = 'webp';
        else if (b64.startsWith('JVBERi0')) ext = 'pdf';
        else if (b64.startsWith('R0lGOD')) ext = 'gif';
        
        return `"${key}": "<${key}.${ext} ${getEstimateSize(b64)}>"`;
    });
    
    try {
        return JSON.parse(sanitized);
    } catch {
        return sanitized;
    }
};

export const telemetryMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    const startTime = Date.now();
    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody: any = null;

    // Intercepta res.json
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    // Intercepta res.send (caso não usem json diretamente)
    res.send = function (body) {
        if (!responseBody && typeof body === 'string') {
            try {
                responseBody = JSON.parse(body);
            } catch {
                responseBody = body;
            }
        } else if (!responseBody) {
            responseBody = body;
        }
        return originalSend.call(this, body);
    };

    // Escuta o fim de fato do request para consolidar e salvar assincronamente
    res.on('finish', async () => {
        try {
            const table = env.telemetry?.tableName || 'app.api_telemetry';
            const responseTimeMs = Date.now() - startTime;
            
            const reqBody = sanitizePayload(req.body);
            const reqQuery = req.query;
            const reqHeaders = sanitizePayload(req.headers);
            const cleanRespBody = sanitizePayload(responseBody);
            
            // Tratados do Error Handler Global (ou do corpo da resposta, caso o dev tenha feito res.status(error).json direto)
            const errorMessage = res.locals.errorMessage || (cleanRespBody && cleanRespBody.message) || null;
            const errorStack = res.locals.errorStack || null;

            // Tentativa de decodificar e gravar campos JWT
            let jwtLogin: string | null = null;
            let jwtTenantId: string | null = null;
            let jwtTenantSlug: string | null = null;
            
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const decoded: any = jwt.decode(token);
                    if (decoded) {
                        jwtLogin = decoded.login || decoded.email || null;
                        jwtTenantId = decoded.tenantId || decoded.tenant_id || null;
                    }
                } catch {
                    // Ignore decode err 
                }
            }
            
            // Busca o slug direto no banco caso o jwtTenantId exista
            if (jwtTenantId) {
                try {
                    const slugRes = await pool.query('SELECT slug FROM app.tenants WHERE uuid = $1 LIMIT 1', [jwtTenantId]);
                    if (slugRes.rowCount && slugRes.rowCount > 0) {
                        jwtTenantSlug = slugRes.rows[0].slug;
                    }
                } catch (slugErr) {
                    // Ignore error on invalid UUIDs or DB failure, just keep it null.
                }
            }

            const query = `
                INSERT INTO ${table} (
                    method, url, ip, user_agent, 
                    request_headers, request_query, request_body, 
                    response_status, response_body, response_time_ms, 
                    error_message, error_stack, 
                    jwt_login, jwt_tenant_id, jwt_tenant_slug,
                    timestamp
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                    NOW() AT TIME ZONE 'America/Sao_Paulo'
                )
            `;

            const values = [
                req.method,
                req.originalUrl || req.url,
                req.ip || req.socket?.remoteAddress,
                req.headers['user-agent'],
                reqHeaders,
                reqQuery ? JSON.stringify(reqQuery) : null,
                reqBody ? JSON.stringify(reqBody) : null,
                res.statusCode,
                cleanRespBody ? JSON.stringify(cleanRespBody) : null,
                responseTimeMs,
                errorMessage,
                errorStack,
                jwtLogin,
                jwtTenantId,
                jwtTenantSlug
            ];

            // Roda a inserção em background
            pool.query(query, values).catch(e => {
                console.error('[Telemetry Insert Error]:', e);
            });

        } catch (err) {
            console.error('[Telemetry Setup Error]:', err);
        }
    });

    next();
};

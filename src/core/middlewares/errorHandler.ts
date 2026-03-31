import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Definimos a stack de erro no res.locals para o interceptador de telemetria pegar
    res.locals.errorStack = err instanceof Error ? err.stack : String(err);
    
    // Tratativa específica de erros do Zod (validação)
    if (err instanceof ZodError) {
        const issues = err.issues.map((e: any) => ({
             path: e.path.join('.'),
             message: e.message
        }));
        
        const message = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(' | ') || 'Erro de validação';
        res.locals.errorMessage = message; 

        return res.status(400).json({ 
            status: 400, 
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação nos dados fornecidos',
            details: { issues }
        });
    }

    // Tratativa para nossos erros de regras de negócio (AppError)
    if (err instanceof AppError) {
        res.locals.errorMessage = err.message; 
        return res.status(err.statusCode).json({ 
            status: err.statusCode,
            code: err.code,
            message: err.message,
            details: err.details || null
        });
    }

    // Identificar formato de erro com status customizado que possa ter vindo de outras libs 
    const status = err.statusCode || err.status || 500;

    if (status >= 400 && status < 500) {
        const msg = err.message || 'Requisição inválida';
        res.locals.errorMessage = msg;
        return res.status(status).json({ 
            status: status, 
            code: 'BAD_REQUEST',
            message: msg,
            details: { reason: err.message }
        });
    }

    // Erros internos ou do banco de dados interceptados pelo código
    const internalErrors: Record<string, any> = require('../errors/internalErrorsDictionary.json');
    if (err.code && internalErrors[err.code]) {
        const template = internalErrors[err.code];
        res.locals.errorMessage = template.message;
        
        console.error('\n--- [Mapped DB/Internal Error] ---', new Date().toISOString());
        console.error(err);
        
        return res.status(template.status).json({
            status: template.status,
            code: template.code,
            message: template.message,
            details: { errorCode: err.code }
        });
    }

    // Erro 500 imprevisível totalmente alienígena
    const genericMessage = 'Ocorreu um problema em servidor. Tente novamente mais tarde.';
    res.locals.errorMessage = genericMessage; // salva mensagem amigável p/ telemetria

    console.error('\n--- [Unhandled Application Error] ---', new Date().toISOString());
    console.error(err);
    console.error('-------------------------------------\n');

    return res.status(500).json({ 
        status: 500, 
        code: 'INTERNAL_SERVER_ERROR',
        message: genericMessage,
        details: null
    });
};

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
        const message = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(' | ') || 'Erro de validação';
        res.locals.errorMessage = message; 
        return res.status(400).json({ status: 'error', message });
    }

    // Tratativa para nossos erros de regras de negócio (AppError)
    if (err instanceof AppError) {
        res.locals.errorMessage = err.message; 
        return res.status(err.statusCode).json({ status: 'error', message: err.message });
    }

    // Identificar formato de erro com status customizado que possa ter vindo de outras libs 
    const status = err.statusCode || err.status || 500;

    if (status >= 400 && status < 500) {
        const msg = err.message || 'Erro na requisição';
        res.locals.errorMessage = msg;
        return res.status(status).json({ status: 'error', message: msg });
    }

    // Erro 500 imprevisível
    const genericMessage = 'Ocorreu um problema em nosso servidor. Tente novamente mais tarde';
    res.locals.errorMessage = genericMessage; // salva mensagem amigável p/ telemetria

    console.error('\n--- [Unhandled Application Error] ---', new Date().toISOString());
    console.error(err);
    console.error('-------------------------------------\n');

    return res.status(500).json({ status: 'error', message: genericMessage });
};

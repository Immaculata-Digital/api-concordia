import errorTemplates from './errorTemplates.json';

export type ErrorCode = keyof typeof errorTemplates;

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;

    constructor(
        code: ErrorCode,
        details?: any,
        customMessage?: string
    ) {
        const template = errorTemplates[code];
        super(customMessage || (template ? template.message : 'Erro genérico'));
        this.statusCode = template ? template.status : 500;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

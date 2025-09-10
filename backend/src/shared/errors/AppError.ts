export interface AppErrorProps {
    message: string;
    statusCode?: number;
    title?: string;
    cause?: Error;
    issues?: string[];
}

export default class AppError extends Error {
    public readonly statusCode: number;
    public readonly title: string;
    public readonly cause?: Error;
    public readonly issues?: string[];

    constructor({ message, statusCode = 500, title = 'Erro interno', cause, issues }: AppErrorProps) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.title = title;
        this.cause = cause;
        this.issues = issues;

        Error.captureStackTrace(this, this.constructor);
    }
}

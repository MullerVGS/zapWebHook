import { Request, Response, NextFunction } from 'express';
import AppError from '@errors/AppError';
import UseCaseError from '@errors/UseCaseError';
import RepositoryError from '@errors/RepositoryError';
import Pino from '@util/Pino';

export default function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): Response {
    if (error instanceof AppError) {
        Pino.error(`[${error.name}] ${error.message}`);
        
        return res.status(error.statusCode).json({
            error: {
                title: error.title,
                message: error.message,
                issues: error.issues
            }
        });
    }

    Pino.error(`[UnhandledError] ${error.message}`);
    Pino.error(error.stack);

    return res.status(500).json({
        error: {
            title: 'Erro interno do servidor',
            message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        }
    });
}

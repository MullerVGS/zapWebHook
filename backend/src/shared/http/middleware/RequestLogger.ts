import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import Pino from '@util/Pino';

const requestLogger = morgan('combined', {
    stream: {
        write: (message: string) => {
            Pino.info(message.trim());
        }
    }
});

export default requestLogger;

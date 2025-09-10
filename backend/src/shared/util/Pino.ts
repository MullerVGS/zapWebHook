import pino from 'pino';
import Config from '@config/Config';

const logger = pino({
    level: Config.nodeEnv === 'production' ? 'info' : 'debug',
    transport: Config.nodeEnv !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined
});

export default logger;

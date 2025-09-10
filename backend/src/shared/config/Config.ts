import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'dev',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'webhook_catcher',
        username: process.env.DB_USER || 'webhook_user',
        password: process.env.DB_PASSWORD || 'webhook_pass',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'dev'
    }
};

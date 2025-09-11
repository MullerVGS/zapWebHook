import 'reflect-metadata';

import Config from '@config/Config';
import { bindings } from '@container';
import Database from '@database/Database';
import errorHandler from '@middleware/ErrorMiddleware';
import requestLogger from '@middleware/RequestLogger';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { DataSource } from "typeorm";
import fs from 'fs';
import https from 'https';
import path from 'path';

// Import controllers to register them
import '@controllers/ApiController';
import '@controllers/WebhookController';

export class App {
    public express: express.Application;
    public httpsServer: https.Server;
    private dataSource: DataSource;
    public container: Container;
    public static instance: App;

    constructor() {
        App.instance = this;
    }

    private middlewares(app: express.Application): void {
        app.use(helmet());
        app.use(cors());
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        app.use(express.raw({ type: '*/*', limit: '10mb' }));
        app.use(requestLogger);
        
        // Middleware para validação de certificado mTLS nos endpoints de webhook
        app.use('/webhook', (req: any, res, next) => {
            // Verifica se a requisição foi feita com certificado válido
            if (req.socket && req.socket.authorized) {
                next();
            } else {
                res.status(401).json({ 
                    error: 'Certificado de cliente inválido ou não fornecido',
                    message: 'mTLS authentication required' 
                });
            }
        });
    }

    private errorHandler(app: express.Application): void {
        app.use(errorHandler);
    }

    private getHttpsOptions(): https.ServerOptions {
        const certsPath = path.join(__dirname, '../../../certs');
        
        return {
            // Certificado SSL do domínio (fullchain.pem)
            cert: fs.readFileSync(path.join(certsPath, 'fullchain.pem')),
            // Chave privada do domínio
            key: fs.readFileSync(path.join(certsPath, 'privkey.pem')),
            // Certificado público da EfiPay para validação mTLS
            ca: fs.readFileSync(path.join(certsPath, 'certificate-chain-prod.crt')),
            // Configurações mTLS conforme documentação EfiPay
            minVersion: 'TLSv1.2' as const,
            requestCert: true,
            rejectUnauthorized: false, // Mantém false para não rejeitar outros endpoints
        };
    }

    public async configure() {
        // Connect to database
        this.dataSource = await Database.connect();
        
        // Setup DI container
        this.container = new Container();
        await this.container.loadAsync(bindings);
        
        // Setup express server with inversify
        const app = new InversifyExpressServer(this.container);
        
        app.setConfig((app) => {
            this.middlewares(app);
        });
        
        app.setErrorConfig((app) => {
            this.errorHandler(app);
        });
        
        this.express = app.build();
        this.express.set('port', Config.port);
        
        // Health check endpoint
        this.express.get('/health', (req, res) => res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString() 
        }));

        // Configurar servidor HTTPS com mTLS
        try {
            const httpsOptions = this.getHttpsOptions();
            this.httpsServer = https.createServer(httpsOptions, this.express);
            console.log('HTTPS server configured with mTLS support');
        } catch (error) {
            console.warn('Failed to configure HTTPS server:', error);
            console.log('Falling back to HTTP server');
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

    static get<T>(serviceIdentifier: Symbol): T {
        return App.instance.container.get(serviceIdentifier);
    }

    public async shutdown(): Promise<void> {
        if (this.dataSource) {
            await Database.disconnect();
        }
    }
}

export default new App();

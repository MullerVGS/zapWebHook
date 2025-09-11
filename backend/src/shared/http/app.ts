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

// Import controllers to register them
import '@controllers/ApiController';
import '@controllers/WebhookController';

export class App {
    public express: express.Application;
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
    }

    private errorHandler(app: express.Application): void {
        app.use(errorHandler);
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

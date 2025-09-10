import { DataSource } from 'typeorm';
import Config from '@config/Config';
import { WebhookEndpoint } from '@models/WebhookEndpoint';
import { WebhookRequest } from '@models/WebhookRequest';

export default class Database {
    private static dataSource: DataSource;

    public static async connect(): Promise<DataSource> {
        if (this.dataSource && this.dataSource.isInitialized) {
            return this.dataSource;
        }

        this.dataSource = new DataSource({
            type: 'postgres',
            host: Config.database.host,
            port: Config.database.port,
            username: Config.database.username,
            password: Config.database.password,
            database: Config.database.database,
            synchronize: Config.database.synchronize,
            logging: Config.database.logging,
            entities: [WebhookEndpoint, WebhookRequest],
            migrations: [],
            subscribers: []
        });

        await this.dataSource.initialize();
        return this.dataSource;
    }

    public static getDataSource(): DataSource {
        if (!this.dataSource || !this.dataSource.isInitialized) {
            throw new Error('Database not initialized. Call Database.connect() first.');
        }
        return this.dataSource;
    }

    public static async disconnect(): Promise<void> {
        if (this.dataSource && this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }
}

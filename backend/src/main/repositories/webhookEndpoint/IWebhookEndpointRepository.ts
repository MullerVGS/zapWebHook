import { WebhookEndpoint } from '@models/WebhookEndpoint';

export default interface IWebhookEndpointRepository {
    findAll(): Promise<WebhookEndpoint[]>;
    findById(id: string): Promise<WebhookEndpoint | null>;
    findByPath(path: string): Promise<WebhookEndpoint | null>;
    findActiveByPath(path: string): Promise<WebhookEndpoint | null>;
    save(endpoint: WebhookEndpoint): Promise<WebhookEndpoint>;
    update(id: string, endpoint: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null>;
    delete(id: string): Promise<boolean>;
}

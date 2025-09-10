import { WebhookRequest } from '@models/WebhookRequest';

export interface FindRequestsOptions {
    endpointId?: string;
    limit?: number;
    offset?: number;
}

export default interface IWebhookRequestRepository {
    findAll(options?: FindRequestsOptions): Promise<WebhookRequest[]>;
    findById(id: string): Promise<WebhookRequest | null>;
    findByEndpointId(endpointId: string, limit?: number, offset?: number): Promise<WebhookRequest[]>;
    save(request: WebhookRequest): Promise<WebhookRequest>;
    delete(id: string): Promise<boolean>;
}

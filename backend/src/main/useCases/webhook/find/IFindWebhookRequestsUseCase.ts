export interface FindWebhookRequestsRequest {
    endpointId?: string;
    limit?: number;
    offset?: number;
}

export interface FindWebhookRequestsResponse {
    id: string;
    endpoint_id: string;
    method: string;
    url: string;
    headers: Record<string, any>;
    query_params?: Record<string, any>;
    body?: string;
    content_type?: string;
    ip_address?: string;
    user_agent?: string;
    received_at: Date;
    endpoint_name?: string;
    endpoint_path?: string;
}

export default interface IFindWebhookRequestsUseCase {
    execute(request?: FindWebhookRequestsRequest): Promise<FindWebhookRequestsResponse[]>;
}

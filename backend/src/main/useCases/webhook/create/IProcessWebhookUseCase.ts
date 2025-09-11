export interface ProcessWebhookRequest {
    endpointPath: string;
    method: string;
    url: string;
    headers: Record<string, any>;
    queryParams: Record<string, any>;
    body?: string;
    contentType?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface ProcessWebhookResponse {
    message: string;
    endpoint: string;
    timestamp: string;
    statusCode: number;
}

export default interface IProcessWebhookUseCase {
    execute(request: ProcessWebhookRequest): Promise<ProcessWebhookResponse>;
}

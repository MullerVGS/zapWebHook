import { WebhookRequest } from '@models/WebhookRequest';
import IWebhookEndpointRepository from '@repositories/webhookEndpoint/IWebhookEndpointRepository';
import IWebhookRequestRepository from '@repositories/webhookRequest/IWebhookRequestRepository';
import UseCaseError from '@errors/UseCaseError';
import TYPES from '@types';
import Pino from '@util/Pino';
import { inject, injectable } from 'inversify';
import IProcessWebhookUseCase, { ProcessWebhookRequest, ProcessWebhookResponse } from './IProcessWebhookUseCase';

@injectable()
export default class ProcessWebhookUseCase implements IProcessWebhookUseCase {

    constructor(
        @inject(TYPES.WebhookEndpointRepository)
        private readonly webhookEndpointRepository: IWebhookEndpointRepository,
        @inject(TYPES.WebhookRequestRepository)
        private readonly webhookRequestRepository: IWebhookRequestRepository
    ) {}

    public async execute(request: ProcessWebhookRequest): Promise<ProcessWebhookResponse> {
        let webhookRequest: WebhookRequest;
        let responseStatus = 200;
        let responseMessage = 'Webhook received successfully';
        let endpointName = 'unknown';

        try {
            // Find the endpoint configuration
            const endpoint = await this.webhookEndpointRepository.findActiveByPath(request.endpointPath);
            
            // Create webhook request record immediately (always save all requests)
            webhookRequest = new WebhookRequest();
            webhookRequest.endpoint_id = endpoint?.id || null;
            webhookRequest.method = request.method;
            webhookRequest.url = request.url;
            webhookRequest.headers = request.headers;
            webhookRequest.query_params = request.queryParams;
            webhookRequest.body = request.body;
            webhookRequest.content_type = request.contentType;
            webhookRequest.ip_address = request.ipAddress;
            webhookRequest.user_agent = request.userAgent;

            if (!endpoint) {
                responseStatus = 404;
                responseMessage = "Endpoint de webhook não encontrado ou inativo";
            } else {
                endpointName = endpoint.name;

                // Check TLS requirement
                if (endpoint.require_tls && request.headers['x-forwarded-proto'] !== 'https' && !request.headers['x-forwarded-ssl']) {
                    responseStatus = 400;
                    responseMessage = "HTTPS é obrigatório para este endpoint";
                }

                // Check authentication
                if (responseStatus === 200 && endpoint.require_auth) {
                    const authHeader = request.headers.authorization || request.headers['x-auth-token'];
                    if (!authHeader || authHeader !== endpoint.auth_token) {
                        responseStatus = 401;
                        responseMessage = "Token de autenticação inválido";
                    }
                }
            }

            // Prepare response data
            const responseHeaders = { 'Content-Type': 'application/json' };
            const responseBody = JSON.stringify({
                message: responseMessage,
                endpoint: endpointName,
                timestamp: new Date().toISOString()
            });

            // Update webhook request with response information
            webhookRequest.response_status = responseStatus;
            webhookRequest.response_headers = responseHeaders;
            webhookRequest.response_body = responseBody;

            // Save the webhook request with response
            await this.webhookRequestRepository.save(webhookRequest);

            // Return response (always return, never throw)
            return {
                message: responseMessage,
                endpoint: endpointName,
                timestamp: new Date().toISOString(),
                statusCode: responseStatus
            };

        } catch (error: any) {
            Pino.error(`[ProcessWebhookUseCase] Error processing webhook: ${error.message}`);
            
            // Even if there's an error, try to save the request with error response
            try {
                if (webhookRequest) {
                    webhookRequest.response_status = 500;
                    webhookRequest.response_headers = { 'Content-Type': 'application/json' };
                    webhookRequest.response_body = JSON.stringify({
                        message: "Erro interno do servidor",
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    await this.webhookRequestRepository.save(webhookRequest);
                }
            } catch (saveError) {
                Pino.error(`[ProcessWebhookUseCase] Failed to save error response: ${saveError.message}`);
            }
            
            return {
                message: "Erro interno do servidor",
                endpoint: endpointName,
                timestamp: new Date().toISOString(),
                statusCode: 500
            };
        }
    }
}

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
        try {
            // Find the endpoint configuration
            const endpoint = await this.webhookEndpointRepository.findActiveByPath(request.endpointPath);
            
            if (!endpoint) {
                throw new UseCaseError({
                    title: "Endpoint não encontrado",
                    message: "Endpoint de webhook não encontrado ou inativo",
                    statusCode: 404
                });
            }

            // Check TLS requirement
            if (endpoint.require_tls && request.headers['x-forwarded-proto'] !== 'https' && !request.headers['x-forwarded-ssl']) {
                throw new UseCaseError({
                    title: "HTTPS obrigatório",
                    message: "HTTPS é obrigatório para este endpoint",
                    statusCode: 400
                });
            }

            // Check authentication
            if (endpoint.require_auth) {
                const authHeader = request.headers.authorization || request.headers['x-auth-token'];
                if (!authHeader || authHeader !== endpoint.auth_token) {
                    throw new UseCaseError({
                        title: "Autenticação inválida",
                        message: "Token de autenticação inválido",
                        statusCode: 401
                    });
                }
            }

            // Create webhook request record
            const webhookRequest = new WebhookRequest();
            webhookRequest.endpoint_id = endpoint.id;
            webhookRequest.method = request.method;
            webhookRequest.url = request.url;
            webhookRequest.headers = request.headers;
            webhookRequest.query_params = request.queryParams;
            webhookRequest.body = request.body;
            webhookRequest.content_type = request.contentType;
            webhookRequest.ip_address = request.ipAddress;
            webhookRequest.user_agent = request.userAgent;

            // Save the webhook request
            await this.webhookRequestRepository.save(webhookRequest);

            return {
                message: 'Webhook received successfully',
                endpoint: endpoint.name,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            Pino.error(`[ProcessWebhookUseCase] Error processing webhook: ${error.message}`);
            
            if (error instanceof UseCaseError) {
                throw error;
            }
            
            throw new UseCaseError({
                title: "Erro ao processar webhook",
                message: "Não foi possível processar a requisição do webhook",
                cause: error
            });
        }
    }
}

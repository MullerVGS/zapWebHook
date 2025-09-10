import { WebhookEndpoint } from '@models/WebhookEndpoint';
import IWebhookEndpointRepository from '@repositories/webhookEndpoint/IWebhookEndpointRepository';
import UseCaseError from '@errors/UseCaseError';
import TYPES from '@types';
import Pino from '@util/Pino';
import { inject, injectable } from 'inversify';
import ICreateEndpointUseCase, { CreateEndpointRequest, CreateEndpointResponse } from './ICreateEndpointUseCase';

@injectable()
export default class CreateEndpointUseCase implements ICreateEndpointUseCase {

    constructor(
        @inject(TYPES.WebhookEndpointRepository)
        private readonly webhookEndpointRepository: IWebhookEndpointRepository
    ) {}

    public async execute(request: CreateEndpointRequest): Promise<CreateEndpointResponse> {
        try {
            // Validate input parameters
            if (!request.name) {
                throw new UseCaseError({
                    title: "Parâmetros inválidos",
                    message: "O nome do endpoint é obrigatório"
                });
            }

            if (!request.endpoint_path) {
                throw new UseCaseError({
                    title: "Parâmetros inválidos",
                    message: "O caminho do endpoint é obrigatório"
                });
            }

            // Validate endpoint path format
            if (!request.endpoint_path.startsWith('/webhook/')) {
                throw new UseCaseError({
                    title: "Parâmetros inválidos",
                    message: "O caminho do endpoint deve começar com '/webhook/'"
                });
            }

            // Check if endpoint path already exists
            const existingEndpoint = await this.webhookEndpointRepository.findByPath(request.endpoint_path);
            if (existingEndpoint) {
                throw new UseCaseError({
                    title: "Endpoint já existe",
                    message: "Já existe um endpoint com este caminho"
                });
            }

            // Validate auth requirements
            if (request.require_auth && !request.auth_token) {
                throw new UseCaseError({
                    title: "Parâmetros inválidos",
                    message: "Token de autenticação é obrigatório quando autenticação é requerida"
                });
            }

            // Create new endpoint
            const endpoint = new WebhookEndpoint();
            endpoint.name = request.name;
            endpoint.endpoint_path = request.endpoint_path;
            endpoint.description = request.description;
            endpoint.require_tls = request.require_tls || false;
            endpoint.require_auth = request.require_auth || false;
            endpoint.auth_token = request.auth_token;
            endpoint.is_active = true;

            const savedEndpoint = await this.webhookEndpointRepository.save(endpoint);

            return {
                id: savedEndpoint.id,
                name: savedEndpoint.name,
                endpoint_path: savedEndpoint.endpoint_path,
                description: savedEndpoint.description,
                require_tls: savedEndpoint.require_tls,
                require_auth: savedEndpoint.require_auth,
                auth_token: savedEndpoint.auth_token,
                is_active: savedEndpoint.is_active,
                created_at: savedEndpoint.created_at,
                updated_at: savedEndpoint.updated_at
            };

        } catch (error) {
            Pino.error(`[CreateEndpointUseCase] Error creating endpoint: ${error.message}`);
            
            if (error instanceof UseCaseError) {
                throw error;
            }
            
            throw new UseCaseError({
                title: "Erro ao criar endpoint",
                message: "Não foi possível criar o endpoint de webhook",
                cause: error
            });
        }
    }
}

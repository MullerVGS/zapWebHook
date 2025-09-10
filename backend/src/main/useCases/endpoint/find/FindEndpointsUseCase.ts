import IWebhookEndpointRepository from '@repositories/webhookEndpoint/IWebhookEndpointRepository';
import UseCaseError from '@errors/UseCaseError';
import TYPES from '@types';
import Pino from '@util/Pino';
import { inject, injectable } from 'inversify';
import IFindEndpointsUseCase, { FindEndpointsRequest, FindEndpointsResponse } from './IFindEndpointsUseCase';

@injectable()
export default class FindEndpointsUseCase implements IFindEndpointsUseCase {

    constructor(
        @inject(TYPES.WebhookEndpointRepository)
        private readonly webhookEndpointRepository: IWebhookEndpointRepository
    ) {}

    public async execute(request?: FindEndpointsRequest): Promise<FindEndpointsResponse[]> {
        try {
            const endpoints = await this.webhookEndpointRepository.findAll();

            return endpoints.map(endpoint => ({
                id: endpoint.id,
                name: endpoint.name,
                endpoint_path: endpoint.endpoint_path,
                description: endpoint.description,
                require_tls: endpoint.require_tls,
                require_auth: endpoint.require_auth,
                is_active: endpoint.is_active,
                created_at: endpoint.created_at,
                updated_at: endpoint.updated_at
            }));

        } catch (error) {
            Pino.error(`[FindEndpointsUseCase] Error finding endpoints: ${error.message}`);
            
            if (error instanceof UseCaseError) {
                throw error;
            }
            
            throw new UseCaseError({
                title: "Erro ao buscar endpoints",
                message: "Não foi possível buscar os endpoints de webhook",
                cause: error
            });
        }
    }
}

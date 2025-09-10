import IWebhookRequestRepository from '@repositories/webhookRequest/IWebhookRequestRepository';
import UseCaseError from '@errors/UseCaseError';
import TYPES from '@types';
import Pino from '@util/Pino';
import { inject, injectable } from 'inversify';
import IFindWebhookRequestsUseCase, { FindWebhookRequestsRequest, FindWebhookRequestsResponse } from './IFindWebhookRequestsUseCase';

@injectable()
export default class FindWebhookRequestsUseCase implements IFindWebhookRequestsUseCase {

    constructor(
        @inject(TYPES.WebhookRequestRepository)
        private readonly webhookRequestRepository: IWebhookRequestRepository
    ) {}

    public async execute(request?: FindWebhookRequestsRequest): Promise<FindWebhookRequestsResponse[]> {
        try {
            const { endpointId, limit = 50, offset = 0 } = request || {};

            let requests;
            if (endpointId) {
                requests = await this.webhookRequestRepository.findByEndpointId(endpointId, limit, offset);
            } else {
                requests = await this.webhookRequestRepository.findAll({ limit, offset });
            }

            return requests.map(req => ({
                id: req.id,
                endpoint_id: req.endpoint_id,
                method: req.method,
                url: req.url,
                headers: req.headers,
                query_params: req.query_params,
                body: req.body,
                content_type: req.content_type,
                ip_address: req.ip_address,
                user_agent: req.user_agent,
                received_at: req.received_at,
                endpoint_name: req.endpoint?.name,
                endpoint_path: req.endpoint?.endpoint_path
            }));

        } catch (error) {
            Pino.error(`[FindWebhookRequestsUseCase] Error finding webhook requests: ${error.message}`);
            
            if (error instanceof UseCaseError) {
                throw error;
            }
            
            throw new UseCaseError({
                title: "Erro ao buscar requisições",
                message: "Não foi possível buscar as requisições de webhook",
                cause: error
            });
        }
    }
}

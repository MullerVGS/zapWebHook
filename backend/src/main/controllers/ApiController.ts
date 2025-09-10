import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import TYPES from '@types';
import ICreateEndpointUseCase from '@useCases/endpoint/create/ICreateEndpointUseCase';
import IFindEndpointsUseCase from '@useCases/endpoint/find/IFindEndpointsUseCase';
import IFindWebhookRequestsUseCase from '@useCases/webhook/find/IFindWebhookRequestsUseCase';

@controller('/api')
export class ApiController {

    constructor(
        @inject(TYPES.CreateEndpointUseCase)
        private readonly createEndpointUseCase: ICreateEndpointUseCase,
        @inject(TYPES.FindEndpointsUseCase)
        private readonly findEndpointsUseCase: IFindEndpointsUseCase,
        @inject(TYPES.FindWebhookRequestsUseCase)
        private readonly findWebhookRequestsUseCase: IFindWebhookRequestsUseCase
    ) {}

    @httpGet('/endpoints')
    public async getEndpoints(req: Request, res: Response): Promise<Response> {
        try {
            const endpoints = await this.findEndpointsUseCase.execute();
            return res.status(200).json(endpoints);
        } catch (error) {
            throw error;
        }
    }

    @httpPost('/endpoints')
    public async createEndpoint(req: Request, res: Response): Promise<Response> {
        try {
            const { name, endpoint_path, description, require_tls, require_auth, auth_token } = req.body;
            
            const endpoint = await this.createEndpointUseCase.execute({
                name,
                endpoint_path,
                description,
                require_tls,
                require_auth,
                auth_token
            });
            
            return res.status(201).json(endpoint);
        } catch (error) {
            throw error;
        }
    }

    @httpGet('/endpoints/:id/requests')
    public async getEndpointRequests(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { limit, offset } = req.query;
            
            const requests = await this.findWebhookRequestsUseCase.execute({
                endpointId: id,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined
            });
            
            return res.status(200).json(requests);
        } catch (error) {
            throw error;
        }
    }

    @httpGet('/requests')
    public async getAllRequests(req: Request, res: Response): Promise<Response> {
        try {
            const { limit, offset } = req.query;
            
            const requests = await this.findWebhookRequestsUseCase.execute({
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined
            });
            
            return res.status(200).json(requests);
        } catch (error) {
            throw error;
        }
    }

    @httpGet('/requests/:id')
    public async getRequest(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            
            const requests = await this.findWebhookRequestsUseCase.execute();
            const request = requests.find(r => r.id === id);
            
            if (!request) {
                return res.status(404).json({ error: 'Request not found' });
            }
            
            return res.status(200).json(request);
        } catch (error) {
            throw error;
        }
    }
}

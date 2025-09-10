import { WebhookRequest } from '@models/WebhookRequest';
import { injectable } from 'inversify';
import { Repository } from 'typeorm';
import Database from '@database/Database';
import IWebhookRequestRepository, { FindRequestsOptions } from './IWebhookRequestRepository';
import RepositoryError from '@errors/RepositoryError';
import Pino from '@util/Pino';

@injectable()
export default class WebhookRequestRepository implements IWebhookRequestRepository {
    private ormRepository: Repository<WebhookRequest>;

    constructor() {
        this.ormRepository = Database.getDataSource().getRepository(WebhookRequest);
    }

    public async findAll(options: FindRequestsOptions = {}): Promise<WebhookRequest[]> {
        try {
            const { limit = 50, offset = 0 } = options;
            
            return await this.ormRepository.find({
                relations: ['endpoint'],
                order: { received_at: 'DESC' },
                take: limit,
                skip: offset
            });
        } catch (error) {
            Pino.error(`[WebhookRequestRepository] Error finding all requests: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar requisições',
                message: 'Não foi possível buscar as requisições de webhook',
                cause: error
            });
        }
    }

    public async findById(id: string): Promise<WebhookRequest | null> {
        try {
            return await this.ormRepository.findOne({
                where: { id },
                relations: ['endpoint']
            });
        } catch (error) {
            Pino.error(`[WebhookRequestRepository] Error finding request by id ${id}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar requisição',
                message: 'Não foi possível buscar a requisição de webhook',
                cause: error
            });
        }
    }

    public async findByEndpointId(endpointId: string, limit: number = 50, offset: number = 0): Promise<WebhookRequest[]> {
        try {
            return await this.ormRepository.find({
                where: { endpoint_id: endpointId },
                relations: ['endpoint'],
                order: { received_at: 'DESC' },
                take: limit,
                skip: offset
            });
        } catch (error) {
            Pino.error(`[WebhookRequestRepository] Error finding requests by endpoint ${endpointId}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar requisições do endpoint',
                message: 'Não foi possível buscar as requisições do endpoint de webhook',
                cause: error
            });
        }
    }

    public async save(request: WebhookRequest): Promise<WebhookRequest> {
        try {
            return await this.ormRepository.save(request);
        } catch (error) {
            Pino.error(`[WebhookRequestRepository] Error saving request: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao salvar requisição',
                message: 'Não foi possível salvar a requisição de webhook',
                cause: error
            });
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const result = await this.ormRepository.delete(id);
            return result.affected > 0;
        } catch (error) {
            Pino.error(`[WebhookRequestRepository] Error deleting request ${id}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao deletar requisição',
                message: 'Não foi possível deletar a requisição de webhook',
                cause: error
            });
        }
    }
}

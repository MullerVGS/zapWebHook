import { WebhookEndpoint } from '@models/WebhookEndpoint';
import { injectable } from 'inversify';
import { Repository } from 'typeorm';
import Database from '@database/Database';
import IWebhookEndpointRepository from './IWebhookEndpointRepository';
import RepositoryError from '@errors/RepositoryError';
import Pino from '@util/Pino';

@injectable()
export default class WebhookEndpointRepository implements IWebhookEndpointRepository {
    private ormRepository: Repository<WebhookEndpoint>;

    constructor() {
        this.ormRepository = Database.getDataSource().getRepository(WebhookEndpoint);
    }

    public async findAll(): Promise<WebhookEndpoint[]> {
        try {
            return await this.ormRepository.find({
                order: { created_at: 'DESC' }
            });
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error finding all endpoints: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar endpoints',
                message: 'Não foi possível buscar os endpoints de webhook',
                cause: error
            });
        }
    }

    public async findById(id: string): Promise<WebhookEndpoint | null> {
        try {
            return await this.ormRepository.findOne({
                where: { id }
            });
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error finding endpoint by id ${id}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar endpoint',
                message: 'Não foi possível buscar o endpoint de webhook',
                cause: error
            });
        }
    }

    public async findByPath(path: string): Promise<WebhookEndpoint | null> {
        try {
            return await this.ormRepository.findOne({
                where: { endpoint_path: path }
            });
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error finding endpoint by path ${path}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar endpoint',
                message: 'Não foi possível buscar o endpoint de webhook pelo caminho',
                cause: error
            });
        }
    }

    public async findActiveByPath(path: string): Promise<WebhookEndpoint | null> {
        try {
            return await this.ormRepository.findOne({
                where: { 
                    endpoint_path: path,
                    is_active: true
                }
            });
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error finding active endpoint by path ${path}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao buscar endpoint ativo',
                message: 'Não foi possível buscar o endpoint de webhook ativo',
                cause: error
            });
        }
    }

    public async save(endpoint: WebhookEndpoint): Promise<WebhookEndpoint> {
        try {
            return await this.ormRepository.save(endpoint);
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error saving endpoint: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao salvar endpoint',
                message: 'Não foi possível salvar o endpoint de webhook',
                cause: error
            });
        }
    }

    public async update(id: string, endpointData: Partial<WebhookEndpoint>): Promise<WebhookEndpoint | null> {
        try {
            const result = await this.ormRepository.update(id, endpointData);
            if (result.affected === 0) {
                return null;
            }
            return await this.findById(id);
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error updating endpoint ${id}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao atualizar endpoint',
                message: 'Não foi possível atualizar o endpoint de webhook',
                cause: error
            });
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const result = await this.ormRepository.delete(id);
            return result.affected > 0;
        } catch (error) {
            Pino.error(`[WebhookEndpointRepository] Error deleting endpoint ${id}: ${error.message}`);
            throw new RepositoryError({
                title: 'Erro ao deletar endpoint',
                message: 'Não foi possível deletar o endpoint de webhook',
                cause: error
            });
        }
    }
}

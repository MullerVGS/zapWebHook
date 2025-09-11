import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import TYPES from '@types';
import IProcessWebhookUseCase from '@useCases/webhook/create/IProcessWebhookUseCase';

@controller('/webhook')
export class WebhookController {

    constructor(
        @inject(TYPES.ProcessWebhookUseCase)
        private readonly processWebhookUseCase: IProcessWebhookUseCase
    ) {}

    // Helper function to get client IP
    private getClientIP(req: Request): string {
        return (req.headers['x-forwarded-for'] as string) || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               'unknown';
    }

    private async processWebhook(req: Request, res: Response): Promise<Response> {
        const endpointPath = req.path;
        
        // Process the webhook request (never throws, always returns response)
        const result = await this.processWebhookUseCase.execute({
            endpointPath: `/webhook${endpointPath}`,
            method: req.method,
            url: req.originalUrl,
            headers: req.headers as Record<string, any>,
            queryParams: req.query as Record<string, any>,
            body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined,
            contentType: req.headers['content-type'],
            ipAddress: this.getClientIP(req),
            userAgent: req.headers['user-agent']
        });
        
        // Return response with the appropriate status code
        return res.status(result.statusCode).json({
            message: result.message,
            endpoint: result.endpoint,
            timestamp: result.timestamp
        });
    }

    @httpGet('/*')
    public async handleGetWebhook(req: Request, res: Response): Promise<Response> {
        return this.processWebhook(req, res);
    }

    @httpPost('/*')
    public async handlePostWebhook(req: Request, res: Response): Promise<Response> {
        return this.processWebhook(req, res);
    }

    @httpPut('/*')
    public async handlePutWebhook(req: Request, res: Response): Promise<Response> {
        return this.processWebhook(req, res);
    }

    @httpDelete('/*')
    public async handleDeleteWebhook(req: Request, res: Response): Promise<Response> {
        return this.processWebhook(req, res);
    }

    @httpPatch('/*')
    public async handlePatchWebhook(req: Request, res: Response): Promise<Response> {
        return this.processWebhook(req, res);
    }
}

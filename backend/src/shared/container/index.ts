import { AsyncContainerModule } from 'inversify';
import TYPES from './types';

// Services
import CertificateValidationService from '@services/CertificateValidationService';

// Repositories
import IWebhookEndpointRepository from '@repositories/webhookEndpoint/IWebhookEndpointRepository';
import WebhookEndpointRepository from '@repositories/webhookEndpoint/WebhookEndpointRepository';
import IWebhookRequestRepository from '@repositories/webhookRequest/IWebhookRequestRepository';
import WebhookRequestRepository from '@repositories/webhookRequest/WebhookRequestRepository';

// Use Cases - Endpoint
import ICreateEndpointUseCase from '@useCases/endpoint/create/ICreateEndpointUseCase';
import CreateEndpointUseCase from '@useCases/endpoint/create/CreateEndpointUseCase';
import IFindEndpointsUseCase from '@useCases/endpoint/find/IFindEndpointsUseCase';
import FindEndpointsUseCase from '@useCases/endpoint/find/FindEndpointsUseCase';

// Use Cases - Webhook
import IProcessWebhookUseCase from '@useCases/webhook/create/IProcessWebhookUseCase';
import ProcessWebhookUseCase from '@useCases/webhook/create/ProcessWebhookUseCase';
import IFindWebhookRequestsUseCase from '@useCases/webhook/find/IFindWebhookRequestsUseCase';
import FindWebhookRequestsUseCase from '@useCases/webhook/find/FindWebhookRequestsUseCase';

export const bindings = new AsyncContainerModule(async (bind) => {
    // Services
    bind<CertificateValidationService>(TYPES.CertificateValidationService).to(CertificateValidationService);
    
    // Repositories
    bind<IWebhookEndpointRepository>(TYPES.WebhookEndpointRepository).to(WebhookEndpointRepository);
    bind<IWebhookRequestRepository>(TYPES.WebhookRequestRepository).to(WebhookRequestRepository);
    
    // Use Cases - Endpoint
    bind<ICreateEndpointUseCase>(TYPES.CreateEndpointUseCase).to(CreateEndpointUseCase);
    bind<IFindEndpointsUseCase>(TYPES.FindEndpointsUseCase).to(FindEndpointsUseCase);
    
    // Use Cases - Webhook
    bind<IProcessWebhookUseCase>(TYPES.ProcessWebhookUseCase).to(ProcessWebhookUseCase);
    bind<IFindWebhookRequestsUseCase>(TYPES.FindWebhookRequestsUseCase).to(FindWebhookRequestsUseCase);
    
    // Note: Controllers are automatically registered by inversify-express-utils
});

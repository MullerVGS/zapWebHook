const TYPES = {
    // Repositories
    WebhookEndpointRepository: Symbol.for('WebhookEndpointRepository'),
    WebhookRequestRepository: Symbol.for('WebhookRequestRepository'),
    
    // Services
    CertificateValidationService: Symbol.for('CertificateValidationService'),
    
    // Use Cases - Endpoint
    CreateEndpointUseCase: Symbol.for('CreateEndpointUseCase'),
    FindEndpointsUseCase: Symbol.for('FindEndpointsUseCase'),
    
    // Use Cases - Webhook
    ProcessWebhookUseCase: Symbol.for('ProcessWebhookUseCase'),
    FindWebhookRequestsUseCase: Symbol.for('FindWebhookRequestsUseCase')
};

export default TYPES;

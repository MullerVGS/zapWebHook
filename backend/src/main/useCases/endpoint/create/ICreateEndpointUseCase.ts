export interface CreateEndpointRequest {
    name: string;
    endpoint_path: string;
    description?: string;
    require_tls?: boolean;
    require_auth?: boolean;
    auth_token?: string;
}

export interface CreateEndpointResponse {
    id: string;
    name: string;
    endpoint_path: string;
    description?: string;
    require_tls: boolean;
    require_auth: boolean;
    auth_token?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export default interface ICreateEndpointUseCase {
    execute(request: CreateEndpointRequest): Promise<CreateEndpointResponse>;
}

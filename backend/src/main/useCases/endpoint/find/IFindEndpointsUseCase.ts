export interface FindEndpointsRequest {
    // Empty for now, can be extended with filters later
}

export interface FindEndpointsResponse {
    id: string;
    name: string;
    endpoint_path: string;
    description?: string;
    require_tls: boolean;
    require_auth: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export default interface IFindEndpointsUseCase {
    execute(request?: FindEndpointsRequest): Promise<FindEndpointsResponse[]>;
}

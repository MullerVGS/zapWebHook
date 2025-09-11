import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WebhookEndpoint } from './WebhookEndpoint';

@Entity('webhook_requests')
export class WebhookRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    endpoint_id: string;

    @Column({ type: 'varchar', length: 10 })
    method: string;

    @Column({ type: 'text' })
    url: string;

    @Column({ type: 'jsonb' })
    headers: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    query_params?: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    body?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    content_type?: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    ip_address?: string;

    @Column({ type: 'text', nullable: true })
    user_agent?: string;

    @Column({ type: 'int', nullable: true })
    response_status?: number;

    @Column({ type: 'jsonb', nullable: true })
    response_headers?: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    response_body?: string;

    @CreateDateColumn()
    received_at: Date;

    @ManyToOne(() => WebhookEndpoint, endpoint => endpoint.requests)
    @JoinColumn({ name: 'endpoint_id' })
    endpoint: WebhookEndpoint;
}

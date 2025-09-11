import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WebhookRequest } from './WebhookRequest';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 500, unique: true })
    endpoint_path: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: false })
    require_tls: boolean;

    @Column({ type: 'boolean', default: false })
    require_auth: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    auth_token?: string;

    @Column({ type: 'boolean', default: false })
    require_certificate: boolean;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => WebhookRequest, request => request.endpoint)
    requests: WebhookRequest[];
}

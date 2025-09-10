-- Create database tables for webhook catcher

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    endpoint_path VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    require_tls BOOLEAN DEFAULT false,
    require_auth BOOLEAN DEFAULT false,
    auth_token VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB,
    query_params JSONB,
    body TEXT,
    content_type VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_requests_endpoint_id ON webhook_requests(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_requests_received_at ON webhook_requests(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_path ON webhook_endpoints(endpoint_path);

-- Insert some default webhook endpoints
INSERT INTO webhook_endpoints (name, endpoint_path, description, require_tls, require_auth) VALUES
('Default Webhook', '/webhook/default', 'Default webhook endpoint for testing', false, false),
('Secure Webhook', '/webhook/secure', 'Secure webhook with TLS requirement', true, false),
ON CONFLICT (endpoint_path) DO NOTHING;

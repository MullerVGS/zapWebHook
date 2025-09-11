-- Migration to add require_certificate column to webhook_endpoints table
-- Run this if you have an existing database

-- Add the require_certificate column
ALTER TABLE webhook_endpoints 
ADD COLUMN IF NOT EXISTS require_certificate BOOLEAN DEFAULT false;

-- Update existing secure webhook to also require certificate
UPDATE webhook_endpoints 
SET require_certificate = true 
WHERE endpoint_path = '/webhook/secure';

-- Add a new endpoint that requires certificate validation
INSERT INTO webhook_endpoints (name, endpoint_path, description, require_tls, require_auth, require_certificate) VALUES
('Certificate Webhook', '/webhook/certificate', 'Webhook endpoint that requires client certificate validation', true, false, true)
ON CONFLICT (endpoint_path) DO NOTHING;

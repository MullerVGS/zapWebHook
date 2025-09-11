-- Migration to add response tracking fields to webhook_requests table
-- This allows storing the response status, headers, and body for each webhook request

-- Add response tracking columns
ALTER TABLE webhook_requests 
ADD COLUMN IF NOT EXISTS response_status INTEGER,
ADD COLUMN IF NOT EXISTS response_headers JSONB,
ADD COLUMN IF NOT EXISTS response_body TEXT;

-- Create index for response status for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_webhook_requests_response_status ON webhook_requests(response_status);

-- Add comment to document the new columns
COMMENT ON COLUMN webhook_requests.response_status IS 'HTTP status code returned to the client (200, 404, 401, etc.)';
COMMENT ON COLUMN webhook_requests.response_headers IS 'Response headers sent back to the client';
COMMENT ON COLUMN webhook_requests.response_body IS 'Response body content sent back to the client';

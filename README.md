# Webhook Catcher

A comprehensive webhook development tool similar to webhook.site for capturing, analyzing, and managing webhook requests.

## Features

- 🎯 **Multiple Webhook Endpoints** - Create custom endpoints with different configurations
- 🔒 **Configurable Security** - TLS requirements and authentication tokens
- 📊 **Real-time Dashboard** - Monitor webhook activity and system health
- 🔍 **Detailed Request Analysis** - View headers, body, query parameters, and metadata
- 💾 **PostgreSQL Storage** - Persistent storage of all webhook requests
- 🐳 **Docker Ready** - Complete containerized setup
- 🎨 **Modern UI** - Clean, responsive React frontend

## Quick Start

1. **Clone and start the application:**
   ```bash
   cd /root/projetos/zapWebHook
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432

3. **Send a test webhook:**
   ```bash
   curl -X POST http://localhost:3001/webhook/default \
     -H "Content-Type: application/json" \
     -d '{"test": "Hello World!", "timestamp": "'$(date -Iseconds)'"}'
   ```

## Architecture

### Backend (Node.js + Express)
- RESTful API for managing endpoints and viewing requests
- Universal webhook handler for all incoming requests
- PostgreSQL integration with connection pooling
- Configurable security (TLS, authentication)
- Request logging and metadata capture

### Frontend (React)
- Dashboard with real-time statistics
- Endpoint management interface
- Request listing with auto-refresh
- Detailed request viewer with JSON formatting
- Copy-to-clipboard functionality

### Database (PostgreSQL)
- `webhook_endpoints` - Endpoint configurations
- `webhook_requests` - Captured webhook data
- Optimized indexes for performance

## API Endpoints

### Management API
- `GET /api/endpoints` - List all webhook endpoints
- `POST /api/endpoints` - Create new endpoint
- `PUT /api/endpoints/:id` - Update endpoint
- `DELETE /api/endpoints/:id` - Delete endpoint
- `GET /api/requests` - List all webhook requests
- `GET /api/requests/:id` - Get specific request details

### Webhook Endpoints
- `ALL /webhook/*` - Universal webhook handler

## Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=webhook_catcher
DB_USER=webhook_user
DB_PASSWORD=webhook_pass
```

### Endpoint Security Options
- **TLS Requirement**: Force HTTPS for specific endpoints
- **Authentication**: Require auth tokens via headers
- **Active/Inactive**: Enable/disable endpoints

## Development

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Docker Development
```bash
docker-compose up --build
```

## Default Endpoints

The application comes with pre-configured endpoints:

1. **Default Webhook** (`/webhook/default`) - Open access
2. **Secure Webhook** (`/webhook/secure`) - Requires HTTPS
3. **Authenticated Webhook** (`/webhook/auth`) - Requires auth token
4. **Payment Webhook** (`/webhook/payment`) - Requires both HTTPS and auth

## Testing

Send requests to test different scenarios:

```bash
# Basic request
curl -X POST http://localhost:3001/webhook/default \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"key": "value"}}'

# With authentication
curl -X POST http://localhost:3001/webhook/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: secret-token-123" \
  -d '{"authenticated": true}'

# Different methods
curl -X GET http://localhost:3001/webhook/default?param1=value1&param2=value2
curl -X PUT http://localhost:3001/webhook/default -d "raw text data"
curl -X DELETE http://localhost:3001/webhook/default
```

## Monitoring

- View real-time requests in the web interface
- Auto-refresh every 5 seconds
- Export request data as JSON
- Copy request details to clipboard

## Security Notes

- Use strong authentication tokens for production
- Enable TLS requirements for sensitive endpoints
- Monitor request patterns for anomalies
- Regularly clean old request data if needed

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'webhook_catcher',
  user: process.env.DB_USER || 'webhook_user',
  password: process.env.DB_PASSWORD || 'webhook_pass',
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.raw({ type: '*/*', limit: '10mb' }));

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// API Routes

// Get all webhook endpoints
app.get('/api/endpoints', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM webhook_endpoints ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new webhook endpoint
app.post('/api/endpoints', async (req, res) => {
  try {
    const { name, endpoint_path, description, require_tls, require_auth, auth_token } = req.body;
    
    const result = await pool.query(
      'INSERT INTO webhook_endpoints (name, endpoint_path, description, require_tls, require_auth, auth_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, endpoint_path, description, require_tls, require_auth, auth_token]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating endpoint:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Endpoint path already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update webhook endpoint
app.put('/api/endpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, require_tls, require_auth, auth_token, is_active } = req.body;
    
    const result = await pool.query(
      'UPDATE webhook_endpoints SET name = $1, description = $2, require_tls = $3, require_auth = $4, auth_token = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, description, require_tls, require_auth, auth_token, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete webhook endpoint
app.delete('/api/endpoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM webhook_endpoints WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    
    res.json({ message: 'Endpoint deleted successfully' });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get webhook requests for an endpoint
app.get('/api/endpoints/:id/requests', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM webhook_requests WHERE endpoint_id = $1 ORDER BY received_at DESC LIMIT $2 OFFSET $3',
      [id, limit, offset]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all webhook requests
app.get('/api/requests', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT wr.*, we.name as endpoint_name, we.endpoint_path 
      FROM webhook_requests wr 
      JOIN webhook_endpoints we ON wr.endpoint_id = we.id 
      ORDER BY wr.received_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single webhook request
app.get('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT wr.*, we.name as endpoint_name, we.endpoint_path 
      FROM webhook_requests wr 
      JOIN webhook_endpoints we ON wr.endpoint_id = we.id 
      WHERE wr.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Universal webhook handler
app.all('/webhook/*', async (req, res) => {
  try {
    const endpointPath = req.path;
    
    // Find the endpoint configuration
    const endpointResult = await pool.query(
      'SELECT * FROM webhook_endpoints WHERE endpoint_path = $1 AND is_active = true',
      [endpointPath]
    );
    
    if (endpointResult.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook endpoint not found' });
    }
    
    const endpoint = endpointResult.rows[0];
    
    // Check TLS requirement
    if (endpoint.require_tls && req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
      return res.status(400).json({ error: 'HTTPS required for this endpoint' });
    }
    
    // Check authentication
    if (endpoint.require_auth) {
      const authHeader = req.headers.authorization || req.headers['x-auth-token'];
      if (!authHeader || authHeader !== endpoint.auth_token) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
    }
    
    // Store the webhook request
    const requestData = {
      endpoint_id: endpoint.id,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      query_params: req.query,
      body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
      content_type: req.headers['content-type'] || null,
      ip_address: getClientIP(req),
      user_agent: req.headers['user-agent'] || null
    };
    
    await pool.query(
      'INSERT INTO webhook_requests (endpoint_id, method, url, headers, query_params, body, content_type, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        requestData.endpoint_id,
        requestData.method,
        requestData.url,
        JSON.stringify(requestData.headers),
        JSON.stringify(requestData.query_params),
        requestData.body,
        requestData.content_type,
        requestData.ip_address,
        requestData.user_agent
      ]
    );
    
    // Return success response
    res.status(200).json({
      message: 'Webhook received successfully',
      endpoint: endpoint.name,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook catcher backend running on port ${PORT}`);
});

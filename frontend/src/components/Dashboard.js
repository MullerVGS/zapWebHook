import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { endpointsAPI, requestsAPI, healthAPI } from '../services/api';
import { Activity, Globe, Shield, Clock, Eye } from 'lucide-react';
import moment from 'moment';

function Dashboard() {
  const [stats, setStats] = useState({
    totalEndpoints: 0,
    activeEndpoints: 0,
    totalRequests: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    loadDashboardData();
    checkHealth();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load endpoints
      const endpointsResponse = await endpointsAPI.getAll();
      const endpoints = endpointsResponse.data;
      
      // Load recent requests
      const requestsResponse = await requestsAPI.getAll({ limit: 10 });
      const requests = requestsResponse.data;
      
      setStats({
        totalEndpoints: endpoints.length,
        activeEndpoints: endpoints.filter(e => e.is_active).length,
        totalRequests: requests.length,
        recentRequests: requests.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      await healthAPI.check();
      setHealthStatus('healthy');
    } catch (error) {
      setHealthStatus('error');
    }
  };

  const getMethodBadgeClass = (method) => {
    const classes = {
      'GET': 'method-get',
      'POST': 'method-post',
      'PUT': 'method-put',
      'DELETE': 'method-delete'
    };
    return `method-badge ${classes[method] || 'method-get'}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="flex flex-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Endpoints</h3>
              <p className="text-2xl font-bold">{stats.totalEndpoints}</p>
            </div>
            <Globe className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex flex-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Active Endpoints</h3>
              <p className="text-2xl font-bold">{stats.activeEndpoints}</p>
            </div>
            <Activity className="text-green-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex flex-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">Total Requests</h3>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
            <Shield className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex flex-between">
            <div>
              <h3 className="text-gray-600 text-sm font-medium">System Status</h3>
              <p className={`text-2xl font-bold ${healthStatus === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {healthStatus === 'healthy' ? 'Healthy' : 'Error'}
              </p>
            </div>
            <Clock className={healthStatus === 'healthy' ? 'text-green-500' : 'text-red-500'} size={32} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-between mb-4">
          <h2 className="text-xl font-semibold">Recent Webhook Requests</h2>
          <Link to="/requests" className="button button-secondary">
            <Eye size={16} />
            View All
          </Link>
        </div>

        {stats.recentRequests.length === 0 ? (
          <div className="empty-state">
            <h3>No webhook requests yet</h3>
            <p>Send a request to one of your webhook endpoints to see it here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>IP Address</th>
                  <th>Received At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <span className={getMethodBadgeClass(request.method)}>
                        {request.method}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{request.endpoint_path}</td>
                    <td className="text-sm">{request.ip_address}</td>
                    <td className="text-sm">{moment(request.received_at).fromNow()}</td>
                    <td>
                      <Link 
                        to={`/requests/${request.id}`}
                        className="button button-secondary text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-2">
          <div>
            <h3 className="font-medium mb-2">Send a Test Request</h3>
            <p className="text-sm text-gray-600 mb-3">
              Try sending a POST request to test the webhook catcher:
            </p>
            <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
              {`curl -X POST http://localhost:3001/webhook/default \\
  -H "Content-Type: application/json" \\
  -d '{"test": "data", "timestamp": "2023-01-01"}'`}
            </code>
          </div>
          <div>
            <h3 className="font-medium mb-2">Manage Endpoints</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create custom webhook endpoints with different security settings.
            </p>
            <Link to="/endpoints" className="button button-primary">
              Manage Endpoints
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

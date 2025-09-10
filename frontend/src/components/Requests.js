import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import { Eye, RefreshCw, Filter } from 'lucide-react';
import moment from 'moment';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const response = await requestsAPI.getAll({ limit: 100 });
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadRequests(true);
  };

  const getMethodBadgeClass = (method) => {
    const classes = {
      'GET': 'method-get',
      'POST': 'method-post',
      'PUT': 'method-put',
      'DELETE': 'method-delete',
      'PATCH': 'method-put',
      'HEAD': 'method-get',
      'OPTIONS': 'method-get'
    };
    return `method-badge ${classes[method] || 'method-get'}`;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
      <div className="flex flex-between mb-4">
        <h1 className="text-2xl font-bold">Webhook Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className={`button button-secondary ${refreshing ? 'opacity-50' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <div className="empty-state">
            <h3>No webhook requests yet</h3>
            <p>Send a request to one of your webhook endpoints to see it here.</p>
            <div className="mt-4">
              <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                {`curl -X POST http://localhost:3001/webhook/default \\
  -H "Content-Type: application/json" \\
  -d '{"test": "Hello World!"}'`}
              </code>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>IP Address</th>
                  <th>Content Type</th>
                  <th>Body Preview</th>
                  <th>Received At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <span className={getMethodBadgeClass(request.method)}>
                        {request.method}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-mono text-sm">{request.endpoint_path}</div>
                        <div className="text-xs text-gray-500">{request.endpoint_name}</div>
                      </div>
                    </td>
                    <td className="text-sm font-mono">{request.ip_address}</td>
                    <td className="text-sm">{request.content_type || 'N/A'}</td>
                    <td className="text-sm font-mono">
                      {request.body ? (
                        <span className="truncate block max-w-xs">
                          {truncateText(request.body, 40)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Empty</span>
                      )}
                    </td>
                    <td className="text-sm">
                      <div>{moment(request.received_at).format('MMM DD, HH:mm:ss')}</div>
                      <div className="text-xs text-gray-500">
                        {moment(request.received_at).fromNow()}
                      </div>
                    </td>
                    <td>
                      <Link 
                        to={`/requests/${request.id}`}
                        className="button button-secondary text-xs"
                      >
                        <Eye size={14} />
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

      {requests.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {requests.length} most recent requests. Auto-refreshing every 5 seconds.
        </div>
      )}
    </div>
  );
}

export default Requests;

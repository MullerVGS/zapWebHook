import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestsAPI } from '../services/api';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import ReactJson from '@microlink/react-json-view';
import moment from 'moment';
import toast from 'react-hot-toast';

function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getById(id);
      setRequest(response.data);
    } catch (error) {
      console.error('Error loading request:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
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

  const formatJson = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return jsonString;
    }
  };

  const CopyButton = ({ text, fieldName }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="button button-secondary text-xs ml-2"
      title={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Request not found</h3>
          <p>The requested webhook details could not be found.</p>
          <Link to="/requests" className="button button-primary mt-4">
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link to="/requests" className="button button-secondary">
          <ArrowLeft size={16} />
          Back to Requests
        </Link>
        <h1 className="text-2xl font-bold">Request Details</h1>
      </div>

      <div className="grid gap-4">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-2 gap-4">
            <div>
              <label className="form-label">Method</label>
              <div className="flex items-center">
                <span className={getMethodBadgeClass(request.method)}>
                  {request.method}
                </span>
              </div>
            </div>
            <div>
              <label className="form-label">Endpoint</label>
              <div className="flex items-center">
                <span className="font-mono text-sm">{request.endpoint_path}</span>
                <CopyButton text={request.endpoint_path} fieldName="Endpoint" />
              </div>
            </div>
            <div>
              <label className="form-label">IP Address</label>
              <div className="flex items-center">
                <span className="font-mono text-sm">{request.ip_address}</span>
                <CopyButton text={request.ip_address} fieldName="IP Address" />
              </div>
            </div>
            <div>
              <label className="form-label">Received At</label>
              <div>
                <div className="text-sm">{moment(request.received_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div className="text-xs text-gray-500">{moment(request.received_at).fromNow()}</div>
              </div>
            </div>
            <div>
              <label className="form-label">Content Type</label>
              <span className="text-sm">{request.content_type || 'Not specified'}</span>
            </div>
            <div>
              <label className="form-label">User Agent</label>
              <div className="flex items-center">
                <span className="text-sm truncate">{request.user_agent || 'Not specified'}</span>
                {request.user_agent && (
                  <CopyButton text={request.user_agent} fieldName="User Agent" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* URL Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">URL</h2>
            <CopyButton text={request.url} fieldName="Full URL" />
          </div>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
            {request.url}
          </div>
        </div>

        {/* Query Parameters */}
        {request.query_params && Object.keys(request.query_params).length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Query Parameters</h2>
              <CopyButton text={JSON.stringify(request.query_params, null, 2)} fieldName="Query Parameters" />
            </div>
            <div className="json-viewer">
              <ReactJson
                src={request.query_params}
                theme="rjv-default"
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                collapsed={false}
              />
            </div>
          </div>
        )}

        {/* Headers */}
        {request.headers && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Headers</h2>
              <CopyButton text={JSON.stringify(request.headers, null, 2)} fieldName="Headers" />
            </div>
            <div className="json-viewer">
              <ReactJson
                src={request.headers}
                theme="rjv-default"
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                collapsed={1}
              />
            </div>
          </div>
        )}

        {/* Request Body */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Request Body</h2>
            {request.body && (
              <CopyButton text={request.body} fieldName="Request Body" />
            )}
          </div>
          {request.body ? (
            <div className="json-viewer">
              {request.content_type && request.content_type.includes('application/json') ? (
                <ReactJson
                  src={formatJson(request.body)}
                  theme="rjv-default"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                  collapsed={false}
                />
              ) : (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                  {request.body}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">No request body</div>
          )}
        </div>

        {/* Raw Request Data */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Raw Request Data</h2>
            <CopyButton text={JSON.stringify(request, null, 2)} fieldName="Raw Data" />
          </div>
          <div className="json-viewer">
            <ReactJson
              src={request}
              theme="rjv-default"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              collapsed={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestDetail;

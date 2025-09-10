import React, { useState, useEffect } from 'react';
import { endpointsAPI } from '../services/api';
import { Plus, Edit, Trash2, Shield, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

function Endpoints() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    endpoint_path: '',
    description: '',
    require_tls: false,
    require_auth: false,
    auth_token: '',
    is_active: true
  });

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      const response = await endpointsAPI.getAll();
      setEndpoints(response.data);
    } catch (error) {
      console.error('Error loading endpoints:', error);
      toast.error('Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEndpoint) {
        await endpointsAPI.update(editingEndpoint.id, formData);
        toast.success('Endpoint updated successfully');
      } else {
        await endpointsAPI.create(formData);
        toast.success('Endpoint created successfully');
      }
      
      setShowForm(false);
      setEditingEndpoint(null);
      resetForm();
      loadEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
      toast.error(error.response?.data?.error || 'Failed to save endpoint');
    }
  };

  const handleEdit = (endpoint) => {
    setEditingEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      endpoint_path: endpoint.endpoint_path,
      description: endpoint.description || '',
      require_tls: endpoint.require_tls,
      require_auth: endpoint.require_auth,
      auth_token: endpoint.auth_token || '',
      is_active: endpoint.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (endpoint) => {
    if (!window.confirm(`Are you sure you want to delete "${endpoint.name}"?`)) {
      return;
    }

    try {
      await endpointsAPI.delete(endpoint.id);
      toast.success('Endpoint deleted successfully');
      loadEndpoints();
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      endpoint_path: '',
      description: '',
      require_tls: false,
      require_auth: false,
      auth_token: '',
      is_active: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEndpoint(null);
    resetForm();
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
        <h1 className="text-2xl font-bold">Webhook Endpoints</h1>
        <button
          onClick={() => setShowForm(true)}
          className="button button-primary"
        >
          <Plus size={16} />
          New Endpoint
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Endpoint Path</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.endpoint_path}
                  onChange={(e) => setFormData({ ...formData, endpoint_path: e.target.value })}
                  placeholder="/webhook/my-endpoint"
                  required
                  disabled={editingEndpoint}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for this endpoint"
              />
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.require_tls}
                    onChange={(e) => setFormData({ ...formData, require_tls: e.target.checked })}
                  />
                  Require TLS/HTTPS
                </label>
              </div>

              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.require_auth}
                    onChange={(e) => setFormData({ ...formData, require_auth: e.target.checked })}
                  />
                  Require Authentication
                </label>
              </div>
            </div>

            {formData.require_auth && (
              <div className="form-group">
                <label className="form-label">Authentication Token</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.auth_token}
                  onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                  placeholder="Enter authentication token"
                />
              </div>
            )}

            <div className="form-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="button button-primary">
                {editingEndpoint ? 'Update' : 'Create'} Endpoint
              </button>
              <button type="button" onClick={handleCancel} className="button button-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {endpoints.length === 0 ? (
          <div className="empty-state">
            <h3>No endpoints configured</h3>
            <p>Create your first webhook endpoint to start receiving requests.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Path</th>
                  <th>Security</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint) => (
                  <tr key={endpoint.id}>
                    <td>
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        {endpoint.description && (
                          <div className="text-sm text-gray-500">{endpoint.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="font-mono text-sm">{endpoint.endpoint_path}</td>
                    <td>
                      <div className="flex gap-1">
                        {endpoint.require_tls && (
                          <span className="badge badge-info" title="Requires HTTPS">
                            <Shield size={12} />
                          </span>
                        )}
                        {endpoint.require_auth && (
                          <span className="badge badge-warning" title="Requires Authentication">
                            <Lock size={12} />
                          </span>
                        )}
                        {!endpoint.require_tls && !endpoint.require_auth && (
                          <span className="badge badge-success" title="Open Access">
                            <Globe size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${endpoint.is_active ? 'badge-success' : 'badge-error'}`}>
                        {endpoint.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-sm">
                      {new Date(endpoint.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(endpoint)}
                          className="button button-secondary text-xs"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(endpoint)}
                          className="button button-danger text-xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Endpoints;

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Edit2, Save, X, AlertCircle, CheckCircle, Search, ArrowLeft } from 'lucide-react';

interface ClientOrganization {
  id: string;
  name: string;
  company_registration_number: string | null;
  vat_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  status: string | null;
}

interface ClientOrgInfoProps {
  onNavigate?: (view: string) => void;
}

export default function ClientOrgInfo({ onNavigate }: ClientOrgInfoProps) {
  const [organizations, setOrganizations] = useState<ClientOrganization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<ClientOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState<Partial<ClientOrganization>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(term) ||
        (org.company_registration_number || '').toLowerCase().includes(term)
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchTerm, organizations]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .neq('name', 'My Organization')
        .neq('name', 'FUEL EMPOWERMENT SYSTEMS (PTY) LTD')
        .order('name');

      if (orgsError) throw orgsError;
      setOrganizations(orgs || []);
      setFilteredOrganizations(orgs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (orgId: string) => {
    if (viewingId === orgId) {
      setViewingId(null);
    } else {
      setViewingId(orgId);
      setEditingId(null);
    }
  };

  const handleEdit = (org: ClientOrganization) => {
    setEditingId(org.id);
    setViewingId(org.id);
    setEditForm(org);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      setError('');
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: editForm.name,
          company_registration_number: editForm.company_registration_number,
          vat_number: editForm.vat_number,
          address_line1: editForm.address_line1,
          address_line2: editForm.address_line2,
          city: editForm.city,
          province: editForm.province,
          postal_code: editForm.postal_code,
          country: editForm.country,
          website: editForm.website,
          status: editForm.status,
        })
        .eq('id', editingId);

      if (updateError) throw updateError;

      setSuccess('Organization updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      const savedId = editingId;
      setEditingId(null);
      setEditForm({});
      await loadOrganizations();
      setViewingId(savedId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading organizations...</div>;
  }

  return (
    <div className="-my-6">
      <div className="sticky top-0 z-30 bg-white -mx-4 px-4 py-3 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              {editingId ? 'Edit Client Organization Info' : 'Client Organization Info'}
            </h2>
          </div>
          {editingId ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          ) : (
            onNavigate && (
              <button
                onClick={() => onNavigate('client-organizations-menu')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Menu
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-green-800 text-sm">{success}</div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        {filteredOrganizations.map((org) => {
          if (editingId && editingId !== org.id) return null;
          const isExpanded = viewingId === org.id || editingId === org.id;

          return (
          <div key={org.id} className="bg-white border border-gray-200 rounded-lg p-3">
            {editingId === org.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Organization Name</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Registration Number</label>
                    <input
                      type="text"
                      value={editForm.company_registration_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, company_registration_number: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">VAT Number</label>
                    <input
                      type="text"
                      value={editForm.vat_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, vat_number: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Website</label>
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 1</label>
                    <input
                      type="text"
                      value={editForm.address_line1 || ''}
                      onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 2</label>
                    <input
                      type="text"
                      value={editForm.address_line2 || ''}
                      onChange={(e) => setEditForm({ ...editForm, address_line2: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">City</label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Province</label>
                    <select
                      value={editForm.province || ''}
                      onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="">Select Province</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                      <option value="Western Cape">Western Cape</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Postal Code</label>
                    <input
                      type="text"
                      value={editForm.postal_code || ''}
                      onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Country</label>
                    <input
                      type="text"
                      value={editForm.country || ''}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      placeholder="South Africa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Status</label>
                    <select
                      value={editForm.status || 'active'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="flex items-start justify-between"
                >
                  <div
                    onClick={() => handleView(org.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{org.name}</h3>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          org.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {org.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Reg No: {org.company_registration_number || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => handleView(org.id)}
                      className="text-xs text-blue-600 cursor-pointer"
                    >
                      {isExpanded ? 'Click to collapse' : 'Click to view details'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(org);
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Organization Name</label>
                        <p className="text-gray-900">{org.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Registration Number</label>
                        <p className="text-gray-900">{org.company_registration_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">VAT Number</label>
                        <p className="text-gray-900">{org.vat_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Website</label>
                        <p className="text-gray-900">{org.website || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Address Line 1</label>
                        <p className="text-gray-900">{org.address_line1 || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Address Line 2</label>
                        <p className="text-gray-900">{org.address_line2 || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">City</label>
                        <p className="text-gray-900">{org.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Province</label>
                        <p className="text-gray-900">{org.province || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Postal Code</label>
                        <p className="text-gray-900">{org.postal_code || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Country</label>
                        <p className="text-gray-900">{org.country || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Status</label>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          org.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {org.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}

        {filteredOrganizations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No organizations found
          </div>
        )}
      </div>
    </div>
  );
}

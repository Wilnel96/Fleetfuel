import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, CheckCircle, XCircle, Loader2, Edit2, Save, X, AlertCircle, Search, Plus, Ban, Power } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  vat_number: string | null;
  city: string | null;
}

interface LocalAccount {
  id: string;
  organization_id: string;
  is_active: boolean;
  notes: string | null;
  account_number: string | null;
  account_limit: number | null;
}

interface GarageLocalAccountsProps {
  garageId: string;
  garageName: string;
}

export default function GarageLocalAccounts({ garageId, garageName }: GarageLocalAccountsProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountLimitInput, setAccountLimitInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notesInput, setNotesInput] = useState('');

  useEffect(() => {
    loadData();
  }, [garageId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [orgsResult, accountsResult] = await Promise.all([
        supabase
          .from('organizations')
          .select('id, name, vat_number, city')
          .order('name'),
        supabase
          .from('organization_garage_accounts')
          .select('id, organization_id, is_active, notes, account_number, account_limit')
          .eq('garage_id', garageId),
      ]);

      if (orgsResult.error) throw orgsResult.error;
      if (accountsResult.error) throw accountsResult.error;

      setOrganizations(orgsResult.data || []);
      setLocalAccounts(accountsResult.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountStatus = async (account: LocalAccount, newStatus: boolean) => {
    try {
      setSaving(account.id);
      setError('');

      const { error: updateError } = await supabase
        .from('organization_garage_accounts')
        .update({ is_active: newStatus })
        .eq('id', account.id);

      if (updateError) throw updateError;

      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const openAddModal = (org: Organization) => {
    setSelectedOrganization(org);
    setAccountNumberInput('');
    setAccountLimitInput('');
    setNotesInput('');
    setShowAddModal(true);
  };

  const handleAddAccount = async () => {
    if (!selectedOrganization || !accountNumberInput.trim()) {
      setError('Account number is required');
      return;
    }

    try {
      setSaving(selectedOrganization.id);
      setError('');

      const accountLimit = accountLimitInput.trim() ? parseFloat(accountLimitInput) : null;

      const { error: insertError } = await supabase
        .from('organization_garage_accounts')
        .insert({
          organization_id: selectedOrganization.id,
          garage_id: garageId,
          is_active: true,
          account_number: accountNumberInput.trim(),
          account_limit: accountLimit,
          notes: notesInput.trim() || null,
        });

      if (insertError) throw insertError;

      await loadData();
      setShowAddModal(false);
      setSelectedOrganization(null);
      setAccountNumberInput('');
      setAccountLimitInput('');
      setNotesInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleCancelAddModal = () => {
    setShowAddModal(false);
    setSelectedOrganization(null);
    setAccountNumberInput('');
    setAccountLimitInput('');
    setNotesInput('');
    setError('');
  };

  const isAccountActive = (organizationId: string): boolean => {
    const account = localAccounts.find(a => a.organization_id === organizationId);
    return account ? account.is_active : false;
  };

  const getAccount = (organizationId: string): LocalAccount | undefined => {
    return localAccounts.find(a => a.organization_id === organizationId);
  };

  const handleEditAccount = (account: LocalAccount) => {
    setEditingAccountId(account.id);
    setAccountNumberInput(account.account_number || '');
    setAccountLimitInput(account.account_limit ? account.account_limit.toString() : '');
  };

  const handleSaveAccount = async (accountId: string) => {
    try {
      setSaving(accountId);
      setError('');

      const accountLimit = accountLimitInput.trim() ? parseFloat(accountLimitInput) : null;

      const { error: updateError } = await supabase
        .from('organization_garage_accounts')
        .update({
          account_number: accountNumberInput || null,
          account_limit: accountLimit
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      await loadData();
      setEditingAccountId(null);
      setAccountNumberInput('');
      setAccountLimitInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingAccountId(null);
    setAccountNumberInput('');
    setAccountLimitInput('');
  };

  const getOrganizationName = (orgId: string): string => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown Organization';
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.vat_number && org.vat_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeAccounts = localAccounts.filter(a => a.is_active);
  const inactiveAccounts = localAccounts.filter(a => !a.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading client accounts...</span>
      </div>
    );
  }

  return (
    <>
      {showAddModal && selectedOrganization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Add Local Account
                </h3>
                <p className="text-sm text-gray-600">
                  Adding <strong>{selectedOrganization.name}</strong> as a client
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumberInput}
                  onChange={(e) => setAccountNumberInput(e.target.value)}
                  placeholder="Enter the account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  The account number this client has in your system
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Limit (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={accountLimitInput}
                    onChange={(e) => setAccountLimitInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum amount the client can owe (leave empty for no limit)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Add any notes about this account"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelAddModal}
                disabled={saving === selectedOrganization.id}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                disabled={!accountNumberInput.trim() || saving === selectedOrganization.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving === selectedOrganization.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Client'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">MyFuelApp Local Accounts</h2>
          <span className="text-sm text-gray-600">
            {activeAccounts.length} active client{activeAccounts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Manage which organizations have local accounts at {garageName}. These clients can refuel at your garage using their account number.
        </p>

        {error && !showAddModal && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organizations by name or VAT number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          {activeAccounts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Active Accounts</h3>
              <div className="space-y-2">
                {activeAccounts.map((account) => {
                  const org = organizations.find(o => o.id === account.organization_id);
                  if (!org) return null;

                  const isSaving = saving === account.id || saving === org.id;
                  const isEditingAccount = editingAccountId === account.id;

                  return (
                    <div
                      key={account.id}
                      className="p-3 border border-green-200 bg-green-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between p-1 rounded">
                        <div className="flex items-center space-x-3 flex-1">
                          <Building2 className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{org.name}</p>
                            <p className="text-xs text-gray-600">
                              {org.city || 'City not specified'}
                              {org.vat_number && ` • VAT: ${org.vat_number}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isEditingAccount && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAccountStatus(account, false);
                              }}
                              disabled={isSaving}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg disabled:opacity-50 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          )}
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 ml-8 pl-3 border-l-2 border-green-300">
                        {isEditingAccount ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 w-28">Account Number:</label>
                              <input
                                type="text"
                                value={accountNumberInput}
                                onChange={(e) => setAccountNumberInput(e.target.value)}
                                placeholder="Enter account number"
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 w-28">Account Limit:</label>
                              <div className="flex-1 relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">R</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={accountLimitInput}
                                  onChange={(e) => setAccountLimitInput(e.target.value)}
                                  placeholder="No limit"
                                  className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveAccount(account.id);
                                }}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-1">
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Account Number: </span>
                                  {account.account_number ? (
                                    <span className="text-gray-900 font-bold">{account.account_number}</span>
                                  ) : (
                                    <span className="text-red-600 font-semibold">
                                      <AlertCircle className="w-3 h-3 inline" /> REQUIRED
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Account Limit: </span>
                                  {account.account_limit ? (
                                    <span className="text-gray-900 font-bold">R {account.account_limit.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-gray-500 italic">No limit set</span>
                                  )}
                                </p>
                                {account.notes && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Notes: </span>
                                    {account.notes}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAccount(account);
                                }}
                                className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded ${account.account_number ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' : 'text-red-700 bg-red-100 hover:bg-red-200 animate-pulse'}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {inactiveAccounts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Inactive Accounts</h3>
              <div className="space-y-2">
                {inactiveAccounts.map((account) => {
                  const org = organizations.find(o => o.id === account.organization_id);
                  if (!org) return null;

                  const isSaving = saving === account.id;

                  return (
                    <div
                      key={account.id}
                      className="p-3 border border-gray-200 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{org.name}</p>
                            <p className="text-xs text-gray-500">
                              {org.city || 'City not specified'}
                              {account.account_number && ` • Account: ${account.account_number}`}
                              {account.account_limit && ` • Limit: R${account.account_limit.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAccountStatus(account, true)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <Power className="w-3.5 h-3.5" />
                            Activate
                          </button>
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Client</h3>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
              {filteredOrganizations.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No organizations found matching your search' : 'No organizations available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOrganizations
                    .filter(org => !localAccounts.find(a => a.organization_id === org.id))
                    .map((org) => {
                      const isSaving = saving === org.id;
                      return (
                        <div
                          key={org.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => !isSaving && openAddModal(org)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{org.name}</p>
                                <p className="text-xs text-gray-500">
                                  {org.city || 'City not specified'}
                                  {org.vat_number && ` • VAT: ${org.vat_number}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              ) : (
                                <Plus className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-900 text-sm font-medium">About Local Accounts:</p>
          <ul className="text-blue-800 text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Add organizations that have accounts at your garage</li>
            <li>Account numbers are used by drivers during refueling</li>
            <li>Only drivers from active accounts can refuel at your garage</li>
            <li>Toggle accounts on/off as needed without deleting the relationship</li>
          </ul>
        </div>
      </div>
    </>
  );
}

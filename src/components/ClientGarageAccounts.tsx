import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, CheckCircle, XCircle, Loader2, Edit2, Save, X, AlertCircle } from 'lucide-react';

interface Garage {
  id: string;
  name: string;
  city: string;
  province: string;
}

interface GarageAccount {
  id: string;
  garage_id: string;
  is_active: boolean;
  notes: string | null;
  account_number: string | null;
}

interface ClientGarageAccountsProps {
  organizationId: string;
  organizationName: string;
}

export default function ClientGarageAccounts({ organizationId, organizationName }: ClientGarageAccountsProps) {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [garageAccounts, setGarageAccounts] = useState<GarageAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedGarageForAccount, setSelectedGarageForAccount] = useState<Garage | null>(null);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [garagesResult, accountsResult] = await Promise.all([
        supabase
          .from('garages')
          .select('id, name, city, province')
          .order('name'),
        supabase
          .from('organization_garage_accounts')
          .select('id, garage_id, is_active, notes, account_number')
          .eq('organization_id', organizationId),
      ]);

      if (garagesResult.error) throw garagesResult.error;
      if (accountsResult.error) throw accountsResult.error;

      setGarages(garagesResult.data || []);
      setGarageAccounts(accountsResult.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGarage = async (garageId: string) => {
    const existingAccount = garageAccounts.find(a => a.garage_id === garageId);

    if (existingAccount) {
      // Existing account - toggle active status
      try {
        setSaving(garageId);
        setError('');

        const { error: updateError } = await supabase
          .from('organization_garage_accounts')
          .update({ is_active: !existingAccount.is_active })
          .eq('id', existingAccount.id);

        if (updateError) throw updateError;

        await loadData();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(null);
      }
    } else {
      // New garage - show modal to enter account number
      const garage = garages.find(g => g.id === garageId);
      if (garage) {
        setSelectedGarageForAccount(garage);
        setAccountNumberInput('');
        setShowAccountModal(true);
      }
    }
  };

  const handleSaveNewGarageAccount = async () => {
    if (!selectedGarageForAccount || !accountNumberInput.trim()) {
      setError('Account number is required');
      return;
    }

    try {
      setSaving(selectedGarageForAccount.id);
      setError('');

      const { error: insertError } = await supabase
        .from('organization_garage_accounts')
        .insert({
          organization_id: organizationId,
          garage_id: selectedGarageForAccount.id,
          is_active: true,
          account_number: accountNumberInput.trim(),
        });

      if (insertError) throw insertError;

      await loadData();
      setShowAccountModal(false);
      setSelectedGarageForAccount(null);
      setAccountNumberInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleCancelAccountModal = () => {
    setShowAccountModal(false);
    setSelectedGarageForAccount(null);
    setAccountNumberInput('');
    setError('');
  };

  const isGarageActive = (garageId: string): boolean => {
    const account = garageAccounts.find(a => a.garage_id === garageId);
    return account ? account.is_active : false;
  };

  const getGarageAccount = (garageId: string): GarageAccount | undefined => {
    return garageAccounts.find(a => a.garage_id === garageId);
  };

  const handleEditAccountNumber = (account: GarageAccount) => {
    setEditingAccountId(account.id);
    setAccountNumberInput(account.account_number || '');
  };

  const handleSaveAccountNumber = async (accountId: string) => {
    try {
      setSaving(accountId);
      setError('');

      const { error: updateError } = await supabase
        .from('organization_garage_accounts')
        .update({ account_number: accountNumberInput || null })
        .eq('id', accountId);

      if (updateError) throw updateError;

      await loadData();
      setEditingAccountId(null);
      setAccountNumberInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingAccountId(null);
    setAccountNumberInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="ml-2 text-xs text-gray-500">Loading garages...</span>
      </div>
    );
  }

  return (
    <>
      {/* Account Number Entry Modal */}
      {showAccountModal && selectedGarageForAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Enter Account Number
                </h3>
                <p className="text-sm text-gray-600">
                  Adding <strong>{selectedGarageForAccount.name}</strong> to authorized garages
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Account Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={accountNumberInput}
                onChange={(e) => setAccountNumberInput(e.target.value)}
                placeholder="Enter the account number for this garage"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveNewGarageAccount();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the account number {organizationName} has with {selectedGarageForAccount.name}'s accounting system.
              </p>
              {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelAccountModal}
                disabled={saving === selectedGarageForAccount.id}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewGarageAccount}
                disabled={!accountNumberInput.trim() || saving === selectedGarageForAccount.id}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving === selectedGarageForAccount.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Garage'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Select Garages Where {organizationName} Has Local Accounts
          </label>
          <span className="text-xs text-gray-500">
            {garageAccounts.filter(a => a.is_active).length} of {garages.length} selected
          </span>
        </div>

        {error && !showAccountModal && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
        {garages.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500">
            No garages available. Please add garages to the system first.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {garages.map((garage) => {
              const isActive = isGarageActive(garage.id);
              const account = getGarageAccount(garage.id);
              const isSaving = saving === garage.id || (account && saving === account.id);
              const isEditingAccount = account && editingAccountId === account.id;

              return (
                <div
                  key={garage.id}
                  className={`p-2 ${isActive ? 'bg-amber-50' : ''}`}
                >
                  <div
                    className="flex items-center justify-between hover:bg-gray-50 cursor-pointer p-1 rounded"
                    onClick={() => !isSaving && !isEditingAccount && toggleGarage(garage.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Building2 className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{garage.name}</p>
                        <p className="text-xs text-gray-500">{garage.city}, {garage.province}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </div>

                  {isActive && account && (
                    <div className={`mt-2 ml-6 pl-2 border-l-2 ${account.account_number ? 'border-amber-300' : 'border-red-300'}`}>
                      {isEditingAccount ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={accountNumberInput}
                            onChange={(e) => setAccountNumberInput(e.target.value)}
                            placeholder="Enter account number for this garage"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveAccountNumber(account.id);
                            }}
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            disabled={isSaving}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Account Number: </span>
                              {account.account_number ? (
                                <span className="text-gray-900 font-semibold">{account.account_number}</span>
                              ) : (
                                <span className="text-red-600 font-semibold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  REQUIRED - Click to add
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAccountNumber(account);
                            }}
                            className={`p-1 rounded ${account.account_number ? 'text-amber-600 hover:bg-amber-100' : 'text-red-600 hover:bg-red-50 animate-pulse'}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Drivers from this organization will only be able to refuel at selected garages.
      </p>
      </div>
    </>
  );
}

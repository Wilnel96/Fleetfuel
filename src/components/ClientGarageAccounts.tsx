import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
          .select('id, garage_id, is_active, notes')
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
    try {
      setSaving(garageId);
      setError('');

      const existingAccount = garageAccounts.find(a => a.garage_id === garageId);

      if (existingAccount) {
        const { error: updateError } = await supabase
          .from('organization_garage_accounts')
          .update({ is_active: !existingAccount.is_active })
          .eq('id', existingAccount.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('organization_garage_accounts')
          .insert({
            organization_id: organizationId,
            garage_id: garageId,
            is_active: true,
          });

        if (insertError) throw insertError;
      }

      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const isGarageActive = (garageId: string): boolean => {
    const account = garageAccounts.find(a => a.garage_id === garageId);
    return account ? account.is_active : false;
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700">
          Select Garages Where {organizationName} Has Local Accounts
        </label>
        <span className="text-xs text-gray-500">
          {garageAccounts.filter(a => a.is_active).length} of {garages.length} selected
        </span>
      </div>

      {error && (
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
              const isSaving = saving === garage.id;

              return (
                <div
                  key={garage.id}
                  className={`flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer ${
                    isActive ? 'bg-amber-50' : ''
                  }`}
                  onClick={() => !isSaving && toggleGarage(garage.id)}
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
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Drivers from this organization will only be able to refuel at selected garages.
      </p>
    </div>
  );
}

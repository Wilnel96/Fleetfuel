import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Save, AlertCircle, CheckCircle, User, ArrowLeft, Edit, X } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  month_end_day: number | null;
  year_end_month: number | null;
  year_end_day: number | null;
  bank_name: string;
  bank_account_number: string;
  bank_branch_code: string;
  bank_account_type: string;
  bank_name_2: string;
  bank_account_number_2: string;
  bank_branch_code_2: string;
  bank_account_type_2: string;
}

interface BillingUser {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone_office: string | null;
  phone_mobile: string | null;
}

interface ManagementFinancialInfoProps {
  onNavigate?: (view: string) => void;
}

export default function ManagementFinancialInfo({ onNavigate }: ManagementFinancialInfoProps = {}) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [originalOrganization, setOriginalOrganization] = useState<Organization | null>(null);
  const [billingUser, setBillingUser] = useState<BillingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billingPassword, setBillingPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadOrganization();
    loadBillingUser();
  }, []);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name, month_end_day, year_end_month, year_end_day, bank_name, bank_account_number, bank_branch_code, bank_account_type, bank_name_2, bank_account_number_2, bank_branch_code_2, bank_account_type_2')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (data) {
        setOrganization(data);
        setOriginalOrganization(data);
      }
    } catch (err: any) {
      console.error('Error loading organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBillingUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.organization_id) return;

      const { data, error: fetchError } = await supabase
        .from('organization_users')
        .select('id, first_name, surname, email, phone_office, phone_mobile')
        .eq('organization_id', profile.organization_id)
        .eq('title', 'Billing User')
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) {
        console.error('Error loading billing user:', fetchError);
        return;
      }

      if (data) {
        setBillingUser(data);
      }
    } catch (err: any) {
      console.error('Error loading billing user:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    if (originalOrganization) {
      setOrganization(originalOrganization);
    }
    setBillingPassword('');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getMonthName = (month: number | null): string => {
    if (!month) return 'Not set';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || 'Not set';
  };

  const handleSave = async () => {
    if (!organization) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          month_end_day: organization.month_end_day,
          year_end_month: organization.year_end_month,
          year_end_day: organization.year_end_day,
          bank_name: organization.bank_name,
          bank_account_number: organization.bank_account_number,
          bank_branch_code: organization.bank_branch_code,
          bank_account_type: organization.bank_account_type,
          bank_name_2: organization.bank_name_2,
          bank_account_number_2: organization.bank_account_number_2,
          bank_branch_code_2: organization.bank_branch_code_2,
          bank_account_type_2: organization.bank_account_type_2,
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      setOriginalOrganization(organization);
      setSuccess('Financial information updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving financial info:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No organization information found</p>
      </div>
    );
  }

  return (
    <div className="-my-6">
      <div className="sticky top-0 z-10 bg-white -mx-4 px-4 py-6 pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Management Financial Info</h2>
              <p className="text-gray-600 text-sm">Manage banking and financial details</p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('management-org-menu')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Management Organization Info
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Info
            </h3>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-600"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                {organization.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month End Day</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={organization.month_end_day || ''}
                  onChange={(e) => setOrganization({ ...organization, month_end_day: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-31"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.month_end_day || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year End Month</label>
              {isEditing ? (
                <select
                  value={organization.year_end_month || ''}
                  onChange={(e) => setOrganization({ ...organization, year_end_month: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {getMonthName(organization.year_end_month)}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year End Day</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={organization.year_end_day || ''}
                  onChange={(e) => setOrganization({ ...organization, year_end_day: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-31"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.year_end_day || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Billing User Information
          </h3>
          {billingUser ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {billingUser.first_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {billingUser.surname}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {billingUser.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {billingUser.phone_office || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {billingUser.phone_mobile || 'Not set'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-medium">No billing user assigned</p>
                <p className="text-amber-700 text-sm mt-1">Create a user with the "Billing User" title in User Management to assign a billing user to this organization.</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Details - Primary Account</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_name || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_name || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_account_number || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_account_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_account_number || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_branch_code || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_branch_code: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_branch_code || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              {isEditing ? (
                <select
                  value={organization.bank_account_type || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_account_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                  <option value="Transmission">Transmission</option>
                </select>
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_account_type || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Details - Secondary Account (Optional)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_name_2 || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_name_2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_name_2 || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_account_number_2 || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_account_number_2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_account_number_2 || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={organization.bank_branch_code_2 || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_branch_code_2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_branch_code_2 || 'Not set'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              {isEditing ? (
                <select
                  value={organization.bank_account_type_2 || ''}
                  onChange={(e) => setOrganization({ ...organization, bank_account_type_2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Current">Current</option>
                  <option value="Savings">Savings</option>
                  <option value="Transmission">Transmission</option>
                </select>
              ) : (
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-900">
                  {organization.bank_account_type_2 || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

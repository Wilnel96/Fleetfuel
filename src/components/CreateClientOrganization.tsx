import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface CreateClientOrganizationProps {
  onNavigate?: (view: string) => void;
}

export default function CreateClientOrganization({ onNavigate }: CreateClientOrganizationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company_registration_number: '',
    vat_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'South Africa',
    website: '',
    monthly_fee_per_vehicle: 0,
    month_end_day: 25,
    year_end_month: 2,
    year_end_day: 28,
    daily_spending_limit: null as number | null,
    monthly_spending_limit: null as number | null,
  });

  const [mainUser, setMainUser] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone_office: '',
    phone_mobile: '',
  });

  const [billingContact, setBillingContact] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone_office: '',
    phone_mobile: '',
    can_add_vehicles: false,
    can_edit_vehicles: false,
    can_delete_vehicles: false,
    can_add_drivers: false,
    can_edit_drivers: false,
    can_delete_drivers: false,
    can_view_reports: true,
    can_edit_organization_info: false,
    can_view_fuel_transactions: true,
    can_create_reports: true,
    can_view_custom_reports: true,
    can_manage_users: false,
    can_view_financial_data: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data: parentOrg } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', profile.organization_id)
        .maybeSingle();

      if (!parentOrg) throw new Error('Parent organization not found');
      if (parentOrg.name !== 'FUEL EMPOWERMENT SYSTEMS (PTY) LTD') {
        throw new Error('Only management organization can create client organizations');
      }

      const { data: newOrg, error: insertError } = await supabase
        .from('organizations')
        .insert({
          ...formData,
          parent_org_id: parentOrg.id,
          organization_type: 'client',
          status: 'active',
          billing_email: billingContact.email,
          billing_contact_name: billingContact.name,
          billing_contact_surname: billingContact.surname,
          billing_contact_phone_office: billingContact.phone_office,
          billing_contact_phone_mobile: billingContact.phone_mobile,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newOrg) throw new Error('Failed to create organization');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-organization-users`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: newOrg.id,
          users: [{
            email: mainUser.email,
            password: mainUser.password,
            name: mainUser.name,
            surname: mainUser.surname,
            phone_office: mainUser.phone_office || null,
            phone_mobile: mainUser.phone_mobile || null,
            is_main_user: true,
            role: 'admin',
          }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create main user');
      }

      const billingResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: newOrg.id,
          users: [{
            email: billingContact.email,
            password: billingContact.password,
            name: billingContact.name,
            surname: billingContact.surname,
            title: 'Billing User',
            phone_office: billingContact.phone_office || null,
            phone_mobile: billingContact.phone_mobile || null,
            is_main_user: false,
            role: 'billing',
            can_add_vehicles: billingContact.can_add_vehicles,
            can_edit_vehicles: billingContact.can_edit_vehicles,
            can_delete_vehicles: billingContact.can_delete_vehicles,
            can_add_drivers: billingContact.can_add_drivers,
            can_edit_drivers: billingContact.can_edit_drivers,
            can_delete_drivers: billingContact.can_delete_drivers,
            can_view_reports: billingContact.can_view_reports,
            can_edit_organization_info: billingContact.can_edit_organization_info,
            can_view_fuel_transactions: billingContact.can_view_fuel_transactions,
            can_create_reports: billingContact.can_create_reports,
            can_view_custom_reports: billingContact.can_view_custom_reports,
            can_manage_users: billingContact.can_manage_users,
            can_view_financial_data: billingContact.can_view_financial_data,
          }],
        }),
      });

      if (!billingResponse.ok) {
        const errorData = await billingResponse.json();
        throw new Error(errorData.error || 'Failed to create billing user');
      }

      setSuccess('Client organization, main user, and billing user created successfully!');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('client-organizations-menu');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create New Client</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('client-organizations-menu')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-client-form"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 text-xs">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800 text-xs">{success}</div>
          </div>
        )}

        <form id="create-client-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Organization Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.company_registration_number}
                onChange={(e) => setFormData({ ...formData, company_registration_number: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">VAT Number</label>
              <input
                type="text"
                value={formData.vat_number}
                onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Organization Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Province</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Payment Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Fuel Payment Option <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.payment_option}
                onChange={(e) => setFormData({
                  ...formData,
                  payment_option: e.target.value as any,
                  fuel_payment_terms: e.target.value !== 'EFT Payment' ? '' : formData.fuel_payment_terms,
                  fuel_payment_interest_rate: e.target.value !== 'EFT Payment' ? null : formData.fuel_payment_interest_rate,
                })}
                className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  !formData.payment_option ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">-- Select Payment Option --</option>
                <option value="Card Payment">Credit/Debit Card Payment</option>
                <option value="Local Account">Local Account</option>
                <option value="EFT Payment">EFT Payment</option>
              </select>
            </div>

            {formData.payment_option === 'Card Payment' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-medium">
                  Client's credit/debit card is securely encrypted and stored. Drivers use their PIN + NFC to transfer card details to garage card machines for payment. Client pays garages directly via their card and only pays MyFuelApp for management fees.
                </p>
                <p className="text-xs text-blue-800 mt-2">
                  Note: Card will be configured after organization creation in Financial Info section.
                </p>
              </div>
            )}

            {formData.payment_option === 'Local Account' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-900 font-medium">
                  Client has existing local accounts with garages. MyFuelApp manages fuel transactions and billing. Client pays MyFuelApp for management fees only. Fuel costs are settled through existing local account arrangements.
                </p>
              </div>
            )}

            {formData.payment_option === 'EFT Payment' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                <p className="text-xs text-green-900 font-medium">
                  Client pays garages directly via collated EFT runs. MyFuelApp manages transactions and billing.
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Fuel Payment Terms <span className="text-red-500">*</span>
                  </label>
                  <select
                    required={formData.payment_option === 'EFT Payment'}
                    value={formData.fuel_payment_terms}
                    onChange={(e) => setFormData({
                      ...formData,
                      fuel_payment_terms: e.target.value as any,
                      fuel_payment_interest_rate: e.target.value === 'Same Day' ? null : formData.fuel_payment_interest_rate,
                    })}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Select Payment Terms --</option>
                    <option value="Same Day">Same Day</option>
                    <option value="Next Day">Next Day</option>
                    <option value="30-Days">30-Days</option>
                  </select>
                </div>
                {formData.fuel_payment_terms && formData.fuel_payment_terms !== 'Same Day' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Fuel Payment Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required={formData.fuel_payment_terms !== 'Same Day'}
                      value={formData.fuel_payment_interest_rate || ''}
                      onChange={(e) => setFormData({ ...formData, fuel_payment_interest_rate: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g. 1.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Interest rate applied to fuel payments when terms are not Same Day
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Payment Option Guide:</h4>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div>
                  <span className="font-medium text-blue-700">Credit/Debit Card Payment:</span> Client's card stored securely. Drivers use PIN + NFC for payments at garages. Client pays garages directly and MyFuelApp for management fees only.
                </div>
                <div>
                  <span className="font-medium text-amber-700">Local Account:</span> Client has existing accounts with garages. MyFuelApp tracks transactions. Client pays MyFuelApp for management fees only. Best for established garage relationships.
                </div>
                <div>
                  <span className="font-medium text-green-700">EFT Payment:</span> Client handles direct payments to garages via EFT. MyFuelApp manages transactions and billing. Best for businesses with dedicated finance teams.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Main User & Contact Person</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mainUser.name}
                onChange={(e) => setMainUser({ ...mainUser, name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mainUser.surname}
                onChange={(e) => setMainUser({ ...mainUser, surname: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={mainUser.email}
                onChange={(e) => setMainUser({ ...mainUser, email: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={mainUser.password}
                onChange={(e) => setMainUser({ ...mainUser, password: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Office Number</label>
              <input
                type="text"
                value={mainUser.phone_office}
                onChange={(e) => setMainUser({ ...mainUser, phone_office: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Mobile Number</label>
              <input
                type="text"
                value={mainUser.phone_mobile}
                onChange={(e) => setMainUser({ ...mainUser, phone_mobile: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 font-medium">
                Main User Access: This user will automatically have full access to all features, including managing vehicles, drivers, viewing fuel transactions, creating reports, and managing other users.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Billing User</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={billingContact.name}
                onChange={(e) => setBillingContact({ ...billingContact, name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={billingContact.surname}
                onChange={(e) => setBillingContact({ ...billingContact, surname: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={billingContact.email}
                onChange={(e) => setBillingContact({ ...billingContact, email: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={billingContact.password}
                onChange={(e) => setBillingContact({ ...billingContact, password: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Office Number</label>
              <input
                type="text"
                value={billingContact.phone_office}
                onChange={(e) => setBillingContact({ ...billingContact, phone_office: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Mobile Number</label>
              <input
                type="text"
                value={billingContact.phone_mobile}
                onChange={(e) => setBillingContact({ ...billingContact, phone_mobile: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="col-span-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Permissions</h4>

              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">Organization Management</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_edit_organization_info}
                        onChange={(e) => setBillingContact({ ...billingContact, can_edit_organization_info: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Edit Organization Info</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_manage_users}
                        onChange={(e) => setBillingContact({ ...billingContact, can_manage_users: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Manage Users</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">Vehicle Management</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_add_vehicles}
                        onChange={(e) => setBillingContact({ ...billingContact, can_add_vehicles: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Add Vehicles</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_edit_vehicles}
                        onChange={(e) => setBillingContact({ ...billingContact, can_edit_vehicles: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Edit Vehicles</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_delete_vehicles}
                        onChange={(e) => setBillingContact({ ...billingContact, can_delete_vehicles: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Delete Vehicles</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">Driver Management</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_add_drivers}
                        onChange={(e) => setBillingContact({ ...billingContact, can_add_drivers: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Add Drivers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_edit_drivers}
                        onChange={(e) => setBillingContact({ ...billingContact, can_edit_drivers: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Edit Drivers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_delete_drivers}
                        onChange={(e) => setBillingContact({ ...billingContact, can_delete_drivers: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Delete Drivers</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">Fuel Transactions</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_view_fuel_transactions}
                        onChange={(e) => setBillingContact({ ...billingContact, can_view_fuel_transactions: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can View Fuel Transactions</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">Note: Fuel transactions are created only by drivers via the mobile app and cannot be edited or deleted by anyone to maintain data integrity</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-gray-800 mb-2">Reports & Data</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_view_reports}
                        onChange={(e) => setBillingContact({ ...billingContact, can_view_reports: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can View Reports</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_create_reports}
                        onChange={(e) => setBillingContact({ ...billingContact, can_create_reports: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can Create Reports</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_view_custom_reports}
                        onChange={(e) => setBillingContact({ ...billingContact, can_view_custom_reports: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can View Custom Reports</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingContact.can_view_financial_data}
                        onChange={(e) => setBillingContact({ ...billingContact, can_view_financial_data: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-700">Can View Financial Data</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Financial Settings</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Monthly Fee Per Vehicle (R)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_fee_per_vehicle}
                onChange={(e) => setFormData({ ...formData, monthly_fee_per_vehicle: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Daily Spending Limit (R)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="No limit"
                value={formData.daily_spending_limit ?? ''}
                onChange={(e) => setFormData({ ...formData, daily_spending_limit: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Monthly Spending Limit (R)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="No limit"
                value={formData.monthly_spending_limit ?? ''}
                onChange={(e) => setFormData({ ...formData, monthly_spending_limit: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Month End Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.month_end_day}
                onChange={(e) => setFormData({ ...formData, month_end_day: parseInt(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Year End Month</label>
              <select
                value={formData.year_end_month}
                onChange={(e) => setFormData({ ...formData, year_end_month: parseInt(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
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
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Year End Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.year_end_day}
                onChange={(e) => setFormData({ ...formData, year_end_day: parseInt(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
}

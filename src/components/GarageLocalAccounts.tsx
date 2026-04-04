import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, CheckCircle, XCircle, Loader2, CreditCard as Edit2, Save, X, AlertCircle, Search, Plus, Ban, Power, MapPin, Phone, Mail, User, CreditCard, FileText, Calendar, Download, Send, ChevronDown, ChevronRight, Receipt } from 'lucide-react';
import GarageStatementsPayments from './GarageStatementsPayments';

interface Organization {
  id: string;
  name: string;
  vat_number: string | null;
  city: string | null;
  province: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  country: string | null;
  phone_number: string | null;
  company_registration_number: string | null;
  monthly_spending_limit: number | null;
  daily_spending_limit: number | null;
  parent_org_id: string | null;
}

interface OrgUser {
  id: string;
  first_name: string | null;
  surname: string | null;
  email: string;
  phone_mobile: string | null;
  phone_office: string | null;
  title: string | null;
  is_main_user: boolean;
}

interface LocalAccount {
  id: string;
  organization_id: string;
  is_active: boolean;
  notes: string | null;
  account_number: string | null;
  monthly_spend_limit: number | null;
  deposit_amount: number | null;
}

interface FuelInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  transaction_date: string;
  vehicle_registration: string;
  driver_name: string;
  garage_name: string;
  garage_address: string;
  garage_vat_number?: string;
  fuel_type: string;
  liters: number;
  price_per_liter: number;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  odometer_reading: number;
  email_sent: boolean;
  email_sent_at: string | null;
  oil_quantity?: number;
  oil_unit_price?: number;
  oil_total_amount?: number;
  oil_type?: string;
  oil_brand?: string;
  period_start?: string;
  period_end?: string;
  payment_status?: string;
  payment_due_date?: string;
}

interface GarageLocalAccountsProps {
  garageId: string;
  garageName: string;
  garageEmail: string;
  garagePassword: string;
}

export default function GarageLocalAccounts({ garageId, garageName, garageEmail, garagePassword }: GarageLocalAccountsProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [localAccounts, setLocalAccounts] = useState<LocalAccount[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<Record<string, OrgUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountLimitInput, setAccountLimitInput] = useState('');
  const [depositInput, setDepositInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [viewingOrgId, setViewingOrgId] = useState<string | null>(null);
  const [orgInvoices, setOrgInvoices] = useState<FuelInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedFinancialOrgId, setSelectedFinancialOrgId] = useState<string | null>(null);
  const [financialInvoices, setFinancialInvoices] = useState<FuelInvoice[]>([]);
  const [loadingFinancialInvoices, setLoadingFinancialInvoices] = useState(false);
  const [showFinancialSection, setShowFinancialSection] = useState(false);
  const [viewingStatementsOrgId, setViewingStatementsOrgId] = useState<string | null>(null);
  const [viewingStatementsOrgName, setViewingStatementsOrgName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [garageId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch organizations via regular query (public data)
      const orgsResult = await supabase
        .from('organizations')
        .select(`
          id, name, vat_number, city, province,
          address_line_1, address_line_2, postal_code, country,
          phone_number, company_registration_number,
          monthly_spending_limit, daily_spending_limit,
          parent_org_id
        `)
        .eq('organization_type', 'client')
        .order('name');

      if (orgsResult.error) throw orgsResult.error;

      // Fetch garage accounts via secure Edge Function
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/garage-local-accounts`;
      const accountsResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'list',
          garageEmail,
          garagePassword,
        }),
      });

      if (!accountsResponse.ok) {
        const error = await accountsResponse.json();
        throw new Error(error.error || 'Failed to load accounts');
      }

      const accountsData = await accountsResponse.json();

      setOrganizations(orgsResult.data || []);
      setLocalAccounts(accountsData.data || []);

      const allOrgIds = (orgsResult.data || []).map(o => o.id);

      if (allOrgIds.length > 0) {
        const usersResult = await supabase
          .from('organization_users')
          .select('id, organization_id, first_name, surname, email, phone_mobile, phone_office, title, is_main_user')
          .in('organization_id', allOrgIds)
          .eq('is_active', true);

        if (usersResult.error) {
          console.error('Error loading organization users:', usersResult.error);
          setError(`Failed to load contact information: ${usersResult.error.message}`);
        } else if (usersResult.data) {
          const usersByOrg: Record<string, OrgUser[]> = {};
          usersResult.data.forEach(user => {
            if (!usersByOrg[user.organization_id]) {
              usersByOrg[user.organization_id] = [];
            }
            usersByOrg[user.organization_id].push(user);
          });
          setOrganizationUsers(usersByOrg);
          console.log('Loaded organization users:', usersByOrg);
        }
      }
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

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/garage-local-accounts`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'update',
          garageEmail,
          garagePassword,
          accountId: account.id,
          accountData: { is_active: newStatus },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update account');
      }

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

      const monthlySpendLimit = accountLimitInput.trim() ? parseFloat(accountLimitInput) : null;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/garage-local-accounts`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'create',
          garageEmail,
          garagePassword,
          accountData: {
            organization_id: selectedOrganization.id,
            is_active: true,
            account_number: accountNumberInput.trim(),
            monthly_spend_limit: monthlySpendLimit,
            notes: notesInput.trim() || null,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }

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
    setAccountLimitInput(account.monthly_spend_limit ? account.monthly_spend_limit.toString() : '');
    setDepositInput(account.deposit_amount ? account.deposit_amount.toString() : '');
  };

  const handleSaveAccount = async (accountId: string) => {
    try {
      setSaving(accountId);
      setError('');

      const monthlySpendLimit = accountLimitInput.trim() ? parseFloat(accountLimitInput) : null;
      const depositAmount = depositInput.trim() ? parseFloat(depositInput) : null;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/garage-local-accounts`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'update',
          garageEmail,
          garagePassword,
          accountId,
          accountData: {
            account_number: accountNumberInput || null,
            monthly_spend_limit: monthlySpendLimit,
            deposit_amount: depositAmount,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update account');
      }

      await loadData();
      setEditingAccountId(null);
      setAccountNumberInput('');
      setAccountLimitInput('');
      setDepositInput('');
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
    setDepositInput('');
  };

  const loadOrganizationInvoices = async (organizationId: string) => {
    try {
      setLoadingInvoices(true);
      const { data, error } = await supabase
        .from('fuel_transaction_invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('garage_name', garageName)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(invoice => ({
        ...invoice,
        period_start: invoice.transaction_date,
        period_end: invoice.transaction_date,
        payment_status: 'pending',
        payment_due_date: invoice.invoice_date
      }));

      setOrgInvoices(transformedData);
    } catch (err: any) {
      console.error('Error loading invoices:', err.message);
      setOrgInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleViewOrganization = (orgId: string) => {
    setViewingOrgId(orgId);
    loadOrganizationInvoices(orgId);
  };

  const loadFinancialInvoices = async (organizationId: string) => {
    try {
      setLoadingFinancialInvoices(true);
      const { data, error } = await supabase
        .from('fuel_transaction_invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('garage_name', garageName)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(invoice => ({
        ...invoice,
        period_start: invoice.transaction_date,
        period_end: invoice.transaction_date,
        payment_status: 'pending',
        payment_due_date: invoice.invoice_date
      }));

      setFinancialInvoices(transformedData);
    } catch (err: any) {
      console.error('Error loading financial invoices:', err.message);
      setFinancialInvoices([]);
    } finally {
      setLoadingFinancialInvoices(false);
    }
  };

  const handleSelectFinancialOrg = (orgId: string) => {
    setSelectedFinancialOrgId(orgId);
    loadFinancialInvoices(orgId);
  };

  const handleDownloadInvoice = async (invoice: FuelInvoice, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const { generateFuelInvoicePDF, downloadPDFBlob } = await import('../lib/invoicePdfGenerator');

      const { data: garageData, error: fetchError } = await supabase
        .from('garages')
        .select('name, address_line_1, address_line_2, city, province, postal_code, vat_number')
        .eq('id', garageId)
        .single();

      if (fetchError) {
        console.error('Error fetching garage data:', fetchError);
      }

      const garageAddress = garageData
        ? [
            garageData.address_line_1,
            garageData.address_line_2,
            garageData.city,
            garageData.province,
            garageData.postal_code
          ].filter(Boolean).join(', ')
        : '';

      const pdfBlob = await generateFuelInvoicePDF({
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        transaction_date: invoice.transaction_date,
        vehicle_registration: invoice.vehicle_registration,
        driver_name: invoice.driver_name,
        garage_name: garageData?.name || garageName,
        garage_vat_number: garageData?.vat_number,
        garage_address: garageAddress,
        fuel_type: invoice.fuel_type,
        liters: invoice.liters,
        price_per_liter: invoice.price_per_liter,
        total_amount: invoice.total_amount,
        oil_quantity: invoice.oil_quantity,
        oil_type: invoice.oil_type,
        oil_brand: invoice.oil_brand,
        oil_unit_price: invoice.oil_unit_price,
        oil_total_amount: invoice.oil_total_amount
      });

      downloadPDFBlob(pdfBlob, `fuel-invoice-${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleEmailInvoice = async (invoice: FuelInvoice) => {
    // TODO: Implement invoice email functionality
    alert(`Email functionality for invoice ${invoice.invoice_number} will be implemented`);
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

  const viewingOrg = viewingOrgId ? organizations.find(o => o.id === viewingOrgId) : null;
  const viewingOrgUsers = viewingOrgId ? organizationUsers[viewingOrgId] || [] : [];
  const mainUser = viewingOrgUsers.find(u => u.is_main_user);
  const viewingAccount = viewingOrgId ? localAccounts.find(a => a.organization_id === viewingOrgId) : null;

  if (viewingStatementsOrgId) {
    return (
      <GarageStatementsPayments
        garageId={garageId}
        garageName={garageName}
        organizationId={viewingStatementsOrgId}
        organizationName={viewingStatementsOrgName}
        onBack={() => {
          setViewingStatementsOrgId(null);
          setViewingStatementsOrgName('');
        }}
      />
    );
  }

  return (
    <>
      {viewingOrg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingOrgId(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-[85vh] flex flex-col">
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingOrg.name}</h3>
                  <p className="text-xs text-gray-500">Client Organization Details</p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrgId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
              {/* Company Information */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Company Information
                </h4>
                <div className="space-y-2">
                  {/* Organization Name */}
                  <div className="pb-2 border-b border-gray-200">
                    <span className="text-gray-600 text-xs">Organization Name:</span>
                    <div className="mt-0.5 font-semibold text-gray-900 text-base">{viewingOrg.name}</div>
                  </div>

                  {/* Registration and VAT */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {viewingOrg.company_registration_number && (
                      <div>
                        <span className="text-gray-600">Registration:</span>
                        <span className="ml-2 font-medium text-gray-900">{viewingOrg.company_registration_number}</span>
                      </div>
                    )}
                    {viewingOrg.vat_number && (
                      <div>
                        <span className="text-gray-600">VAT Number:</span>
                        <span className="ml-2 font-medium text-gray-900">{viewingOrg.vat_number}</span>
                      </div>
                    )}
                    {viewingOrg.phone_number && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium text-gray-900">{viewingOrg.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Physical Address
                </h4>
                <div className="text-xs text-gray-900">
                  {viewingOrg.address_line_1 && <div>{viewingOrg.address_line_1}</div>}
                  {viewingOrg.address_line_2 && <div>{viewingOrg.address_line_2}</div>}
                  {(viewingOrg.city || viewingOrg.province || viewingOrg.postal_code) && (
                    <div>
                      {[viewingOrg.city, viewingOrg.province, viewingOrg.postal_code].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {viewingOrg.country && <div>{viewingOrg.country}</div>}
                  {!viewingOrg.address_line_1 && !viewingOrg.city && (
                    <div className="text-gray-500 italic">No address on file</div>
                  )}
                </div>
              </div>

              {/* Local Account Details */}
              {viewingAccount && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Local Account Details
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-white rounded p-2">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="ml-2 font-bold text-gray-900">
                        {viewingAccount.account_number || <span className="text-red-600 italic">Not set - Required!</span>}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-600">Monthly Spend Limit:</span>
                        <div className="font-medium text-gray-900 mt-0.5">
                          {viewingAccount.monthly_spend_limit ? `R ${viewingAccount.monthly_spend_limit.toFixed(2)}` : (
                            <span className="text-gray-500 italic">No limit</span>
                          )}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-600">Deposit:</span>
                        <div className="font-bold text-gray-900 mt-0.5">
                          {viewingAccount.deposit_amount ? `R ${viewingAccount.deposit_amount.toFixed(2)}` : (
                            <span className="text-gray-500 italic">No deposit</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {viewingAccount.notes && (
                      <div className="bg-white rounded p-2">
                        <span className="text-gray-600">Notes:</span>
                        <div className="text-gray-900 mt-0.5">{viewingAccount.notes}</div>
                      </div>
                    )}
                    <div className="bg-white rounded p-2">
                      <span className="text-gray-600">Account Status:</span>
                      <span className={`ml-2 font-medium ${viewingAccount.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {viewingAccount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Spending Limits */}
              {(viewingOrg.daily_spending_limit || viewingOrg.monthly_spending_limit) && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Organization Spending Limits
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {viewingOrg.daily_spending_limit && (
                      <div>
                        <span className="text-gray-600">Daily Limit:</span>
                        <span className="ml-2 font-medium text-gray-900">R {viewingOrg.daily_spending_limit.toFixed(2)}</span>
                      </div>
                    )}
                    {viewingOrg.monthly_spending_limit && (
                      <div>
                        <span className="text-gray-600">Monthly Limit:</span>
                        <span className="ml-2 font-medium text-gray-900">R {viewingOrg.monthly_spending_limit.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Persons */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Contact Persons
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Main User */}
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-blue-100">
                      <User className="w-3 h-3 text-blue-600" />
                      <h5 className="text-xs font-semibold text-blue-900">Main User / Account Owner</h5>
                    </div>
                    {mainUser ? (
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {[mainUser.first_name, mainUser.surname].filter(Boolean).join(' ') || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{mainUser.email}</span>
                        </div>
                        {mainUser.phone_mobile && (
                          <div>
                            <span className="text-gray-600">Mobile:</span>
                            <span className="ml-2 font-medium text-gray-900">{mainUser.phone_mobile}</span>
                          </div>
                        )}
                        {mainUser.phone_office && (
                          <div>
                            <span className="text-gray-600">Office:</span>
                            <span className="ml-2 font-medium text-gray-900">{mainUser.phone_office}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">No main user information on file</div>
                    )}
                  </div>

                  {/* Billing Contact */}
                  <div className="bg-white rounded-lg p-2 border border-amber-200">
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-amber-100">
                      <Mail className="w-3 h-3 text-amber-600" />
                      <h5 className="text-xs font-semibold text-amber-900">Billing User</h5>
                    </div>
                    {(() => {
                      const billingUser = organizationUsers[viewingOrg.id]?.find(u => u.title === 'Billing User');
                      return billingUser ? (
                        <div className="space-y-1.5 text-xs">
                          {(billingUser.first_name || billingUser.surname) && (
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {[billingUser.first_name, billingUser.surname].filter(Boolean).join(' ')}
                              </span>
                            </div>
                          )}
                          {billingUser.email && (
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2 font-medium text-gray-900">{billingUser.email}</span>
                            </div>
                          )}
                          {billingUser.phone_mobile && (
                            <div>
                              <span className="text-gray-600">Mobile:</span>
                              <span className="ml-2 font-medium text-gray-900">{billingUser.phone_mobile}</span>
                            </div>
                          )}
                          {billingUser.phone_office && (
                            <div>
                              <span className="text-gray-600">Office:</span>
                              <span className="ml-2 font-medium text-gray-900">{billingUser.phone_office}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">No billing user on file</div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Fuel Invoices */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Fuel Transaction Invoices
                </h4>
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-xs text-gray-500">Loading invoices...</span>
                  </div>
                ) : orgInvoices.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orgInvoices.map((invoice) => (
                      <div key={invoice.id} className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs font-semibold text-gray-900">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-xs font-bold text-gray-900">
                                R {invoice.total_amount.toFixed(2)}
                              </span>
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                              invoice.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.payment_status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5 pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-gray-500">Period:</span>
                            <span className="ml-1">
                              {new Date(invoice.period_start).toLocaleDateString('en-ZA')} - {new Date(invoice.period_end).toLocaleDateString('en-ZA')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Due Date:</span>
                            <span className="ml-1">{new Date(invoice.payment_due_date).toLocaleDateString('en-ZA')}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div>
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="ml-1 font-medium">R {invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">VAT:</span>
                              <span className="ml-1 font-medium">R {invoice.vat_amount.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <span className="ml-1 font-bold">R {invoice.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic py-2">No invoices found for this organization</div>
                )}
              </div>
            </div>
            </div>

            <div className="px-3 py-1 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setViewingOrgId(null)}
                className="w-full px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs font-medium hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && selectedOrganization && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16"
          onClick={(e) => {
            if (e.target === e.currentTarget && saving === null) {
              handleCancelAddModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-start gap-3 p-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">
                  Add Local Account
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Adding <strong>{selectedOrganization.name}</strong> as a client
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumberInput}
                    onChange={(e) => setAccountNumberInput(e.target.value)}
                    placeholder="Enter the account number"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-0.5">
                    The account number this client has in your system
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Monthly Spend Limit (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={accountLimitInput}
                      onChange={(e) => setAccountLimitInput(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Maximum monthly spending for this client (resets each month)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add any notes about this account"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 px-3 py-1 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={handleCancelAddModal}
                disabled={saving === selectedOrganization.id}
                className="flex-1 px-2 py-0.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                disabled={!accountNumberInput.trim() || saving === selectedOrganization.id}
                className="flex-1 px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {saving === selectedOrganization.id ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
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
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrganization(org.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                              >
                                <User className="w-3.5 h-3.5" />
                                View Details
                              </button>
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
                            </>
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
                              <label className="text-xs font-medium text-gray-700 w-28">Monthly Spend Limit:</label>
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
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-700 w-28">Deposit:</label>
                              <div className="flex-1 relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">R</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={depositInput}
                                  onChange={(e) => setDepositInput(e.target.value)}
                                  placeholder="0.00"
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
                                  <span className="font-medium">Monthly Spend Limit: </span>
                                  {account.monthly_spend_limit ? (
                                    <span className="text-gray-900 font-bold">R {account.monthly_spend_limit.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-gray-500 italic">No limit set</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-700">
                                  <span className="font-medium">Deposit: </span>
                                  {account.deposit_amount ? (
                                    <span className="text-gray-900 font-bold">R {account.deposit_amount.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-gray-500 italic">No deposit</span>
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
                                  setViewingStatementsOrgId(account.organization_id);
                                  setViewingStatementsOrgName(org.name);
                                }}
                                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Statements
                              </button>
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
                              {account.monthly_spend_limit && ` • Limit: R${account.monthly_spend_limit.toFixed(2)}`}
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

          {/* Financial Information Section */}
          <div className="mt-6">
            <button
              onClick={() => setShowFinancialSection(!showFinancialSection)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-700" />
                <h3 className="text-sm font-semibold text-green-900">Financial Information</h3>
              </div>
              {showFinancialSection ? (
                <ChevronDown className="w-5 h-5 text-green-700" />
              ) : (
                <ChevronRight className="w-5 h-5 text-green-700" />
              )}
            </button>

            {showFinancialSection && (
              <div className="mt-3 space-y-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Select Client to View Invoices
                  </label>
                  <select
                    value={selectedFinancialOrgId || ''}
                    onChange={(e) => {
                      const orgId = e.target.value;
                      if (orgId) {
                        handleSelectFinancialOrg(orgId);
                      } else {
                        setSelectedFinancialOrgId(null);
                        setFinancialInvoices([]);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Select a local account client --</option>
                    {activeAccounts.map((account) => {
                      const org = organizations.find(o => o.id === account.organization_id);
                      if (!org) return null;
                      return (
                        <option key={account.id} value={org.id}>
                          {org.name} {account.account_number ? `(Acc: ${account.account_number})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Invoices Display */}
                {selectedFinancialOrgId && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Client Invoices
                      </h4>
                      {financialInvoices.length > 0 && (
                        <span className="text-xs text-gray-600">
                          {financialInvoices.length} invoice{financialInvoices.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {loadingFinancialInvoices ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading invoices...</span>
                      </div>
                    ) : financialInvoices.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {financialInvoices.map((invoice) => (
                          <div key={invoice.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}
                                  </div>
                                  <div>
                                    Period: {new Date(invoice.period_start).toLocaleDateString('en-ZA')} - {new Date(invoice.period_end).toLocaleDateString('en-ZA')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 justify-end mb-1">
                                  <span className="text-sm font-bold text-gray-900">
                                    R {invoice.total_amount.toFixed(2)}
                                  </span>
                                </div>
                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                  invoice.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.payment_status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3 pt-2 border-t border-gray-200">
                              <div className="text-xs">
                                <span className="text-gray-500">Subtotal:</span>
                                <div className="font-medium text-gray-900">R {invoice.subtotal.toFixed(2)}</div>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">VAT:</span>
                                <div className="font-medium text-gray-900">R {invoice.vat_amount.toFixed(2)}</div>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Due Date:</span>
                                <div className="font-medium text-gray-900">{new Date(invoice.payment_due_date).toLocaleDateString('en-ZA')}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                              <button
                                onClick={(e) => handleDownloadInvoice(invoice, e)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEmailInvoice(invoice); }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Email
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No invoices found for this client</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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

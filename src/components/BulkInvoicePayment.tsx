import { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, DollarSign, Building2, Calendar, AlertCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_date: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  amount_outstanding: number;
  payment_due_date: string;
  status: string;
  organization?: {
    name: string;
  };
}

interface OrganizationInvoices {
  organization_id: string;
  organization_name: string;
  invoices: Invoice[];
  total_outstanding: number;
  invoice_count: number;
}

export default function BulkInvoicePayment({ onBack }: { onBack: () => void }) {
  const [organizationInvoices, setOrganizationInvoices] = useState<OrganizationInvoices[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUnpaidInvoices();
  }, []);

  const loadUnpaidInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          id,
          organization_id,
          invoice_number,
          invoice_date,
          billing_period_start,
          billing_period_end,
          total_amount,
          amount_outstanding,
          payment_due_date,
          status,
          organization:organizations(name)
        `)
        .in('status', ['issued', 'overdue'])
        .order('organization_id')
        .order('invoice_date');

      if (invoiceError) throw invoiceError;

      const grouped = (invoices || []).reduce((acc, invoice) => {
        const orgId = invoice.organization_id;
        const orgName = invoice.organization?.name || 'Unknown';

        if (!acc[orgId]) {
          acc[orgId] = {
            organization_id: orgId,
            organization_name: orgName,
            invoices: [],
            total_outstanding: 0,
            invoice_count: 0,
          };
        }

        acc[orgId].invoices.push(invoice as Invoice);
        acc[orgId].total_outstanding += invoice.amount_outstanding;
        acc[orgId].invoice_count += 1;

        return acc;
      }, {} as Record<string, OrganizationInvoices>);

      setOrganizationInvoices(Object.values(grouped));
    } catch (err: any) {
      setError('Failed to load unpaid invoices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInvoice = (invoiceId: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const toggleOrganization = (orgInvoices: OrganizationInvoices) => {
    const newSelected = new Set(selectedInvoices);
    const allSelected = orgInvoices.invoices.every(inv => selectedInvoices.has(inv.id));

    if (allSelected) {
      orgInvoices.invoices.forEach(inv => newSelected.delete(inv.id));
    } else {
      orgInvoices.invoices.forEach(inv => newSelected.add(inv.id));
    }

    setSelectedInvoices(newSelected);
  };

  const markSelectedAsPaid = async () => {
    if (selectedInvoices.size === 0) {
      setError('Please select at least one invoice');
      return;
    }

    if (!confirm(`Mark ${selectedInvoices.size} invoice(s) as paid?`)) return;

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const invoiceIds = Array.from(selectedInvoices);
      const allInvoices = organizationInvoices.flatMap(org => org.invoices);
      const invoicesToUpdate = allInvoices.filter(inv => invoiceIds.includes(inv.id));

      for (const invoice of invoicesToUpdate) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            amount_paid: invoice.total_amount,
            amount_outstanding: 0,
            paid_at: new Date().toISOString(),
          })
          .eq('id', invoice.id);

        if (updateError) throw updateError;
      }

      setSuccess(`Successfully marked ${selectedInvoices.size} invoice(s) as paid`);
      setSelectedInvoices(new Set());
      await loadUnpaidInvoices();
    } catch (err: any) {
      setError('Failed to mark invoices as paid: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const filteredOrgs = organizationInvoices.filter(org =>
    org.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelected = Array.from(selectedInvoices).reduce((sum, invoiceId) => {
    const invoice = organizationInvoices
      .flatMap(org => org.invoices)
      .find(inv => inv.id === invoiceId);
    return sum + (invoice?.amount_outstanding || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading unpaid invoices...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Invoice Management
          </button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-8 w-8 mr-3 text-green-600" />
            Bulk Invoice Payment
          </h1>
          <p className="mt-2 text-gray-600">
            Select and mark multiple invoices as paid
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {selectedInvoices.size > 0 && (
              <div className="ml-4 flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {selectedInvoices.size} invoice(s) selected
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(totalSelected)}
                  </p>
                </div>
                <button
                  onClick={markSelectedAsPaid}
                  disabled={processing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {processing ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            )}
          </div>

          {filteredOrgs.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No unpaid invoices found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrgs.map((orgInvoices) => {
                const allSelected = orgInvoices.invoices.every(inv => selectedInvoices.has(inv.id));
                const someSelected = orgInvoices.invoices.some(inv => selectedInvoices.has(inv.id));

                return (
                  <div key={orgInvoices.organization_id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => toggleOrganization(orgInvoices)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                              {orgInvoices.organization_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {orgInvoices.invoice_count} unpaid invoice(s)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Outstanding</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(orgInvoices.total_outstanding)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {orgInvoices.invoices.map((invoice) => {
                        const isOverdue = new Date(invoice.payment_due_date) < new Date() && invoice.status === 'issued';

                        return (
                          <div
                            key={invoice.id}
                            className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                              selectedInvoices.has(invoice.id) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedInvoices.has(invoice.id)}
                                  onChange={() => toggleInvoice(invoice.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {invoice.invoice_number}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(invoice.invoice_date)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Billing Period</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      Due Date
                                    </p>
                                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                      {formatDate(invoice.payment_due_date)}
                                      {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      {formatCurrency(invoice.amount_outstanding)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Quick Payment Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Click organization checkbox to select all invoices for that organization</li>
                <li>Individual invoices can be selected/deselected independently</li>
                <li>Selected invoices remain selected while you scroll and review</li>
                <li>Total amount updates automatically as you select invoices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

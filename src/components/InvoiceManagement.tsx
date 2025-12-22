import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Eye, CheckCircle, XCircle, Calendar, DollarSign, Building2, Download, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_date: string;
  billing_period_start: string;
  billing_period_end: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_outstanding: number;
  payment_terms: string;
  payment_due_date: string;
  status: string;
  organization?: {
    name: string;
  };
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  item_type: string;
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const [billingPeriodStart, setBillingPeriodStart] = useState('');
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          organization:organizations(name)
        `)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      setInvoices(data || []);
    } catch (err: any) {
      setError('Failed to load invoices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(
        inv =>
          inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.organization?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const viewInvoiceDetails = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);

      const { data, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice.id);

      if (lineItemsError) throw lineItemsError;

      setLineItems(data || []);
    } catch (err: any) {
      setError('Failed to load invoice details: ' + err.message);
    }
  };

  const generateInvoices = async () => {
    if (!billingPeriodStart || !billingPeriodEnd) {
      alert('Please select both start and end dates for the billing period');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setGenerationResult(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-monthly-invoices`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing_period_start: billingPeriodStart,
          billing_period_end: billingPeriodEnd,
          payment_terms: '30-Days',
          payment_due_days: 30,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate invoices');
      }

      setGenerationResult(result);
      await loadInvoices();
    } catch (err: any) {
      setError('Failed to generate invoices: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const markAsPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) return;

    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          amount_paid: supabase.rpc('get_invoice_total', { invoice_id: invoiceId }),
          amount_outstanding: 0,
          paid_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      await loadInvoices();
      setSelectedInvoice(null);
    } catch (err: any) {
      setError('Failed to mark invoice as paid: ' + err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Calendar },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Invoices
          </button>
          <button
            onClick={() => markAsPaid(selectedInvoice.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Paid
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoice_number}</h2>
                <p className="text-gray-600 mt-1">{selectedInvoice.organization?.name}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedInvoice.status)}
                <p className="text-sm text-gray-600 mt-2">
                  Invoice Date: {formatDate(selectedInvoice.invoice_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Billing Period</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedInvoice.billing_period_start)} - {formatDate(selectedInvoice.billing_period_end)}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Payment Terms</h3>
                <p className="text-sm text-gray-600">{selectedInvoice.payment_terms}</p>
                <p className="text-sm text-gray-600">
                  Due: {formatDate(selectedInvoice.payment_due_date)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (15%):</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.vat_amount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInvoice.amount_paid)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600 font-medium">
                  <span>Amount Outstanding:</span>
                  <span>{formatCurrency(selectedInvoice.amount_outstanding)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invoice Management</h2>
            <p className="text-sm text-gray-600">Manage client invoices and billing</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Generate Monthly Invoices
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Billing Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Outstanding</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{invoice.organization?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(invoice.invoice_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(invoice.amount_outstanding)}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => viewInvoiceDetails(invoice)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Generate Monthly Invoices</h3>
              <p className="text-sm text-gray-600 mt-1">
                This will create invoices for all client organizations based on their active vehicle count
              </p>
            </div>

            <div className="p-6 space-y-4">
              {generationResult ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <CheckCircle className="w-5 h-5" />
                      Invoices Generated Successfully
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Billing Period: {formatDate(generationResult.billing_period.start)} - {formatDate(generationResult.billing_period.end)}</p>
                      <p>Invoices Created: {generationResult.invoices_generated}</p>
                    </div>
                  </div>

                  {generationResult.errors && generationResult.errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-yellow-800 font-medium mb-2">
                        Skipped Organizations:
                      </div>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {generationResult.errors.map((err: any, idx: number) => (
                          <li key={idx}>
                            {err.organization}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerationResult(null);
                      setBillingPeriodStart('');
                      setBillingPeriodEnd('');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Period Start
                    </label>
                    <input
                      type="date"
                      value={billingPeriodStart}
                      onChange={(e) => setBillingPeriodStart(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Period End
                    </label>
                    <input
                      type="date"
                      value={billingPeriodEnd}
                      onChange={(e) => setBillingPeriodEnd(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={generating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateInvoices}
                      disabled={generating || !billingPeriodStart || !billingPeriodEnd}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {generating ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

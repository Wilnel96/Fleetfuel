import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Eye, CheckCircle, XCircle, Calendar, DollarSign, Building2, Download, AlertCircle, Printer, FileSpreadsheet, Fuel, ArrowLeft } from 'lucide-react';
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
    vat_number?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
    company_registration_number?: string;
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

interface ManagementOrganization {
  name: string;
  vat_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  phone_number?: string;
  company_registration_number?: string;
}

export default function InvoiceManagement() {
  const [currentView, setCurrentView] = useState<'menu' | 'fee' | 'fuel'>('menu');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [managementOrg, setManagementOrg] = useState<ManagementOrganization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  const [billingPeriodStart, setBillingPeriodStart] = useState('');
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('');

  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [billingPeriodSearch, setBillingPeriodSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId && selectedOrgId !== 'all') {
      setHasSearched(true);
      loadInvoices();
    } else {
      setHasSearched(false);
      setInvoices([]);
      setFilteredInvoices([]);
    }
  }, [selectedOrgId, billingPeriodSearch]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, statusFilter]);

  useEffect(() => {
    calculateTotals();
  }, [filteredInvoices]);

  const loadOrganizations = async () => {
    try {
      const { data, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_management_org', false)
        .order('name');

      if (orgsError) throw orgsError;

      setOrganizations(data || []);
    } catch (err: any) {
      console.error('Failed to load organizations:', err.message);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      // Only load invoices if a specific organization is selected
      if (!selectedOrgId || selectedOrgId === 'all') {
        setInvoices([]);
        setFilteredInvoices([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('invoices')
        .select(`
          *,
          organization:organizations(
            name,
            vat_number,
            address_line1,
            address_line2,
            city,
            province,
            postal_code,
            country,
            company_registration_number
          )
        `)
        .eq('organization_id', selectedOrgId);

      const { data, error: invoicesError } = await query.order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Client-side filtering for billing period search
      let filteredData = data || [];
      if (billingPeriodSearch) {
        const searchLower = billingPeriodSearch.toLowerCase();
        filteredData = filteredData.filter(invoice =>
          invoice.billing_period_start?.toLowerCase().includes(searchLower) ||
          invoice.billing_period_end?.toLowerCase().includes(searchLower)
        );
      }

      setInvoices(filteredData);
    } catch (err: any) {
      setError('Failed to load invoices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const calculateTotals = async () => {
    if (filteredInvoices.length === 0) {
      setTotalVehicles(0);
      setTotalAmount(0);
      return;
    }

    try {
      // Calculate total amount
      const sumAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      setTotalAmount(sumAmount);

      // Fetch line items for all filtered invoices to calculate total vehicles
      const invoiceIds = filteredInvoices.map(inv => inv.id);
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('quantity, item_type')
        .in('invoice_id', invoiceIds)
        .eq('item_type', 'Vehicle Fee');

      if (lineItemsError) throw lineItemsError;

      const sumVehicles = lineItemsData?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0;
      setTotalVehicles(sumVehicles);
    } catch (err) {
      console.error('Failed to calculate totals:', err);
    }
  };

  const viewInvoiceDetails = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);

      const [lineItemsResult, managementOrgResult] = await Promise.all([
        supabase
          .from('invoice_line_items')
          .select('*')
          .eq('invoice_id', invoice.id),
        supabase
          .from('organizations')
          .select('name, vat_number, address_line1, address_line2, city, province, postal_code, country, phone_number, company_registration_number')
          .eq('is_management_org', true)
          .single()
      ]);

      if (lineItemsResult.error) throw lineItemsResult.error;
      if (managementOrgResult.error) throw managementOrgResult.error;

      setLineItems(lineItemsResult.data || []);
      setManagementOrg(managementOrgResult.data);
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

  const printInvoice = () => {
    window.print();
  };

  const exportInvoiceToCSV = (invoice: Invoice, items: InvoiceLineItem[]) => {
    let csv = '';

    if (managementOrg) {
      csv += `${managementOrg.name}\n`;
      csv += `${managementOrg.address_line1}${managementOrg.address_line2 ? ', ' + managementOrg.address_line2 : ''}\n`;
      csv += `${managementOrg.city}, ${managementOrg.province} ${managementOrg.postal_code}\n`;
      if (managementOrg.phone_number) csv += `Phone: ${managementOrg.phone_number}\n`;
      if (managementOrg.vat_number) csv += `VAT No: ${managementOrg.vat_number}`;
      if (managementOrg.company_registration_number) csv += ` | Reg No: ${managementOrg.company_registration_number}`;
      csv += `\n\n`;
    }

    csv += `INVOICE\n`;
    csv += `Invoice Number: ${invoice.invoice_number}\n`;
    csv += `Invoice Date: ${formatDate(invoice.invoice_date)}\n`;
    csv += `Billing Period: ${formatDate(invoice.billing_period_start)} - ${formatDate(invoice.billing_period_end)}\n`;
    csv += `Payment Terms: ${invoice.payment_terms}\n`;
    csv += `Payment Due: ${formatDate(invoice.payment_due_date)}\n`;
    csv += `Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}\n\n`;

    csv += `Bill To:\n`;
    csv += `${invoice.organization?.name || ''}\n`;
    if (invoice.organization?.address_line1) {
      csv += `${invoice.organization.address_line1}${invoice.organization.address_line2 ? ', ' + invoice.organization.address_line2 : ''}\n`;
    }
    if (invoice.organization?.city) {
      csv += `${invoice.organization.city}, ${invoice.organization.province} ${invoice.organization.postal_code}\n`;
    }
    if (invoice.organization?.country) csv += `${invoice.organization.country}\n`;
    if (invoice.organization?.vat_number) csv += `VAT No: ${invoice.organization.vat_number}`;
    if (invoice.organization?.company_registration_number) csv += ` | Reg No: ${invoice.organization.company_registration_number}`;
    csv += `\n\n`;

    csv += `Line Items\n`;
    csv += `Description,Quantity,Unit Price,Total\n`;
    items.forEach((item) => {
      csv += `"${item.description}",${item.quantity},${item.unit_price.toFixed(2)},${item.line_total.toFixed(2)}\n`;
    });

    csv += `\n`;
    csv += `Subtotal,${invoice.subtotal.toFixed(2)}\n`;
    csv += `VAT (15%),${invoice.vat_amount.toFixed(2)}\n`;
    csv += `Total,${invoice.total_amount.toFixed(2)}\n`;
    csv += `Amount Paid,${invoice.amount_paid.toFixed(2)}\n`;
    csv += `Amount Outstanding,${invoice.amount_outstanding.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoice.invoice_number}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportAllInvoicesToCSV = () => {
    let csv = 'Invoice Number,Date,Organization,Billing Period Start,Billing Period End,Payment Terms,Due Date,Subtotal,VAT,Total,Amount Paid,Amount Outstanding,Status\n';

    filteredInvoices.forEach((invoice) => {
      csv += `${invoice.invoice_number},`;
      csv += `${formatDate(invoice.invoice_date)},`;
      csv += `"${invoice.organization?.name || ''}",`;
      csv += `${formatDate(invoice.billing_period_start)},`;
      csv += `${formatDate(invoice.billing_period_end)},`;
      csv += `"${invoice.payment_terms}",`;
      csv += `${formatDate(invoice.payment_due_date)},`;
      csv += `${invoice.subtotal.toFixed(2)},`;
      csv += `${invoice.vat_amount.toFixed(2)},`;
      csv += `${invoice.total_amount.toFixed(2)},`;
      csv += `${invoice.amount_paid.toFixed(2)},`;
      csv += `${invoice.amount_outstanding.toFixed(2)},`;
      csv += `${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_invoices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <>
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            html, body {
              height: auto !important;
              overflow: visible !important;
            }
            #invoice-detail {
              box-shadow: none !important;
              page-break-after: avoid !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            #invoice-detail > div {
              padding: 1rem !important;
            }
            .space-y-4 {
              height: auto !important;
            }
            .mb-8 {
              margin-bottom: 1rem !important;
            }
            .p-8 {
              padding: 1rem !important;
            }
            .pt-6 {
              padding-top: 0.75rem !important;
            }
            @page {
              margin: 0.5cm;
              size: A4;
            }
            table {
              font-size: 0.875rem !important;
            }
          }
        `}</style>

        <div className="space-y-4">
          <div className="flex items-center justify-between no-print">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Invoices
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => exportInvoiceToCSV(selectedInvoice, lineItems)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={printInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print/PDF
              </button>
              <button
                onClick={() => markAsPaid(selectedInvoice.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
            </div>
          </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden" id="invoice-detail">
          {managementOrg && (
            <div className="p-8 border-b border-gray-300">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{managementOrg.name}</h1>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>{managementOrg.address_line1}{managementOrg.address_line2 && `, ${managementOrg.address_line2}`}</p>
                    <p>{managementOrg.city}, {managementOrg.province} {managementOrg.postal_code}</p>
                    {managementOrg.country && <p>{managementOrg.country}</p>}
                    {managementOrg.phone_number && <p>Phone: {managementOrg.phone_number}</p>}
                    <div className="flex gap-4 mt-2 font-medium">
                      {managementOrg.vat_number && <p>VAT No: {managementOrg.vat_number}</p>}
                      {managementOrg.company_registration_number && <p>Reg No: {managementOrg.company_registration_number}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="/MyFuelApp_logo.png"
                    alt="MyFuelApp Logo"
                    className="h-28 w-auto"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Invoice Number:</span> {selectedInvoice.invoice_number}</p>
                  <p><span className="font-semibold">Invoice Date:</span> {formatDate(selectedInvoice.invoice_date)}</p>
                  <p><span className="font-semibold">Billing Period:</span> {formatDate(selectedInvoice.billing_period_start)} - {formatDate(selectedInvoice.billing_period_end)}</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedInvoice.status)}
                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-semibold text-gray-900">Payment Terms:</p>
                  <p className="text-gray-600">{selectedInvoice.payment_terms}</p>
                  <p className="text-red-600 font-bold mt-2">Payment Due: {formatDate(selectedInvoice.payment_due_date)}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-medium text-gray-900">{selectedInvoice.organization?.name}</p>
                {selectedInvoice.organization?.address_line1 && (
                  <p>{selectedInvoice.organization.address_line1}{selectedInvoice.organization.address_line2 && `, ${selectedInvoice.organization.address_line2}`}</p>
                )}
                {selectedInvoice.organization?.city && (
                  <p>{selectedInvoice.organization.city}, {selectedInvoice.organization.province} {selectedInvoice.organization.postal_code}</p>
                )}
                {selectedInvoice.organization?.country && <p>{selectedInvoice.organization.country}</p>}
                <div className="flex gap-4 mt-2 font-medium">
                  {selectedInvoice.organization?.vat_number && <p>VAT No: {selectedInvoice.organization.vat_number}</p>}
                  {selectedInvoice.organization?.company_registration_number && <p>Reg No: {selectedInvoice.organization.company_registration_number}</p>}
                </div>
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
                {selectedInvoice.amount_paid > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(selectedInvoice.amount_paid)}</span>
                  </div>
                )}
                {selectedInvoice.amount_outstanding > 0 && (
                  <div className="flex justify-between text-sm text-red-600 font-medium">
                    <span>Amount Outstanding:</span>
                    <span>{formatCurrency(selectedInvoice.amount_outstanding)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setCurrentView('fee')}
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fee Invoices</h3>
                <p className="text-sm text-gray-600">Monthly subscription and service fees</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('fuel')}
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Fuel className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fuel Invoices</h3>
                <p className="text-sm text-gray-600">Individual fuel transaction invoices</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'fee') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fee Invoices</h2>
              <p className="text-sm text-gray-600">Monthly subscription and service fees</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('menu')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {filteredInvoices.length > 0 && (
              <button
                onClick={exportAllInvoicesToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export All to CSV
              </button>
            )}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Generate Monthly Invoices
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

      <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Organization
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an organization...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Search by Billing Period
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by billing period (e.g., 2024-01)..."
                  value={billingPeriodSearch}
                  onChange={(e) => setBillingPeriodSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
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
              {!hasSearched ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="text-gray-600 font-medium">Please select an organization</p>
                        <p className="text-sm text-gray-500 mt-1">Select an organization from the dropdown above to view their invoices</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
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

        {filteredInvoices.length > 0 && (
          <div className="flex gap-4 mt-4">
            <div className="bg-white rounded-lg shadow-md p-4 flex-1">
              <div className="text-sm text-gray-600 mb-1">Total Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 flex-1">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
            </div>
          </div>
        )}
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
      </>
      </div>
    );
  }

  if (currentView === 'fuel') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Fuel Invoices</h2>
              <p className="text-sm text-gray-600">Individual fuel transaction invoices</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('menu')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <FuelInvoicesTab />
      </div>
    );
  }

  return null;
}

interface FuelInvoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_date: string;
  transaction_date: string;
  fuel_type: string;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  vehicle_registration: string;
  driver_name: string;
  garage_name: string;
  garage_address: string;
  garage_vat_number?: string;
  odometer_reading: number;
  oil_quantity?: number;
  oil_unit_price?: number;
  oil_total_amount?: number;
  oil_type?: string;
  oil_brand?: string;
  organization?: {
    name: string;
    vat_number?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  };
}

function FuelInvoicesTab() {
  const [fuelInvoices, setFuelInvoices] = useState<FuelInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<FuelInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState<'organization' | 'invoice'>('organization');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchInvoices = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      let query = supabase
        .from('fuel_transaction_invoices')
        .select(`
          *,
          organization:organizations(
            name,
            vat_number,
            address_line1,
            address_line2,
            city,
            province,
            postal_code
          )
        `);

      if (searchType === 'organization') {
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`);

        if (orgError) throw orgError;

        if (!orgs || orgs.length === 0) {
          setFuelInvoices([]);
          setLoading(false);
          return;
        }

        const orgIds = orgs.map(o => o.id);
        query = query.in('organization_id', orgIds);
      } else {
        query = query.ilike('invoice_number', `%${searchTerm}%`);
      }

      const { data, error: invoicesError } = await query.order('transaction_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      setFuelInvoices(data || []);
    } catch (err: any) {
      setError('Failed to search invoices: ' + err.message);
      setFuelInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (fuelInvoices.length === 0) return;

    const headers = ['Invoice #', 'Transaction Date', 'Organization', 'Vehicle', 'Driver', 'Garage', 'Fuel Type', 'Liters', 'Price/Liter', 'Fuel Amount', 'Oil Amount', 'Total Amount'];
    const rows = fuelInvoices.map(inv => [
      inv.invoice_number,
      new Date(inv.transaction_date).toLocaleDateString('en-ZA'),
      inv.organization?.name || '',
      inv.vehicle_registration,
      inv.driver_name,
      inv.garage_name,
      inv.fuel_type,
      parseFloat(inv.liters.toString()).toFixed(2),
      parseFloat(inv.price_per_liter.toString()).toFixed(2),
      (parseFloat(inv.liters.toString()) * parseFloat(inv.price_per_liter.toString())).toFixed(2),
      (inv.oil_total_amount ? parseFloat(inv.oil_total_amount.toString()).toFixed(2) : '0.00'),
      parseFloat(inv.total_amount.toString()).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printInvoice = (invoice: FuelInvoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fuelAmount = parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString());

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fuel Invoice ${invoice.invoice_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.5;
              color: #374151;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px solid #111827;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0 0 4px 0;
              color: #111827;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              color: #4b5563;
              margin-top: 2px;
              font-size: 12px;
            }
            .section {
              margin-bottom: 10px;
            }
            .section h3 {
              font-size: 12px;
              font-weight: 700;
              color: #6b7280;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .section-content {
              background-color: #f9fafb;
              border-radius: 4px;
              padding: 10px;
            }
            .info-row {
              display: inline-block;
              margin-right: 30px;
              margin-bottom: 3px;
            }
            .info-row-spread {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-label {
              color: #6b7280;
              font-size: 11px;
            }
            .info-value {
              font-weight: 600;
              color: #111827;
              margin-left: 4px;
            }
            .total-section {
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
              margin-top: 8px;
            }
            .total-box {
              background-color: #eff6ff;
              border-radius: 4px;
              padding: 10px;
            }
            .total-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
            }
            .total-amount {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
            }
            .footer {
              margin-top: 10px;
              text-align: center;
              font-size: 11px;
              color: #4b5563;
            }
            .footer p {
              margin: 3px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              padding: 4px 8px;
              font-size: 11px;
              font-weight: 500;
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
            }
            th.right {
              text-align: right;
            }
            td {
              padding: 5px 8px;
              font-weight: 600;
              font-size: 11px;
            }
            td.right {
              text-align: right;
            }
            @media print {
              body { padding: 15px; }
              @page { margin: 1cm; }
              .section-content {
                background-color: #f9fafb !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .total-box {
                background-color: #eff6ff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FUEL TRANSACTION INVOICE</h1>
            <p>Fuel Empowerment Systems (Pty) Ltd</p>
          </div>

          <div class="section">
            <h3>Invoice</h3>
            <div class="section-content">
              <div class="info-row-spread">
                <div>
                  <span class="info-label">Number:</span>
                  <span class="info-value">${invoice.invoice_number}</span>
                </div>
                <div>
                  <span class="info-label">Date:</span>
                  <span class="info-value">${new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}</span>
                </div>
                <div>
                  <span class="info-label">Transaction Date & Time:</span>
                  <span class="info-value">${new Date(invoice.transaction_date).toLocaleDateString('en-ZA')} ${new Date(invoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Organization</h3>
            <div class="section-content">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${invoice.organization?.name || 'N/A'}</span>
              </div>
              ${invoice.organization?.vat_number ? `<div class="info-row">
                <span class="info-label">VAT Number:</span>
                <span class="info-value">${invoice.organization.vat_number}</span>
              </div>` : ''}
            </div>
          </div>

          <div class="section">
            <h3>Vehicle & Driver</h3>
            <div class="section-content">
              <div class="info-row-spread">
                <div>
                  <span class="info-label">Vehicle:</span>
                  <span class="info-value">${invoice.vehicle_registration}</span>
                </div>
                <div>
                  <span class="info-label">Driver:</span>
                  <span class="info-value">${invoice.driver_name}</span>
                </div>
                <div>
                  <span class="info-label">Odometer:</span>
                  <span class="info-value">${invoice.odometer_reading.toLocaleString()} km</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Fuel Station</h3>
            <div class="section-content">
              <div class="info-row-spread">
                <div>
                  <span class="info-label">Station:</span>
                  <span class="info-value">${invoice.garage_name}</span>
                </div>
                ${invoice.garage_vat_number ? `<div>
                  <span class="info-label">VAT no:</span>
                  <span class="info-value">${invoice.garage_vat_number}</span>
                </div>` : ''}
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${invoice.garage_address}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Fuel Details</h3>
            <div class="section-content">
              <table>
                <tr>
                  <th>Fuel Type</th>
                  <th class="right">Liters</th>
                  <th class="right">Price per Liter</th>
                  <th class="right">Fuel Amount</th>
                </tr>
                <tr>
                  <td>${invoice.fuel_type}</td>
                  <td class="right">${parseFloat(invoice.liters.toString()).toFixed(2)}</td>
                  <td class="right">R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}</td>
                  <td class="right">R ${fuelAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          ${invoice.oil_quantity && parseFloat(invoice.oil_quantity.toString()) > 0 ? `
          <div class="section">
            <h3>Oil Purchase</h3>
            <div class="section-content">
              <table>
                <tr>
                  <th>Oil Type</th>
                  <th class="right">Quantity</th>
                  <th class="right">Unit Price (Incl VAT)</th>
                  <th class="right">Oil Amount (Incl VAT)</th>
                </tr>
                <tr>
                  <td>${invoice.oil_type || 'N/A'}${invoice.oil_brand ? ` (${invoice.oil_brand})` : ''}</td>
                  <td class="right">${parseFloat(invoice.oil_quantity.toString()).toFixed(0)} Unit${parseFloat(invoice.oil_quantity.toString()) > 1 ? 's' : ''}</td>
                  <td class="right">R ${parseFloat(invoice.oil_unit_price?.toString() || '0').toFixed(2)}</td>
                  <td class="right">R ${parseFloat(invoice.oil_total_amount?.toString() || '0').toFixed(2)}</td>
                </tr>
              </table>
              <div class="total-section">
                <div class="info-row">
                  <span class="info-label">Amount of VAT included:</span>
                  <span class="info-value">R ${((parseFloat(invoice.oil_total_amount?.toString() || '0') - (parseFloat(invoice.oil_total_amount?.toString() || '0') / 1.15))).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="total-box">
              <div class="total-content">
                <span class="total-label">TOTAL AMOUNT:</span>
                <span class="total-amount">R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This invoice is for accounting and tax compliance purposes.</p>
            <p>Thank you for your business.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Search Fuel Invoices</h3>
            <p className="text-sm text-gray-600 mt-1">Search by organization name or invoice number</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'organization' | 'invoice')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="organization">Organization Name</option>
                <option value="invoice">Invoice Number</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'organization' ? 'Organization Name' : 'Invoice Number'}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchType === 'organization' ? 'Enter organization name...' : 'Enter invoice number...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchInvoices()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={searchInvoices}
                  disabled={loading || !searchTerm.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasSearched && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({fuelInvoices.length})
              </h3>
            </div>
            {fuelInvoices.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Liters</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fuelInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No fuel invoices found matching your search
                    </td>
                  </tr>
                ) : (
                  fuelInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(invoice.transaction_date).toLocaleDateString('en-ZA')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.organization?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.vehicle_registration}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.driver_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.garage_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.fuel_type}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {parseFloat(invoice.liters.toString()).toFixed(2)} L
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        R {parseFloat(invoice.total_amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printInvoice(invoice)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Fuel Invoice Details</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="border-b-2 border-gray-900 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 text-center">FUEL TRANSACTION INVOICE</h1>
                <p className="text-center text-gray-600 mt-2 text-base">Fuel Empowerment Systems (Pty) Ltd</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">INVOICE</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-base">
                    <div>
                      <span className="text-gray-600">Number:</span>
                      <span className="font-bold ml-1">{selectedInvoice.invoice_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-bold ml-1">{new Date(selectedInvoice.invoice_date).toLocaleDateString('en-ZA')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Transaction Date & Time:</span>
                      <span className="font-bold ml-1">
                        {new Date(selectedInvoice.transaction_date).toLocaleDateString('en-ZA')} {new Date(selectedInvoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">ORGANIZATION</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-base">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-bold ml-1">{selectedInvoice.organization?.name || 'N/A'}</span>
                  </div>
                  {selectedInvoice.organization?.vat_number && (
                    <div className="text-base mt-2">
                      <span className="text-gray-600">VAT Number:</span>
                      <span className="font-bold ml-1">{selectedInvoice.organization.vat_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">VEHICLE & DRIVER</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-base">
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-bold ml-1">{selectedInvoice.vehicle_registration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Driver:</span>
                      <span className="font-bold ml-1">{selectedInvoice.driver_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Odometer:</span>
                      <span className="font-bold ml-1">{selectedInvoice.odometer_reading.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">FUEL STATION</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center text-base">
                    <div>
                      <span className="text-gray-600">Station:</span>
                      <span className="font-bold ml-1">{selectedInvoice.garage_name}</span>
                    </div>
                    {selectedInvoice.garage_vat_number && (
                      <div>
                        <span className="text-gray-600">VAT Number:</span>
                        <span className="font-bold ml-1">{selectedInvoice.garage_vat_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-base">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-bold ml-1">{selectedInvoice.garage_address}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">FUEL DETAILS</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-3 mb-2 text-sm font-medium text-gray-600">
                    <div>Fuel Type</div>
                    <div className="text-right">Liters</div>
                    <div className="text-right">Price per Liter</div>
                    <div className="text-right">Fuel Amount</div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-base font-bold">
                    <div>{selectedInvoice.fuel_type}</div>
                    <div className="text-right">{parseFloat(selectedInvoice.liters.toString()).toFixed(2)}</div>
                    <div className="text-right">R {parseFloat(selectedInvoice.price_per_liter.toString()).toFixed(2)}</div>
                    <div className="text-right">R {(parseFloat(selectedInvoice.liters.toString()) * parseFloat(selectedInvoice.price_per_liter.toString())).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {selectedInvoice.oil_quantity && parseFloat(selectedInvoice.oil_quantity.toString()) > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">OIL PURCHASE</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="grid grid-cols-4 gap-3 mb-2 text-sm font-medium text-gray-600">
                        <div>Oil Type</div>
                        <div className="text-right">Quantity</div>
                        <div className="text-right">Unit Price (Incl VAT)</div>
                        <div className="text-right">Oil Amount (Incl VAT)</div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-base font-bold">
                        <div>{selectedInvoice.oil_type || 'N/A'}{selectedInvoice.oil_brand ? ` (${selectedInvoice.oil_brand})` : ''}</div>
                        <div className="text-right">{parseFloat(selectedInvoice.oil_quantity.toString()).toFixed(0)} Unit{parseFloat(selectedInvoice.oil_quantity.toString()) > 1 ? 's' : ''}</div>
                        <div className="text-right">R {parseFloat(selectedInvoice.oil_unit_price?.toString() || '0').toFixed(2)}</div>
                        <div className="text-right">R {parseFloat(selectedInvoice.oil_total_amount?.toString() || '0').toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Amount of VAT included:</span>
                        <span className="font-bold">R {((parseFloat(selectedInvoice.oil_total_amount?.toString() || '0') - (parseFloat(selectedInvoice.oil_total_amount?.toString() || '0') / 1.15))).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">TOTAL AMOUNT:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      R {parseFloat(selectedInvoice.total_amount.toString()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-base text-gray-600 text-center">
                <p>This invoice is for accounting and tax compliance purposes.</p>
                <p className="mt-2">Thank you for your business.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => printInvoice(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FileText, Search, Calendar, DollarSign, Fuel, Download, Eye, AlertCircle, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FuelInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  transaction_date: string;
  vehicle_registration: string;
  driver_name: string;
  garage_name: string;
  garage_address: string;
  fuel_type: string;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  odometer_reading: number;
  email_sent: boolean;
  email_sent_at: string | null;
}

interface ClientFuelInvoicesProps {
  onNavigate?: (view: string) => void;
}

export default function ClientFuelInvoices({ onNavigate }: ClientFuelInvoicesProps) {
  const [invoices, setInvoices] = useState<FuelInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<FuelInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<FuelInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, startDate, endDate]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error: invoicesError } = await supabase
        .from('fuel_transaction_invoices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(term) ||
          inv.vehicle_registration.toLowerCase().includes(term) ||
          inv.driver_name.toLowerCase().includes(term) ||
          inv.garage_name.toLowerCase().includes(term)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((inv) => new Date(inv.invoice_date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((inv) => new Date(inv.invoice_date) <= end);
    }

    setFilteredInvoices(filtered);
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0);
  };

  const getTotalLiters = () => {
    return filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.liters.toString()), 0);
  };

  const printInvoice = (invoice: FuelInvoice) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; color: #2563eb; font-size: 24px; }
            .section { margin: 20px 0; }
            .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .info-label { font-weight: bold; }
            .total { font-size: 1.2em; font-weight: bold; color: #2563eb; margin-top: 20px; }
            @media print {
              body { padding: 20px; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FUEL TRANSACTION INVOICE</h1>
            <p>MyFuelApp Management System</p>
          </div>

          <div class="section">
            <h3>Invoice Details</h3>
            <div class="info-row">
              <span class="info-label">Invoice Number:</span>
              <span>${invoice.invoice_number}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Date:</span>
              <span>${new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Transaction Date:</span>
              <span>${new Date(invoice.transaction_date).toLocaleDateString('en-ZA')}</span>
            </div>
          </div>

          <div class="section">
            <h3>Vehicle & Driver Information</h3>
            <div class="info-row">
              <span class="info-label">Vehicle Registration:</span>
              <span>${invoice.vehicle_registration}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Driver:</span>
              <span>${invoice.driver_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Odometer Reading:</span>
              <span>${invoice.odometer_reading.toLocaleString()} km</span>
            </div>
          </div>

          <div class="section">
            <h3>Fuel Station</h3>
            <div class="info-row">
              <span class="info-label">Station:</span>
              <span>${invoice.garage_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span>${invoice.garage_address}</span>
            </div>
          </div>

          <div class="section">
            <h3>Fuel Details</h3>
            <div class="info-row">
              <span class="info-label">Fuel Type:</span>
              <span>${invoice.fuel_type}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Liters:</span>
              <span>${parseFloat(invoice.liters.toString()).toFixed(2)} L</span>
            </div>
            <div class="info-row">
              <span class="info-label">Price per Liter:</span>
              <span>R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <div class="info-row total">
              <span>TOTAL AMOUNT:</span>
              <span>R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}</span>
            </div>
          </div>

          <div class="section" style="margin-top: 40px; font-size: 0.9em; color: #666;">
            <p>This invoice is for accounting and tax compliance purposes.</p>
            <p>Thank you for your business.</p>
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Vehicle', 'Driver', 'Garage', 'Fuel Type', 'Liters', 'Price/L', 'Total', 'Odometer'];
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number,
      new Date(inv.invoice_date).toLocaleDateString('en-ZA'),
      inv.vehicle_registration,
      inv.driver_name,
      inv.garage_name,
      inv.fuel_type,
      parseFloat(inv.liters.toString()).toFixed(2),
      parseFloat(inv.price_per_liter.toString()).toFixed(2),
      parseFloat(inv.total_amount.toString()).toFixed(2),
      inv.odometer_reading.toString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fuel-invoices-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSingleInvoiceToCSV = (invoice: FuelInvoice) => {
    const csvData = [
      ['Field', 'Value'],
      ['Invoice Number', invoice.invoice_number],
      ['Invoice Date', new Date(invoice.invoice_date).toLocaleDateString('en-ZA')],
      ['Transaction Date', new Date(invoice.transaction_date).toLocaleDateString('en-ZA')],
      [''],
      ['Vehicle Registration', invoice.vehicle_registration],
      ['Driver', invoice.driver_name],
      ['Odometer Reading', `${invoice.odometer_reading.toLocaleString()} km`],
      [''],
      ['Fuel Station', invoice.garage_name],
      ['Station Address', invoice.garage_address],
      [''],
      ['Fuel Type', invoice.fuel_type],
      ['Liters', parseFloat(invoice.liters.toString()).toFixed(2)],
      ['Price per Liter', `R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}`],
      [''],
      ['TOTAL AMOUNT', `R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}`]
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fuel-invoice-${invoice.invoice_number}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportInvoiceToPDF = (invoice: FuelInvoice) => {
    printInvoice(invoice);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fuel invoices...</p>
        </div>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportSingleInvoiceToCSV(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportInvoiceToPDF(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export PDF
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

          <div className="border-b-2 border-gray-900 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">FUEL TRANSACTION INVOICE</h1>
            <p className="text-center text-gray-600 mt-2">MyFuelApp Management System</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-semibold">{selectedInvoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="font-semibold">{new Date(selectedInvoice.invoice_date).toLocaleDateString('en-ZA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Date:</span>
                    <span className="font-semibold">{new Date(selectedInvoice.transaction_date).toLocaleDateString('en-ZA')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vehicle & Driver</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold">{selectedInvoice.vehicle_registration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-semibold">{selectedInvoice.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Odometer:</span>
                    <span className="font-semibold">{selectedInvoice.odometer_reading.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Fuel Station</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-gray-600">Station:</span>
                    <p className="font-semibold">{selectedInvoice.garage_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-semibold">{selectedInvoice.garage_address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Fuel Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fuel Type:</span>
                    <span className="font-semibold">{selectedInvoice.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liters:</span>
                    <span className="font-semibold">{parseFloat(selectedInvoice.liters.toString()).toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Liter:</span>
                    <span className="font-semibold">R {parseFloat(selectedInvoice.price_per_liter.toString()).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <div className="mt-6 text-sm text-gray-600 text-center">
            <p>This invoice is for accounting and tax compliance purposes.</p>
            <p className="mt-2">Thank you for your business.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Fuel className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Fuel Invoices</h2>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('invoices-menu')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Invoices Menu
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Invoices</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredInvoices.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total Liters</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{getTotalLiters().toFixed(2)} L</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Total Amount</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">R {getTotalAmount().toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No fuel invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}
                    </td>
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
    </div>
  );
}

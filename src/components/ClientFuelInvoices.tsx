import { useState, useEffect } from 'react';
import { FileText, Search, Calendar, DollarSign, Fuel, Download, Eye, AlertCircle, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

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
  total_amount: number;
  odometer_reading: number;
  email_sent: boolean;
  email_sent_at: string | null;
  oil_quantity?: number;
  oil_unit_price?: number;
  oil_total_amount?: number;
  oil_type?: string;
  oil_brand?: string;
  fuel_amount?: number;
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
            <h3>Invoice Details</h3>
            <div class="section-content">
              <div class="info-row-spread">
                <div>
                  <span class="info-label">Number:</span>
                  <span class="info-value">${invoice.invoice_number}</span>
                </div>
                <div>
                  <span class="info-label">Vehicle:</span>
                  <span class="info-value">${invoice.vehicle_registration}</span>
                </div>
                <div>
                  <span class="info-label">Station:</span>
                  <span class="info-value">${invoice.garage_name}</span>
                </div>
              </div>
              <div class="info-row-spread" style="margin-top: 6px;">
                <div>
                  <span class="info-label">Date:</span>
                  <span class="info-value">${new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}</span>
                </div>
                <div>
                  <span class="info-label">Driver:</span>
                  <span class="info-value">${invoice.driver_name}</span>
                </div>
                <div>
                  <span class="info-label">Address:</span>
                  <span class="info-value">${invoice.garage_address}</span>
                </div>
              </div>
              <div class="info-row-spread" style="margin-top: 6px;">
                <div>
                  <span class="info-label">Trans. Date:</span>
                  <span class="info-value">${new Date(invoice.transaction_date).toLocaleDateString('en-ZA')} ${new Date(invoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  <span class="info-label">Odometer:</span>
                  <span class="info-value">${invoice.odometer_reading.toLocaleString()} km</span>
                </div>
                ${invoice.garage_vat_number ? `<div>
                  <span class="info-label">VAT no:</span>
                  <span class="info-value">${invoice.garage_vat_number}</span>
                </div>` : '<div></div>'}
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
                  <td class="right">R ${(parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString())).toFixed(2)}</td>
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
                  <td class="right">R ${parseFloat(invoice.oil_unit_price.toString()).toFixed(2)}</td>
                  <td class="right">R ${parseFloat(invoice.oil_total_amount.toString()).toFixed(2)}</td>
                </tr>
              </table>
              <div style="padding-top: 6px; margin-top: 6px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 10px;">
                <span style="color: #4b5563;">Amount of VAT included:</span>
                <span style="font-weight: 600;">R ${(parseFloat(invoice.oil_total_amount.toString()) - (parseFloat(invoice.oil_total_amount.toString()) / 1.15)).toFixed(2)}</span>
              </div>
            </div>
          </div>` : ''}

          <div class="total-section">
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
    const fuelAmount = parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString());
    const hasOil = invoice.oil_quantity && parseFloat(invoice.oil_quantity.toString()) > 0;

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
      ...(invoice.garage_vat_number ? [['Station VAT Number', invoice.garage_vat_number]] : []),
      [''],
      ['Fuel Type', invoice.fuel_type],
      ['Liters', parseFloat(invoice.liters.toString()).toFixed(2)],
      ['Price per Liter', `R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}`],
      ['Fuel Amount', `R ${fuelAmount.toFixed(2)}`],
      ...(hasOil ? [
        [''],
        ['Oil Type', `${invoice.oil_type || 'N/A'}${invoice.oil_brand ? ` (${invoice.oil_brand})` : ''}`],
        ['Oil Quantity', `${parseFloat(invoice.oil_quantity.toString()).toFixed(2)} units`],
        ['Oil Unit Price (incl VAT)', `R ${parseFloat(invoice.oil_unit_price?.toString() || '0').toFixed(2)}`],
        ['Oil Amount (incl VAT)', `R ${parseFloat(invoice.oil_total_amount?.toString() || '0').toFixed(2)}`]
      ] : []),
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
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FUEL TRANSACTION INVOICE', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 7;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Fuel Empowerment Systems (Pty) Ltd', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    pdf.setDrawColor(17, 24, 39);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    const columnWidth = (contentWidth - 10) / 3;
    const col1X = margin;
    const col2X = margin + columnWidth + 5;
    const col3X = margin + (columnWidth * 2) + 10;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('INVOICE', col1X, yPosition);
    pdf.text('VEHICLE & DRIVER', col2X, yPosition);
    pdf.text('FUEL STATION', col3X, yPosition);

    yPosition += 3;

    pdf.setFillColor(249, 250, 251);
    pdf.rect(col1X, yPosition, columnWidth, 18, 'F');
    pdf.rect(col2X, yPosition, columnWidth, 18, 'F');
    pdf.rect(col3X, yPosition, columnWidth, 18, 'F');

    yPosition += 4;
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);

    pdf.text('Number:', col1X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(invoice.invoice_number, col1X + columnWidth - 2, yPosition, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Vehicle:', col2X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(invoice.vehicle_registration, col2X + columnWidth - 2, yPosition, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Station:', col3X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    const stationText = pdf.splitTextToSize(invoice.garage_name, columnWidth - 4);
    pdf.text(stationText[0], col3X + columnWidth - 2, yPosition, { align: 'right' });

    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Date:', col1X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(new Date(invoice.invoice_date).toLocaleDateString('en-ZA'), col1X + columnWidth - 2, yPosition, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Driver:', col2X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    const driverText = pdf.splitTextToSize(invoice.driver_name, columnWidth - 4);
    pdf.text(driverText[0], col2X + columnWidth - 2, yPosition, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Address:', col3X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    const addressText = pdf.splitTextToSize(invoice.garage_address, columnWidth - 4);
    pdf.text(addressText[0], col3X + columnWidth - 2, yPosition, { align: 'right' });

    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Trans. Date:', col1X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(new Date(invoice.transaction_date).toLocaleDateString('en-ZA'), col1X + columnWidth - 2, yPosition, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Odometer:', col2X + 2, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(`${invoice.odometer_reading.toLocaleString()} km`, col2X + columnWidth - 2, yPosition, { align: 'right' });

    if (invoice.garage_vat_number) {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('VAT no:', col3X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(invoice.garage_vat_number, col3X + columnWidth - 2, yPosition, { align: 'right' });
    }

    yPosition += 8;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('FUEL DETAILS', margin, yPosition);

    yPosition += 4;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPosition, contentWidth, 12, 'F');

    yPosition += 4;
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Fuel Type', margin + 3, yPosition);
    pdf.text('Liters', margin + contentWidth * 0.35, yPosition, { align: 'right' });
    pdf.text('Price per Liter', margin + contentWidth * 0.6, yPosition, { align: 'right' });
    pdf.text('Fuel Amount', margin + contentWidth - 3, yPosition, { align: 'right' });

    yPosition += 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(invoice.fuel_type, margin + 3, yPosition);
    pdf.text(parseFloat(invoice.liters.toString()).toFixed(2), margin + contentWidth * 0.35, yPosition, { align: 'right' });
    pdf.text(`R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}`, margin + contentWidth * 0.6, yPosition, { align: 'right' });
    const fuelAmount = parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString());
    pdf.text(`R ${fuelAmount.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

    yPosition += 8;

    const hasOil = invoice.oil_quantity && parseFloat(invoice.oil_quantity.toString()) > 0;
    if (hasOil) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(107, 114, 128);
      pdf.text('OIL PURCHASE', margin, yPosition);

      yPosition += 4;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');

      yPosition += 4;
      pdf.setFontSize(7);
      pdf.setTextColor(75, 85, 99);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Oil Type', margin + 3, yPosition);
      pdf.text('Quantity', margin + contentWidth * 0.35, yPosition, { align: 'right' });
      pdf.text('Unit Price (Incl VAT)', margin + contentWidth * 0.6, yPosition, { align: 'right' });
      pdf.text('Oil Amount (Incl VAT)', margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 4;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      const oilTypeText = `${invoice.oil_type || 'N/A'}${invoice.oil_brand ? ` (${invoice.oil_brand})` : ''}`;
      pdf.text(oilTypeText, margin + 3, yPosition);
      pdf.text(`${parseFloat(invoice.oil_quantity.toString()).toFixed(0)} Unit${parseFloat(invoice.oil_quantity.toString()) > 1 ? 's' : ''}`, margin + contentWidth * 0.35, yPosition, { align: 'right' });
      pdf.text(`R ${parseFloat(invoice.oil_unit_price?.toString() || '0').toFixed(2)}`, margin + contentWidth * 0.6, yPosition, { align: 'right' });
      pdf.text(`R ${parseFloat(invoice.oil_total_amount?.toString() || '0').toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 6;
      pdf.setDrawColor(209, 213, 219);
      pdf.setLineWidth(0.3);
      pdf.line(margin + 3, yPosition, margin + contentWidth - 3, yPosition);

      yPosition += 4;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Amount of VAT included:', margin + 3, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      const oilVAT = parseFloat(invoice.oil_total_amount?.toString() || '0') - (parseFloat(invoice.oil_total_amount?.toString() || '0') / 1.15);
      pdf.text(`R ${oilVAT.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 8;
    }

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 10;
    pdf.setFillColor(239, 246, 255);
    pdf.rect(margin, yPosition, contentWidth, 20, 'F');

    yPosition += 12;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text('TOTAL AMOUNT:', margin + 5, yPosition);

    pdf.setFontSize(16);
    pdf.setTextColor(37, 99, 235);
    pdf.text(`R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });

    yPosition += 15;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('This invoice is for accounting and tax compliance purposes.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Thank you for your business.', pageWidth / 2, yPosition, { align: 'center' });

    pdf.save(`fuel-invoice-${invoice.invoice_number}.pdf`);
  };

  const generateInvoiceHTML = (invoice: FuelInvoice) => {
    return `
      <div class="invoice-page" style="font-size: 12px; line-height: 1.5;">
        <div class="header" style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #111827; padding-bottom: 10px;">
          <h1 style="margin: 0 0 4px 0; color: #111827; font-size: 24px; font-weight: bold;">FUEL TRANSACTION INVOICE</h1>
          <p style="color: #4b5563; margin-top: 2px; font-size: 12px;">Fuel Empowerment Systems (Pty) Ltd</p>
        </div>

        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">INVOICE</h3>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="color: #6b7280; font-size: 11px;">Number:</span>
                <span style="font-weight: 700; margin-left: 4px;">${invoice.invoice_number}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 11px;">Date:</span>
                <span style="font-weight: 700; margin-left: 4px;">${new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 11px;">Transaction Date & Time:</span>
                <span style="font-weight: 700; margin-left: 4px;">${new Date(invoice.transaction_date).toLocaleDateString('en-ZA')} ${new Date(invoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">VEHICLE & DRIVER</h3>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="color: #6b7280; font-size: 11px;">Vehicle:</span>
                <span style="font-weight: 700; margin-left: 4px;">${invoice.vehicle_registration}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 11px;">Driver:</span>
                <span style="font-weight: 700; margin-left: 4px;">${invoice.driver_name}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 11px;">Odometer:</span>
                <span style="font-weight: 700; margin-left: 4px;">${invoice.odometer_reading.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">FUEL STATION</h3>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px; font-size: 12px;">
            <span style="display: inline-block; margin-right: 30px;">
              <span style="color: #6b7280; font-size: 11px;">Station:</span>
              <span style="font-weight: 700; margin-left: 4px;">${invoice.garage_name}</span>
            </span>
            <span style="display: inline-block; margin-right: 30px;">
              <span style="color: #6b7280; font-size: 11px;">Address:</span>
              <span style="font-weight: 700; margin-left: 4px;">${invoice.garage_address}</span>
            </span>
            ${invoice.garage_vat_number ? `
            <span style="display: inline-block;">
              <span style="color: #6b7280; font-size: 11px;">VAT Number:</span>
              <span style="font-weight: 700; margin-left: 4px;">${invoice.garage_vat_number}</span>
            </span>
            ` : ''}
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">FUEL DETAILS</h3>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Fuel Type</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Liters</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Price per Liter</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Fuel Amount</th>
              </tr>
              <tr>
                <td style="padding: 5px 8px; font-weight: 600; font-size: 11px;">${invoice.fuel_type}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">${parseFloat(invoice.liters.toString()).toFixed(2)}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">R ${(parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString())).toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        ${invoice.oil_quantity && parseFloat(invoice.oil_quantity.toString()) > 0 ? `
        <div style="margin-bottom: 10px;">
          <h3 style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">OIL PURCHASE</h3>
          <div style="background: #f9fafb; padding: 10px; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Oil Type</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Quantity</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Unit Price (Incl VAT)</th>
                <th style="text-align: right; padding: 4px 8px; font-size: 11px; font-weight: 500; color: #6b7280;">Oil Amount (Incl VAT)</th>
              </tr>
              <tr>
                <td style="padding: 5px 8px; font-weight: 600; font-size: 11px;">${invoice.oil_type || 'N/A'}${invoice.oil_brand ? ` (${invoice.oil_brand})` : ''}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">${parseFloat(invoice.oil_quantity.toString()).toFixed(0)} Unit${parseFloat(invoice.oil_quantity.toString()) > 1 ? 's' : ''}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">R ${parseFloat(invoice.oil_unit_price?.toString() || '0').toFixed(2)}</td>
                <td style="text-align: right; padding: 5px 8px; font-weight: 600; font-size: 11px;">R ${parseFloat(invoice.oil_total_amount?.toString() || '0').toFixed(2)}</td>
              </tr>
            </table>
            <div style="padding-top: 6px; margin-top: 6px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #4b5563;">Amount of VAT included:</span>
              <span style="font-weight: 600;">R ${(parseFloat(invoice.oil_total_amount?.toString() || '0') - (parseFloat(invoice.oil_total_amount?.toString() || '0') / 1.15)).toFixed(2)}</span>
            </div>
          </div>
        </div>` : ''}

        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
          <div style="background: #eff6ff; border-radius: 4px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: 600; color: #111827;">TOTAL AMOUNT:</span>
              <span style="font-size: 18px; font-weight: bold; color: #2563eb;">R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 10px; text-align: center; font-size: 11px; color: #4b5563;">
          <p style="margin: 3px 0;">This invoice is for accounting and tax compliance purposes.</p>
          <p style="margin: 3px 0;">Thank you for your business.</p>
        </div>
      </div>
    `;
  };

  const exportAllInvoicesToPDF = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices to export');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    filteredInvoices.forEach((invoice, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      let yPosition = margin;

      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FUEL TRANSACTION INVOICE', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Fuel Empowerment Systems (Pty) Ltd', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setDrawColor(17, 24, 39);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 8;

      const columnWidth = (contentWidth - 10) / 3;
      const col1X = margin;
      const col2X = margin + columnWidth + 5;
      const col3X = margin + (columnWidth * 2) + 10;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(107, 114, 128);
      pdf.text('INVOICE', col1X, yPosition);
      pdf.text('VEHICLE & DRIVER', col2X, yPosition);
      pdf.text('FUEL STATION', col3X, yPosition);

      yPosition += 3;

      pdf.setFillColor(249, 250, 251);
      pdf.rect(col1X, yPosition, columnWidth, 18, 'F');
      pdf.rect(col2X, yPosition, columnWidth, 18, 'F');
      pdf.rect(col3X, yPosition, columnWidth, 18, 'F');

      yPosition += 4;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);

      pdf.text('Number:', col1X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(invoice.invoice_number, col1X + columnWidth - 2, yPosition, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Vehicle:', col2X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(invoice.vehicle_registration, col2X + columnWidth - 2, yPosition, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Station:', col3X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      const stationTextAll = pdf.splitTextToSize(invoice.garage_name, columnWidth - 4);
      pdf.text(stationTextAll[0], col3X + columnWidth - 2, yPosition, { align: 'right' });

      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Date:', col1X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(new Date(invoice.invoice_date).toLocaleDateString('en-ZA'), col1X + columnWidth - 2, yPosition, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Driver:', col2X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      const driverTextAll = pdf.splitTextToSize(invoice.driver_name, columnWidth - 4);
      pdf.text(driverTextAll[0], col2X + columnWidth - 2, yPosition, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Address:', col3X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      const addressTextAll = pdf.splitTextToSize(invoice.garage_address, columnWidth - 4);
      pdf.text(addressTextAll[0], col3X + columnWidth - 2, yPosition, { align: 'right' });

      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Trans. Date:', col1X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(new Date(invoice.transaction_date).toLocaleDateString('en-ZA'), col1X + columnWidth - 2, yPosition, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('Odometer:', col2X + 2, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(`${invoice.odometer_reading.toLocaleString()} km`, col2X + columnWidth - 2, yPosition, { align: 'right' });

      if (invoice.garage_vat_number) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        pdf.text('VAT no:', col3X + 2, yPosition);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        pdf.text(invoice.garage_vat_number, col3X + columnWidth - 2, yPosition, { align: 'right' });
      }

      yPosition += 8;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(107, 114, 128);
      pdf.text('FUEL DETAILS', margin, yPosition);

      yPosition += 4;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');

      yPosition += 4;
      pdf.setFontSize(7);
      pdf.setTextColor(75, 85, 99);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Fuel Type', margin + 3, yPosition);
      pdf.text('Liters', margin + contentWidth * 0.35, yPosition, { align: 'right' });
      pdf.text('Price per Liter', margin + contentWidth * 0.6, yPosition, { align: 'right' });
      pdf.text('Fuel Amount', margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 4;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text(invoice.fuel_type, margin + 3, yPosition);
      pdf.text(parseFloat(invoice.liters.toString()).toFixed(2), margin + contentWidth * 0.35, yPosition, { align: 'right' });
      pdf.text(`R ${parseFloat(invoice.price_per_liter.toString()).toFixed(2)}`, margin + contentWidth * 0.6, yPosition, { align: 'right' });
      const fuelAmountAll = parseFloat(invoice.liters.toString()) * parseFloat(invoice.price_per_liter.toString());
      pdf.text(`R ${fuelAmountAll.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 8;

      const hasOilAll = invoice.oil_quantity && parseFloat(invoice.oil_quantity.toString()) > 0;
      if (hasOilAll) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(107, 114, 128);
        pdf.text('OIL PURCHASE', margin, yPosition);

        yPosition += 4;
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition, contentWidth, 12, 'F');

        yPosition += 4;
        pdf.setFontSize(7);
        pdf.setTextColor(75, 85, 99);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Oil Type', margin + 3, yPosition);
        pdf.text('Quantity', margin + contentWidth * 0.35, yPosition, { align: 'right' });
        pdf.text('Unit Price (Incl VAT)', margin + contentWidth * 0.6, yPosition, { align: 'right' });
        pdf.text('Oil Amount (Incl VAT)', margin + contentWidth - 3, yPosition, { align: 'right' });

        yPosition += 4;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        const oilTypeTextAll = `${invoice.oil_type || 'N/A'}${invoice.oil_brand ? ` (${invoice.oil_brand})` : ''}`;
        pdf.text(oilTypeTextAll, margin + 3, yPosition);
        pdf.text(`${parseFloat(invoice.oil_quantity.toString()).toFixed(0)} Unit${parseFloat(invoice.oil_quantity.toString()) > 1 ? 's' : ''}`, margin + contentWidth * 0.35, yPosition, { align: 'right' });
        pdf.text(`R ${parseFloat(invoice.oil_unit_price?.toString() || '0').toFixed(2)}`, margin + contentWidth * 0.6, yPosition, { align: 'right' });
        pdf.text(`R ${parseFloat(invoice.oil_total_amount?.toString() || '0').toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

        yPosition += 6;
        pdf.setDrawColor(209, 213, 219);
        pdf.setLineWidth(0.3);
        pdf.line(margin + 3, yPosition, margin + contentWidth - 3, yPosition);

        yPosition += 4;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        pdf.text('Amount of VAT included:', margin + 3, yPosition);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(17, 24, 39);
        const oilVATAll = parseFloat(invoice.oil_total_amount?.toString() || '0') - (parseFloat(invoice.oil_total_amount?.toString() || '0') / 1.15);
        pdf.text(`R ${oilVATAll.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

        yPosition += 8;
      }

      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 10;
      pdf.setFillColor(239, 246, 255);
      pdf.rect(margin, yPosition, contentWidth, 20, 'F');

      yPosition += 12;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(17, 24, 39);
      pdf.text('TOTAL AMOUNT:', margin + 5, yPosition);

      pdf.setFontSize(16);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`R ${parseFloat(invoice.total_amount.toString()).toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });

      yPosition += 15;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text('This invoice is for accounting and tax compliance purposes.', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.text('Thank you for your business.', pageWidth / 2, yPosition, { align: 'center' });
    });

    const dateRange = startDate && endDate
      ? `${new Date(startDate).toISOString().split('T')[0]}_to_${new Date(endDate).toISOString().split('T')[0]}`
      : new Date().toISOString().split('T')[0];

    pdf.save(`fuel-invoices-${dateRange}.pdf`);
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
            <p className="text-center text-gray-600 mt-2 text-base">Fuel Empowerment Systems (Pty) Ltd</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">INVOICE DETAILS</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-base">
                <div>
                  <span className="text-gray-600">Number:</span>
                  <span className="font-bold ml-1">{selectedInvoice.invoice_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-bold ml-1">{selectedInvoice.vehicle_registration}</span>
                </div>
                <div>
                  <span className="text-gray-600">Station:</span>
                  <span className="font-bold ml-1">{selectedInvoice.garage_name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-base">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold ml-1">{new Date(selectedInvoice.invoice_date).toLocaleDateString('en-ZA')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Driver:</span>
                  <span className="font-bold ml-1">{selectedInvoice.driver_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="font-bold ml-1">{selectedInvoice.garage_address}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-base">
                <div>
                  <span className="text-gray-600">Trans. Date:</span>
                  <span className="font-bold ml-1">
                    {new Date(selectedInvoice.transaction_date).toLocaleDateString('en-ZA')} {new Date(selectedInvoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Odometer:</span>
                  <span className="font-bold ml-1">{selectedInvoice.odometer_reading.toLocaleString()} km</span>
                </div>
                {selectedInvoice.garage_vat_number ? (
                  <div>
                    <span className="text-gray-600">VAT no:</span>
                    <span className="font-bold ml-1">{selectedInvoice.garage_vat_number}</span>
                  </div>
                ) : <div></div>}
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={exportAllInvoicesToPDF}
            disabled={filteredInvoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Export All to PDF
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

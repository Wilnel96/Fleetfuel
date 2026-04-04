import type { jsPDF } from 'jspdf';

export interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  transaction_date: string;
  vehicle_registration: string;
  driver_name?: string;
  garage_name: string;
  garage_vat_number?: string;
  garage_address: string;
  fuel_type: string;
  liters: number | string;
  price_per_liter: number | string;
  total_amount: number | string;
  oil_quantity?: number | string;
  oil_type?: string;
  oil_brand?: string;
  oil_unit_price?: number | string;
  oil_total_amount?: number | string;
}

export async function generateFuelInvoicePDF(invoice: InvoiceData): Promise<Blob> {
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;

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

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('INVOICE', margin, yPosition);

  yPosition += 3;
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPosition, contentWidth, 12, 'F');

  yPosition += 4;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);

  pdf.text('Number:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(` ${invoice.invoice_number}`, margin + 3 + pdf.getTextWidth('Number:'), yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  const dateLabel = 'Date:';
  const dateX = margin + (contentWidth / 2) - (pdf.getTextWidth(dateLabel) / 2);
  pdf.text(dateLabel, dateX, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(` ${new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}`, dateX + pdf.getTextWidth(dateLabel), yPosition);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  const transLabel = 'Transaction Date & Time:';
  const transDate = new Date(invoice.transaction_date).toLocaleDateString('en-ZA');
  const transTime = new Date(invoice.transaction_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const transValue = ` ${transDate} ${transTime}`;
  const transWidth = pdf.getTextWidth(transLabel) + pdf.getTextWidth(transValue);
  pdf.text(transLabel, margin + contentWidth - 3 - transWidth, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(transValue, margin + contentWidth - 3 - pdf.getTextWidth(transValue), yPosition);

  yPosition += 12;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('VEHICLE & DRIVER', margin, yPosition);

  yPosition += 3;
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPosition, contentWidth, 12, 'F');

  yPosition += 4;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);

  if (invoice.vehicle_registration) {
    pdf.text('Vehicle:', margin + 3, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(` ${invoice.vehicle_registration}`, margin + 3 + pdf.getTextWidth('Vehicle:'), yPosition);
  }

  if (invoice.driver_name) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    const driverLabel = 'Driver:';
    const driverX = margin + (contentWidth / 2) - (pdf.getTextWidth(driverLabel) / 2);
    pdf.text(driverLabel, driverX, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(` ${invoice.driver_name}`, driverX + pdf.getTextWidth(driverLabel), yPosition);
  }

  yPosition += 12;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('FUEL STATION', margin, yPosition);

  yPosition += 3;
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPosition, contentWidth, 16, 'F');

  yPosition += 4;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);

  pdf.text('Station:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(` ${invoice.garage_name}`, margin + 3 + pdf.getTextWidth('Station:'), yPosition);

  if (invoice.garage_vat_number) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    const vatLabel = 'VAT no:';
    const vatValue = ` ${invoice.garage_vat_number}`;
    const vatWidth = pdf.getTextWidth(vatLabel) + pdf.getTextWidth(vatValue);
    pdf.text(vatLabel, margin + contentWidth - 3 - vatWidth, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(vatValue, margin + contentWidth - 3 - pdf.getTextWidth(vatValue), yPosition);
  }

  yPosition += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(75, 85, 99);
  pdf.text('Address:', margin + 3, yPosition);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(17, 24, 39);
  pdf.text(` ${invoice.garage_address}`, margin + 3 + pdf.getTextWidth('Address:'), yPosition);

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

  return pdf.output('blob');
}

export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

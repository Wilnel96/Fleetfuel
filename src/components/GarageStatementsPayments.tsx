import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, CreditCard, Plus, Calendar, Download, Printer, Eye, ArrowLeft, DollarSign, Fuel, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

interface Organization {
  id: string;
  name: string;
  vat_number: string | null;
}

interface Statement {
  id: string;
  statement_number: string;
  statement_date: string;
  period_start: string;
  period_end: string;
  opening_balance: number;
  total_invoices: number;
  total_payments: number;
  closing_balance: number;
}

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  notes: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  transaction_date: string;
  vehicle_registration: string;
  fuel_type: string;
  liters: number;
  total_amount: number;
  oil_quantity?: number;
  oil_total_amount?: number;
}

interface GarageStatementsPaymentsProps {
  garageId: string;
  garageName: string;
  organizationId: string;
  organizationName: string;
  onBack: () => void;
}

export default function GarageStatementsPayments({
  garageId,
  garageName,
  organizationId,
  organizationName,
  onBack
}: GarageStatementsPaymentsProps) {
  const [activeTab, setActiveTab] = useState<'statements' | 'payments'>('statements');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateStatement, setShowCreateStatement] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [viewingStatementDetails, setViewingStatementDetails] = useState(false);
  const [statementInvoices, setStatementInvoices] = useState<Invoice[]>([]);
  const [statementPayments, setStatementPayments] = useState<Payment[]>([]);

  const [statementPeriodStart, setStatementPeriodStart] = useState('');
  const [statementPeriodEnd, setStatementPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'eft' | 'card' | 'cheque'>('eft');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const lastStatement = statements[0];
    if (lastStatement) {
      const nextDay = new Date(lastStatement.period_end);
      nextDay.setDate(nextDay.getDate() + 1);
      setStatementPeriodStart(nextDay.toISOString().split('T')[0]);
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setStatementPeriodStart(thirtyDaysAgo.toISOString().split('T')[0]);
    }
  }, [statements]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStatements(), loadPayments()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatements = async () => {
    const { data, error: statementsError } = await supabase
      .from('garage_statements')
      .select('*')
      .eq('garage_id', garageId)
      .eq('organization_id', organizationId)
      .order('statement_date', { ascending: false });

    if (statementsError) throw statementsError;
    setStatements(data || []);
  };

  const loadPayments = async () => {
    const { data, error: paymentsError } = await supabase
      .from('garage_client_payments')
      .select('*')
      .eq('garage_id', garageId)
      .eq('organization_id', organizationId)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;
    setPayments(data || []);
  };

  const handleCreateStatement = async () => {
    try {
      setError('');
      setSaving(true);

      const { data: statementNumberData, error: numberError } = await supabase
        .rpc('generate_garage_statement_number', { p_garage_id: garageId });

      if (numberError) throw numberError;

      const { data: newStatement, error: insertError } = await supabase
        .from('garage_statements')
        .insert({
          garage_id: garageId,
          organization_id: organizationId,
          statement_number: statementNumberData,
          statement_date: statementPeriodEnd,
          period_start: statementPeriodStart,
          period_end: statementPeriodEnd
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: calculateError } = await supabase
        .rpc('calculate_statement_totals', { p_statement_id: newStatement.id });

      if (calculateError) throw calculateError;

      setShowCreateStatement(false);
      await loadStatements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      setError('');
      setSaving(true);

      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        throw new Error('Please enter a valid payment amount');
      }

      const { data: paymentNumberData, error: numberError } = await supabase
        .rpc('generate_payment_number', { p_garage_id: garageId });

      if (numberError) throw numberError;

      const { error: insertError } = await supabase
        .from('garage_client_payments')
        .insert({
          garage_id: garageId,
          organization_id: organizationId,
          payment_number: paymentNumberData,
          payment_date: paymentDate,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference: paymentReference || null,
          notes: paymentNotes || null
        });

      if (insertError) throw insertError;

      setShowAddPayment(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
      await loadPayments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadStatementDetails = async (statement: Statement) => {
    try {
      setSelectedStatement(statement);
      setViewingStatementDetails(true);

      const { data: invoicesData, error: invoicesError } = await supabase
        .from('fuel_transaction_invoices')
        .select('id, invoice_number, transaction_date, vehicle_registration, fuel_type, liters, total_amount, oil_quantity, oil_total_amount')
        .eq('organization_id', organizationId)
        .eq('garage_name', garageName)
        .gte('transaction_date', statement.period_start)
        .lte('transaction_date', statement.period_end)
        .order('transaction_date', { ascending: true });

      if (invoicesError) throw invoicesError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('garage_client_payments')
        .select('*')
        .eq('garage_id', garageId)
        .eq('organization_id', organizationId)
        .gte('payment_date', statement.period_start)
        .lte('payment_date', statement.period_end)
        .order('payment_date', { ascending: true });

      if (paymentsError) throw paymentsError;

      setStatementInvoices(invoicesData || []);
      setStatementPayments(paymentsData || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const printStatement = (statement: Statement) => {
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
    pdf.text('ACCOUNT STATEMENT', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 7;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(garageName, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    pdf.setDrawColor(17, 24, 39);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('STATEMENT DETAILS', margin, yPosition);

    yPosition += 3;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPosition, contentWidth, 25, 'F');

    yPosition += 5;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);

    pdf.text('Statement Number:', margin + 3, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(statement.statement_number, margin + 50, yPosition);

    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Statement Date:', margin + 3, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(new Date(statement.statement_date).toLocaleDateString('en-ZA'), margin + 50, yPosition);

    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Period:', margin + 3, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(`${new Date(statement.period_start).toLocaleDateString('en-ZA')} to ${new Date(statement.period_end).toLocaleDateString('en-ZA')}`, margin + 50, yPosition);

    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    pdf.text('Account:', margin + 3, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(organizationName, margin + 50, yPosition);

    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('TRANSACTION DETAILS', margin, yPosition);

    yPosition += 5;

    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99);
    pdf.text('Date', margin + 3, yPosition);
    pdf.text('Description', margin + 25, yPosition);
    pdf.text('Liters', margin + 90, yPosition, { align: 'right' });
    pdf.text('Debit', margin + 120, yPosition, { align: 'right' });
    pdf.text('Credit', margin + 150, yPosition, { align: 'right' });
    pdf.text('Balance', margin + contentWidth - 3, yPosition, { align: 'right' });

    yPosition += 2;
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 4;
    let runningBalance = statement.opening_balance;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text('', margin + 3, yPosition);
    pdf.text('Opening Balance', margin + 25, yPosition);
    pdf.text('', margin + 90, yPosition, { align: 'right' });
    pdf.text('', margin + 120, yPosition, { align: 'right' });
    pdf.text('', margin + 150, yPosition, { align: 'right' });
    pdf.setFont('helvetica', 'bold');
    pdf.text(`R ${runningBalance.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

    yPosition += 5;

    const allTransactions: Array<{ date: string; description: string; liters: string; debit: number; credit: number; }> = [];

    statementInvoices.forEach(inv => {
      const description = `Invoice ${inv.invoice_number} - ${inv.vehicle_registration} - ${inv.fuel_type}`;
      const liters = inv.liters ? inv.liters.toFixed(2) : '';
      allTransactions.push({
        date: new Date(inv.transaction_date).toLocaleDateString('en-ZA'),
        description,
        liters,
        debit: inv.total_amount,
        credit: 0
      });
    });

    statementPayments.forEach(pmt => {
      const description = `Payment ${pmt.payment_number} - ${pmt.payment_method.toUpperCase()}${pmt.reference ? ` - ${pmt.reference}` : ''}`;
      allTransactions.push({
        date: new Date(pmt.payment_date).toLocaleDateString('en-ZA'),
        description,
        liters: '',
        debit: 0,
        credit: pmt.amount
      });
    });

    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    allTransactions.forEach(txn => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }

      runningBalance += txn.debit - txn.credit;

      pdf.setFont('helvetica', 'normal');
      pdf.text(txn.date, margin + 3, yPosition);
      const maxDescWidth = 60;
      const descLines = pdf.splitTextToSize(txn.description, maxDescWidth);
      pdf.text(descLines[0], margin + 25, yPosition);
      pdf.text(txn.liters, margin + 90, yPosition, { align: 'right' });
      pdf.text(txn.debit > 0 ? `R ${txn.debit.toFixed(2)}` : '', margin + 120, yPosition, { align: 'right' });
      pdf.text(txn.credit > 0 ? `R ${txn.credit.toFixed(2)}` : '', margin + 150, yPosition, { align: 'right' });
      pdf.text(`R ${runningBalance.toFixed(2)}`, margin + contentWidth - 3, yPosition, { align: 'right' });

      yPosition += 5;
    });

    yPosition += 5;
    pdf.setDrawColor(17, 24, 39);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 8;
    pdf.setFillColor(239, 246, 255);
    pdf.rect(margin, yPosition, contentWidth, 30, 'F');

    yPosition += 7;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text('Opening Balance:', margin + 5, yPosition);
    pdf.text(`R ${statement.opening_balance.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });

    yPosition += 6;
    pdf.text('Total Invoices:', margin + 5, yPosition);
    pdf.text(`R ${statement.total_invoices.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });

    yPosition += 6;
    pdf.text('Total Payments:', margin + 5, yPosition);
    pdf.text(`R ${statement.total_payments.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });

    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setTextColor(37, 99, 235);
    pdf.text('CLOSING BALANCE:', margin + 5, yPosition);
    pdf.text(`R ${statement.closing_balance.toFixed(2)}`, margin + contentWidth - 5, yPosition, { align: 'right' });

    pdf.save(`statement-${statement.statement_number}.pdf`);
  };

  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statements and payments...</p>
        </div>
      </div>
    );
  }

  if (viewingStatementDetails && selectedStatement) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setViewingStatementDetails(false);
                setSelectedStatement(null);
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Statements
            </button>
            <button
              onClick={() => printStatement(selectedStatement)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Print Statement
            </button>
          </div>

          <div className="border-b-2 border-gray-900 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">ACCOUNT STATEMENT</h1>
            <p className="text-center text-gray-600 mt-2 text-base">{garageName}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Statement Number:</span>
                  <span className="font-bold">{selectedStatement.statement_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statement Date:</span>
                  <span className="font-bold">{new Date(selectedStatement.statement_date).toLocaleDateString('en-ZA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-bold">
                    {new Date(selectedStatement.period_start).toLocaleDateString('en-ZA')} to {new Date(selectedStatement.period_end).toLocaleDateString('en-ZA')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening Balance:</span>
                  <span className="font-bold">R {selectedStatement.opening_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Invoices:</span>
                  <span className="font-bold text-red-600">R {selectedStatement.total_invoices.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-bold text-green-600">R {selectedStatement.total_payments.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-blue-200 pt-2 mt-2 flex justify-between">
                  <span className="text-lg font-bold text-blue-900">Closing Balance:</span>
                  <span className="text-lg font-bold text-blue-900">R {selectedStatement.closing_balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">Invoices ({statementInvoices.length})</h3>
            {statementInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No invoices in this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Liters</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {statementInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-4 py-3 text-sm">{new Date(inv.transaction_date).toLocaleDateString('en-ZA')}</td>
                        <td className="px-4 py-3 text-sm font-medium">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-sm">{inv.vehicle_registration}</td>
                        <td className="px-4 py-3 text-sm">{inv.fuel_type}</td>
                        <td className="px-4 py-3 text-sm text-right">{inv.liters.toFixed(2)} L</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">R {inv.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Payments ({statementPayments.length})</h3>
            {statementPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No payments in this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {statementPayments.map((pmt) => (
                      <tr key={pmt.id}>
                        <td className="px-4 py-3 text-sm">{new Date(pmt.payment_date).toLocaleDateString('en-ZA')}</td>
                        <td className="px-4 py-3 text-sm font-medium">{pmt.payment_number}</td>
                        <td className="px-4 py-3 text-sm uppercase">{pmt.payment_method}</td>
                        <td className="px-4 py-3 text-sm">{pmt.reference || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">R {pmt.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Statements & Payments</h2>
            <p className="text-gray-600">{organizationName}</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Accounts
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('statements')}
              className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'statements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Statements
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payments
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'statements' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Account Statements</h3>
              <button
                onClick={() => setShowCreateStatement(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Statement
              </button>
            </div>

            {showCreateStatement && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-4">Create New Statement</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Period Start</label>
                    <input
                      type="date"
                      value={statementPeriodStart}
                      onChange={(e) => setStatementPeriodStart(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Period End</label>
                    <input
                      type="date"
                      value={statementPeriodEnd}
                      onChange={(e) => setStatementPeriodEnd(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateStatement}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Statement'}
                  </button>
                  <button
                    onClick={() => setShowCreateStatement(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statement #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Opening</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payments</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Closing</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {statements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No statements created yet
                      </td>
                    </tr>
                  ) : (
                    statements.map((statement) => (
                      <tr key={statement.id}>
                        <td className="px-4 py-3 text-sm font-medium">{statement.statement_number}</td>
                        <td className="px-4 py-3 text-sm">{new Date(statement.statement_date).toLocaleDateString('en-ZA')}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(statement.period_start).toLocaleDateString('en-ZA')} - {new Date(statement.period_end).toLocaleDateString('en-ZA')}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">R {statement.opening_balance.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">R {statement.total_invoices.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">R {statement.total_payments.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">R {statement.closing_balance.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => loadStatementDetails(statement)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => printStatement(statement)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                              title="Print Statement"
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

        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Client Payments</h3>
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>

            {showAddPayment && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold mb-4">Record Payment</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="eft">EFT</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reference</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Payment reference"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Optional notes"
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPayment}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Payment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPayment(false);
                      setPaymentAmount('');
                      setPaymentReference('');
                      setPaymentNotes('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No payments recorded yet
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm font-medium">{payment.payment_number}</td>
                        <td className="px-4 py-3 text-sm">{new Date(payment.payment_date).toLocaleDateString('en-ZA')}</td>
                        <td className="px-4 py-3 text-sm uppercase">{payment.payment_method}</td>
                        <td className="px-4 py-3 text-sm">{payment.reference || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">R {payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EFTBatch {
  id: string;
  batch_date: string;
  total_amount: number;
  total_commission: number;
  total_transactions: number;
  status: string;
  processed_at: string;
}

interface BatchItem {
  garage_id: string;
  garage_name: string;
  transaction_count: number;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  bank_name: string;
  account_number: string;
  branch_code: string;
}

export default function EFTBatchProcessing() {
  const [batches, setBatches] = useState<EFTBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<EFTBatch | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      if (profile) {
        if (profile.role === 'super_admin') {
          const { data, error } = await supabase
            .from('daily_eft_batches')
            .select('*')
            .order('batch_date', { ascending: false });

          if (error) {
            console.error('Error loading batches:', error);
            return;
          }

          if (data) setBatches(data);
        } else {
          const { data, error } = await supabase
            .from('daily_eft_batches')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('batch_date', { ascending: false });

          if (error) {
            console.error('Error loading batches:', error);
            return;
          }

          if (data) setBatches(data);
        }
      }
    } catch (err) {
      console.error('Unexpected error loading batches:', err);
    }
  };

  const createDailyBatch = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const today = new Date().toISOString().split('T')[0];

      const { data: existingBatch, error: batchCheckError } = await supabase
        .from('daily_eft_batches')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('batch_date', today)
        .maybeSingle();

      if (batchCheckError) {
        console.error('Error checking existing batch:', batchCheckError);
        throw new Error('Failed to check existing batches: ' + batchCheckError.message);
      }

      if (existingBatch) {
        alert('A batch for today already exists');
        setProcessing(false);
        return;
      }

      const { data: transactions, error: transactionsError } = await supabase
        .from('fuel_transactions')
        .select('*, garages(*)')
        .eq('organization_id', profile.organization_id)
        .is('eft_batch_id', null)
        .gte('transaction_date', today)
        .lt('transaction_date', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        throw new Error('Failed to fetch transactions: ' + transactionsError.message);
      }

      if (!transactions || transactions.length === 0) {
        alert('No transactions found for today');
        setProcessing(false);
        return;
      }

      const garageMap = new Map<string, {
        count: number;
        gross: number;
        commission: number;
        net: number;
        garage: any;
      }>();

      transactions.forEach((t: any) => {
        const garageId = t.garage_id;
        if (!garageMap.has(garageId)) {
          garageMap.set(garageId, {
            count: 0,
            gross: 0,
            commission: 0,
            net: 0,
            garage: t.garages,
          });
        }
        const entry = garageMap.get(garageId)!;
        entry.count++;
        entry.gross += parseFloat(t.total_amount);
        entry.commission += parseFloat(t.commission_amount);
        entry.net += parseFloat(t.net_amount);
      });

      const totalAmount = Array.from(garageMap.values()).reduce((sum, g) => sum + g.gross, 0);
      const totalCommission = Array.from(garageMap.values()).reduce((sum, g) => sum + g.commission, 0);

      const { data: batch, error: batchError } = await supabase
        .from('daily_eft_batches')
        .insert({
          organization_id: profile.organization_id,
          batch_date: today,
          total_amount: totalAmount,
          total_commission: totalCommission,
          total_transactions: transactions.length,
          status: 'pending',
        })
        .select()
        .single();

      if (batchError) throw batchError;

      const batchItemsData = Array.from(garageMap.entries()).map(([garageId, data]) => ({
        batch_id: batch.id,
        garage_id: garageId,
        transaction_count: data.count,
        gross_amount: data.gross,
        commission_amount: data.commission,
        net_amount: data.net,
      }));

      console.log('Inserting batch items:', batchItemsData);

      const { data: insertedItems, error: itemsError } = await supabase
        .from('eft_batch_items')
        .insert(batchItemsData)
        .select();

      console.log('Batch items insert result:', { insertedItems, itemsError });

      if (itemsError) {
        console.error('Failed to insert batch items:', itemsError);
        throw itemsError;
      }

      const { error: updateError } = await supabase
        .from('fuel_transactions')
        .update({ eft_batch_id: batch.id })
        .in('id', transactions.map((t: any) => t.id));

      if (updateError) throw updateError;

      loadBatches();
      alert('Daily EFT batch created successfully');
    } catch (error: any) {
      alert('Error creating batch: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const viewBatchDetails = async (batch: EFTBatch) => {
    setSelectedBatch(batch);
    setLoading(true);

    console.log('Loading batch details for:', batch.id);

    const { data, error } = await supabase
      .from('eft_batch_items')
      .select('*, garages(*)')
      .eq('batch_id', batch.id);

    console.log('Batch items query result:', { data, error });

    if (error) {
      console.error('Error loading batch items:', error);
      alert('Error loading batch items: ' + error.message);
      setBatchItems([]);
    } else if (data) {
      console.log('Raw batch items:', data);
      const items: BatchItem[] = data.map((item: any) => ({
        garage_id: item.garage_id,
        garage_name: item.garages?.name || 'Unknown',
        transaction_count: item.transaction_count,
        gross_amount: parseFloat(item.gross_amount),
        commission_amount: parseFloat(item.commission_amount),
        net_amount: parseFloat(item.net_amount),
        bank_name: item.garages?.bank_name || 'N/A',
        account_number: item.garages?.account_number || 'N/A',
        branch_code: item.garages?.branch_code || 'N/A',
      }));
      console.log('Processed batch items:', items);
      setBatchItems(items);
    } else {
      console.log('No batch items found');
      setBatchItems([]);
    }

    setLoading(false);
  };

  const exportBatchToCSV = async () => {
    console.log('Export clicked. Selected batch:', selectedBatch);

    if (!selectedBatch) {
      alert('No batch selected');
      return;
    }

    try {
      const { data: transactions, error } = await supabase
        .from('fuel_transactions')
        .select('*, vehicles(registration_number, make, model), garages(name), profiles(full_name)')
        .eq('eft_batch_id', selectedBatch.id)
        .order('transaction_date');

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        alert('No transactions found for this batch');
        return;
      }

      console.log('Loaded transactions:', transactions);

      const headers = [
        'Transaction Date',
        'Vehicle Registration',
        'Vehicle Make/Model',
        'Driver',
        'Garage',
        'Liters',
        'Price per Liter',
        'Gross Amount',
        'Commission Rate',
        'Commission Amount',
        'Net Amount',
        'Odometer Reading',
        'Location',
      ];

      const rows = transactions.map((t: any) => [
        new Date(t.transaction_date).toLocaleString(),
        t.vehicles?.registration_number || 'N/A',
        `${t.vehicles?.make || ''} ${t.vehicles?.model || ''}`.trim() || 'N/A',
        t.profiles?.full_name || 'N/A',
        t.garages?.name || 'N/A',
        t.liters?.toFixed(2) || '0.00',
        t.price_per_liter?.toFixed(2) || '0.00',
        t.total_amount?.toFixed(2) || '0.00',
        `${t.commission_rate || 0}%`,
        t.commission_amount?.toFixed(2) || '0.00',
        t.net_amount?.toFixed(2) || '0.00',
        t.odometer_reading || 'N/A',
        t.location || 'N/A',
      ]);

      const summaryRows = [
        [],
        ['SUMMARY'],
        ['Total Transactions', transactions.length.toString()],
        ['Total Gross Amount', `R${transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.total_amount) || 0), 0).toFixed(2)}`],
        ['Total Commission', `R${transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.commission_amount) || 0), 0).toFixed(2)}`],
        ['Total Net Amount', `R${transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.net_amount) || 0), 0).toFixed(2)}`],
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ...summaryRows.map(row => row.join(',')),
      ].join('\n');

      console.log('CSV Content:', csvContent);

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EFT_Batch_${selectedBatch.batch_date}_Detailed.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);

      console.log('Triggering download...');
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log('Export complete');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting CSV: ' + error);
    }
  };

  const markBatchAsCompleted = async (batchId: string) => {
    const { error } = await supabase
      .from('daily_eft_batches')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    if (error) {
      alert('Error updating batch: ' + error.message);
    } else {
      loadBatches();
      if (selectedBatch?.id === batchId) {
        setSelectedBatch({ ...selectedBatch, status: 'completed', processed_at: new Date().toISOString() });
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Daily EFT Processing</h1>
        </div>
        <button
          onClick={createDailyBatch}
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-300"
        >
          <Play className="w-5 h-5" />
          {processing ? 'Creating...' : 'Create Today\'s Batch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">EFT Batches</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {batches.map((batch) => (
              <button
                key={batch.id}
                onClick={() => viewBatchDetails(batch)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedBatch?.id === batch.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">{batch.batch_date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                    batch.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {batch.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Transactions</p>
                    <p className="font-medium text-gray-900">{batch.total_transactions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Amount</p>
                    <p className="font-medium text-gray-900">R{batch.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Commission</p>
                    <p className="font-medium text-gray-900">R{batch.total_commission.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            ))}
            {batches.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No EFT batches yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedBatch ? `Batch Details - ${selectedBatch.batch_date}` : 'Select a batch'}
            </h2>
            {selectedBatch && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportBatchToCSV}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                {selectedBatch.status === 'pending' && (
                  <button
                    onClick={() => markBatchAsCompleted(selectedBatch.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : selectedBatch ? (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {batchItems.map((item, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.garage_name}</p>
                      <p className="text-sm text-gray-600">{item.transaction_count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Net: R{item.net_amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Commission: R{item.commission_amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 mt-2">
                    <p className="text-xs text-gray-600 mb-1">Banking Details:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Bank</p>
                        <p className="font-medium text-gray-900">{item.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account</p>
                        <p className="font-medium text-gray-900">{item.account_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Branch</p>
                        <p className="font-medium text-gray-900">{item.branch_code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a batch to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

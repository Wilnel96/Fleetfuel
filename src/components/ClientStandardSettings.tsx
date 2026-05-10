import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Settings, Save, X, AlertCircle, CheckCircle, ArrowLeft, Info,
  Car, Users, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

interface ClientStandardSettingsProps {
  onBack: () => void;
}

interface OrgRow {
  id: string;
  name: string;
  monthly_fee_per_vehicle: number | null;
  monthly_fee_per_driver: number | null;
  vehicle_count: number;
  driver_count: number;
}

// global_settings keys for the 7 financial defaults
const FINANCIAL_KEYS = [
  'standard_payment_method',
  'standard_payment_terms',
  'standard_payment_date',
  'standard_debit_order_lead_days',
  'standard_late_payment_interest_rate',
] as const;

function toggleSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

interface ClientExclusionProps {
  label: string;
  icon: React.ReactNode;
  accentColor: 'teal' | 'blue';
  orgs: OrgRow[];
  loading: boolean;
  globalRate: number;
  newRate: string;
  excluded: Set<string>;
  setExcluded: (s: Set<string>) => void;
  open: boolean;
  onToggle: () => void;
}

function ClientExclusionPanel({
  label, icon, accentColor, orgs, loading, globalRate, newRate,
  excluded, setExcluded, open, onToggle,
}: ClientExclusionProps) {
  const rateKey = label === 'Vehicle Fee' ? 'monthly_fee_per_vehicle' as const : 'monthly_fee_per_driver' as const;
  const countKey = label === 'Vehicle Fee' ? 'vehicle_count' as const : 'driver_count' as const;
  const parsedNew = parseFloat(newRate);
  const ringColor = accentColor === 'teal' ? 'border-teal-400 ring-teal-300' : 'border-blue-400 ring-blue-300';
  const checkColor = accentColor === 'teal' ? 'text-teal-600 focus:ring-teal-500' : 'text-blue-600 focus:ring-blue-500';
  const allExcluded = orgs.length > 0 && excluded.size === orgs.length;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          open
            ? `bg-gray-50 ${ringColor} ring-1`
            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="flex items-center gap-2">
          {icon}
          {label} — Client Exclusions
          {excluded.size > 0 && (
            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs">
              {excluded.size} excluded
            </span>
          )}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 grid grid-cols-[1.75rem_1fr_3.5rem_5.5rem] gap-2 items-center">
            <label className="flex items-center justify-center cursor-pointer" title="Exclude all">
              <input
                type="checkbox"
                checked={allExcluded}
                onChange={(e) => setExcluded(new Set(e.target.checked ? orgs.map((o) => o.id) : []))}
                className={`w-3.5 h-3.5 ${checkColor} border-gray-300 rounded`}
              />
            </label>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
              {label === 'Vehicle Fee' ? 'Veh.' : 'Drv.'}
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Current Rate</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading clients...</div>
          ) : orgs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No clients found</div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: '16rem' }}>
                {orgs.map((org) => {
                  const isExcluded = excluded.has(org.id);
                  const rate = org[rateKey];
                  const differs = rate != null && !isNaN(parsedNew) && Math.abs(rate - parsedNew) > 0.001;
                  return (
                    <div
                      key={org.id}
                      onClick={() => setExcluded(toggleSet(excluded, org.id))}
                      className={`grid grid-cols-[1.75rem_1fr_3.5rem_5.5rem] gap-2 px-4 py-2.5 items-center cursor-pointer transition-colors ${
                        isExcluded ? 'bg-amber-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isExcluded}
                          onChange={() => setExcluded(toggleSet(excluded, org.id))}
                          className={`w-3.5 h-3.5 ${checkColor} border-gray-300 rounded`}
                        />
                      </div>
                      <span className={`text-xs font-medium truncate ${isExcluded ? 'text-amber-700' : 'text-gray-900'}`} title={org.name}>
                        {org.name}
                      </span>
                      <span className="text-xs text-gray-500 text-center">{org[countKey]}</span>
                      <div className="text-right">
                        {rate != null
                          ? <span className={`text-xs font-medium ${differs ? 'text-amber-600' : 'text-gray-700'}`}>R{Number(rate).toFixed(2)}</span>
                          : <span className="text-xs text-gray-400 italic">—</span>
                        }
                        {differs && <span className="ml-1 text-xs text-amber-400">(c)</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {excluded.size > 0 && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5 text-xs text-amber-700">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  {excluded.size} client(s) will keep their current rate.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientStandardSettings({ onBack }: ClientStandardSettingsProps) {
  // Financial defaults form state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Record<string, string>>({});

  // Fee fields (also in global_settings + applied to orgs)
  const [globalV, setGlobalV] = useState('');
  const [globalD, setGlobalD] = useState('');
  const [newV, setNewV] = useState('');
  const [newD, setNewD] = useState('');

  // Client org data for exclusions
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [excludedV, setExcludedV] = useState<Set<string>>(new Set());
  const [excludedD, setExcludedD] = useState<Set<string>>(new Set());
  const [openPanel, setOpenPanel] = useState<'vehicle' | 'driver' | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setOrgsLoading(true);
    setError('');
    try {
      const allKeys = [...FINANCIAL_KEYS, 'standard_monthly_fee_per_vehicle', 'standard_monthly_fee_per_driver', 'monthly_fee_per_vehicle', 'monthly_fee_per_driver'];
      const [settingsRes, orgsRes] = await Promise.all([
        supabase.from('global_settings').select('key, value').in('key', allKeys),
        supabase
          .from('organizations')
          .select('id, name, monthly_fee_per_vehicle, monthly_fee_per_driver')
          .eq('organization_type', 'client')
          .eq('is_management_org', false)
          .order('name'),
      ]);
      if (settingsRes.error) throw settingsRes.error;
      if (orgsRes.error) throw orgsRes.error;

      const map: Record<string, string> = {};
      (settingsRes.data ?? []).forEach((r) => { map[r.key] = r.value; });

      const financialMap: Record<string, string> = {};
      FINANCIAL_KEYS.forEach((k) => { financialMap[k] = map[k] ?? ''; });
      setSettings(financialMap);
      setForm(financialMap);

      // Fee values — prefer the canonical keys used by CreateClientOrganization
      const vFee = map['monthly_fee_per_vehicle'] ?? map['standard_monthly_fee_per_vehicle'] ?? '0';
      const dFee = map['monthly_fee_per_driver'] ?? map['standard_monthly_fee_per_driver'] ?? '0';
      setGlobalV(vFee); setNewV(vFee);
      setGlobalD(dFee); setNewD(dFee);

      // Load vehicle/driver counts per org
      const orgList = orgsRes.data ?? [];
      const orgIds = orgList.map((o) => o.id);
      const vc: Record<string, number> = {};
      const dc: Record<string, number> = {};
      if (orgIds.length > 0) {
        const [vcRes, dcRes] = await Promise.all([
          supabase.from('vehicles').select('organization_id').in('organization_id', orgIds).eq('status', 'active'),
          supabase.from('drivers').select('organization_id').in('organization_id', orgIds).eq('status', 'active'),
        ]);
        (vcRes.data ?? []).forEach((v) => { vc[v.organization_id] = (vc[v.organization_id] ?? 0) + 1; });
        (dcRes.data ?? []).forEach((d) => { dc[d.organization_id] = (dc[d.organization_id] ?? 0) + 1; });
      }
      setOrgs(orgList.map((o) => ({
        id: o.id,
        name: o.name,
        monthly_fee_per_vehicle: o.monthly_fee_per_vehicle,
        monthly_fee_per_driver: o.monthly_fee_per_driver,
        vehicle_count: vc[o.id] ?? 0,
        driver_count: dc[o.id] ?? 0,
      })));
    } catch (err: any) {
      setError(err.message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
      setOrgsLoading(false);
    }
  };

  const financialHasChanges = FINANCIAL_KEYS.some((k) => (form[k] ?? '') !== (settings[k] ?? ''));
  const parsedNewV = parseFloat(newV);
  const parsedGlobalV = parseFloat(globalV || '0');
  const parsedNewD = parseFloat(newD);
  const parsedGlobalD = parseFloat(globalD || '0');
  const vChanged = newV !== globalV;
  const dChanged = newD !== globalD;
  const hasChanges = financialHasChanges || vChanged || dChanged;

  const handleSave = async () => {
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const now = new Date().toISOString();

      // 1. Save all financial default keys
      for (const key of FINANCIAL_KEYS) {
        const value = form[key] ?? '';
        const { error: uErr } = await supabase.from('global_settings')
          .update({ value, updated_at: now, updated_by: user.id })
          .eq('key', key);
        if (uErr) throw uErr;
      }

      // 2. Save fee values to both global_settings key families
      if (vChanged) {
        if (isNaN(parsedNewV) || parsedNewV < 0) throw new Error('Enter a valid vehicle fee amount');
        const vStr = parsedNewV.toString();
        await Promise.all([
          supabase.from('global_settings').update({ value: vStr, updated_at: now, updated_by: user.id }).eq('key', 'monthly_fee_per_vehicle'),
          supabase.from('global_settings').update({ value: vStr, updated_at: now, updated_by: user.id }).eq('key', 'standard_monthly_fee_per_vehicle'),
        ]);
      }
      if (dChanged) {
        if (isNaN(parsedNewD) || parsedNewD < 0) throw new Error('Enter a valid driver fee amount');
        const dStr = parsedNewD.toString();
        await Promise.all([
          supabase.from('global_settings').update({ value: dStr, updated_at: now, updated_by: user.id }).eq('key', 'monthly_fee_per_driver'),
          supabase.from('global_settings').update({ value: dStr, updated_at: now, updated_by: user.id }).eq('key', 'standard_monthly_fee_per_driver'),
        ]);
      }

      // 3. Apply new fees to existing clients (excluding those ticked)
      let vMsg = '';
      let dMsg = '';

      if (vChanged && !isNaN(parsedNewV)) {
        const toUpdate = orgs.filter((o) => !excludedV.has(o.id));
        if (toUpdate.length > 0) {
          const { error: uErr } = await supabase.from('organizations')
            .update({ monthly_fee_per_vehicle: parsedNewV })
            .in('id', toUpdate.map((o) => o.id));
          if (uErr) throw uErr;
          setOrgs((prev) => prev.map((o) => excludedV.has(o.id) ? o : { ...o, monthly_fee_per_vehicle: parsedNewV }));
        }
        vMsg = `Vehicle fee updated for ${toUpdate.length} client(s)${excludedV.size > 0 ? `, ${excludedV.size} excluded` : ''}.`;
        setGlobalV(parsedNewV.toString());
      }

      if (dChanged && !isNaN(parsedNewD)) {
        const toUpdate = orgs.filter((o) => !excludedD.has(o.id));
        if (toUpdate.length > 0) {
          const { error: uErr } = await supabase.from('organizations')
            .update({ monthly_fee_per_driver: parsedNewD })
            .in('id', toUpdate.map((o) => o.id));
          if (uErr) throw uErr;
          setOrgs((prev) => prev.map((o) => excludedD.has(o.id) ? o : { ...o, monthly_fee_per_driver: parsedNewD }));
        }
        dMsg = `Driver fee updated for ${toUpdate.length} client(s)${excludedD.size > 0 ? `, ${excludedD.size} excluded` : ''}.`;
        setGlobalD(parsedNewD.toString());
      }

      setSettings({ ...form });
      const parts = ['Standard settings saved.', vMsg, dMsg].filter(Boolean);
      setSuccess(parts.join(' '));
      setSaved(true);
      setExcludedV(new Set());
      setExcludedD(new Set());
      setOpenPanel(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm({ ...settings });
    setNewV(globalV);
    setNewD(globalD);
    setExcludedV(new Set());
    setExcludedD(new Set());
    setOpenPanel(null);
    setSaved(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading settings...</div>;
  }

  const parsedGlobalVDisplay = parseFloat(globalV || '0');
  const parsedGlobalDDisplay = parseFloat(globalD || '0');

  return (
    <div className="-my-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white -mx-4 px-4 py-5 pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Client Standard Financial Settings</h2>
              <p className="text-gray-500 text-sm">System-wide defaults for new clients, with the option to apply fee changes to existing clients</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && !saved && (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Discard
              </button>
            )}
            {saved ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800 text-sm">{success}</div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">
            These settings define the standard terms applied to all new client organizations. Fee changes can optionally be applied to existing clients — tick any client to exclude them from the update.
          </p>
        </div>

        {/* ── Monthly Fees section ─────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Monthly Fees</h3>
          </div>

          {/* Vehicle fee row */}
          <div className="p-5 space-y-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Monthly Fee per Vehicle (R)</p>
                <p className="text-xs text-gray-500">Current standard: <span className="font-medium text-gray-700">R{parsedGlobalVDisplay.toFixed(2)}/vehicle/month</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">R</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newV}
                  onChange={(e) => { setNewV(e.target.value); setSaved(false); }}
                  onFocus={(e) => e.target.select()}
                  className="pl-7 pr-3 py-2 w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              {vChanged && !isNaN(parsedNewV) && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${parsedNewV > parsedGlobalV ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                  {parsedNewV > parsedGlobalV ? '+' : ''}R{(parsedNewV - parsedGlobalV).toFixed(2)}
                </span>
              )}
            </div>
            <ClientExclusionPanel
              label="Vehicle Fee"
              icon={<Car className="w-3.5 h-3.5" />}
              accentColor="teal"
              orgs={orgs}
              loading={orgsLoading}
              globalRate={parsedNewV || parsedGlobalV}
              newRate={newV}
              excluded={excludedV}
              setExcluded={(s) => { setExcludedV(s); setSaved(false); }}
              open={openPanel === 'vehicle'}
              onToggle={() => setOpenPanel(openPanel === 'vehicle' ? null : 'vehicle')}
            />
          </div>

          {/* Driver fee row */}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Monthly Fee per Driver (R)</p>
                <p className="text-xs text-gray-500">Current standard: <span className="font-medium text-gray-700">R{parsedGlobalDDisplay.toFixed(2)}/driver/month</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">R</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newD}
                  onChange={(e) => { setNewD(e.target.value); setSaved(false); }}
                  onFocus={(e) => e.target.select()}
                  className="pl-7 pr-3 py-2 w-36 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {dChanged && !isNaN(parsedNewD) && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${parsedNewD > parsedGlobalD ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                  {parsedNewD > parsedGlobalD ? '+' : ''}R{(parsedNewD - parsedGlobalD).toFixed(2)}
                </span>
              )}
            </div>
            <ClientExclusionPanel
              label="Driver Fee"
              icon={<Users className="w-3.5 h-3.5" />}
              accentColor="blue"
              orgs={orgs}
              loading={orgsLoading}
              globalRate={parsedNewD || parsedGlobalD}
              newRate={newD}
              excluded={excludedD}
              setExcluded={(s) => { setExcludedD(s); setSaved(false); }}
              open={openPanel === 'driver'}
              onToggle={() => setOpenPanel(openPanel === 'driver' ? null : 'driver')}
            />
          </div>
        </div>

        {/* ── Other financial defaults ─────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Payment & Billing Defaults</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-5 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Payment Method</label>
              <select
                value={form['standard_payment_method'] ?? ''}
                onChange={(e) => { setForm({ ...form, standard_payment_method: e.target.value }); setSaved(false); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select --</option>
                <option value="Client Pay">Client Pay</option>
                <option value="Debit Order">Debit Order</option>
                <option value="EFT">EFT</option>
              </select>
            </div>

            <div className="p-5 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Payment Terms</label>
              <select
                value={form['standard_payment_terms'] ?? ''}
                onChange={(e) => { setForm({ ...form, standard_payment_terms: e.target.value }); setSaved(false); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select --</option>
                <option value="Immediate">Immediate</option>
                <option value="Next Day">Next Day</option>
                <option value="7-Days">7-Days</option>
                <option value="14-Days">14-Days</option>
                <option value="30-Days">30-Days</option>
                <option value="60-Days">60-Days</option>
                <option value="90-Days">90-Days</option>
              </select>
            </div>

            <div className="p-5 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Payment Date (Day of Month)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={form['standard_payment_date'] ?? ''}
                onChange={(e) => { setForm({ ...form, standard_payment_date: e.target.value }); setSaved(false); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1 – 31"
              />
            </div>

            <div className="p-5 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Debit Order Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                value={form['standard_debit_order_lead_days'] ?? ''}
                onChange={(e) => { setForm({ ...form, standard_debit_order_lead_days: e.target.value }); setSaved(false); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 3"
              />
              <p className="text-xs text-gray-500">Business days before the payment date that the debit order is submitted.</p>
            </div>

            <div className="p-5 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Late Payment Interest Rate (%)</label>
              <input
                type="text"
                inputMode="decimal"
                value={form['standard_late_payment_interest_rate'] ?? ''}
                onChange={(e) => { setForm({ ...form, standard_late_payment_interest_rate: e.target.value }); setSaved(false); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 2.5"
              />
              <p className="text-xs text-gray-500">Annual interest rate applied to overdue invoices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  DollarSign, Save, AlertCircle, CheckCircle, ArrowLeft,
  RefreshCw, Info, Car, Users, ChevronDown, ChevronUp,
} from 'lucide-react';

interface StandardMonthlyFeesProps {
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

type Section = 'vehicle' | 'driver';

function formatFee(fee: number | null) {
  if (fee == null) return null;
  return `R${Number(fee).toFixed(2)}`;
}

export default function MonthlyVehicleFees({ onBack }: StandardMonthlyFeesProps) {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Vehicle fee state
  const [globalVehicleFee, setGlobalVehicleFee] = useState('');
  const [newVehicleFee, setNewVehicleFee] = useState('');
  const [excludedVehicle, setExcludedVehicle] = useState<Set<string>>(new Set());
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [successVehicle, setSuccessVehicle] = useState('');
  const [errorVehicle, setErrorVehicle] = useState('');

  // Driver fee state
  const [globalDriverFee, setGlobalDriverFee] = useState('');
  const [newDriverFee, setNewDriverFee] = useState('');
  const [excludedDriver, setExcludedDriver] = useState<Set<string>>(new Set());
  const [savingDriver, setSavingDriver] = useState(false);
  const [successDriver, setSuccessDriver] = useState('');
  const [errorDriver, setErrorDriver] = useState('');

  // Section open/closed
  const [openSection, setOpenSection] = useState<Section>('vehicle');

  // Shared error
  const [loadError, setLoadError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [vRes, dRes, orgsRes] = await Promise.all([
        supabase.from('global_settings').select('value').eq('key', 'monthly_fee_per_vehicle').maybeSingle(),
        supabase.from('global_settings').select('value').eq('key', 'monthly_fee_per_driver').maybeSingle(),
        supabase
          .from('organizations')
          .select('id, name, monthly_fee_per_vehicle, monthly_fee_per_driver')
          .eq('organization_type', 'client')
          .eq('is_management_org', false)
          .order('name'),
      ]);

      if (vRes.error) throw vRes.error;
      if (dRes.error) throw dRes.error;
      if (orgsRes.error) throw orgsRes.error;

      const vFee = vRes.data?.value ?? '10';
      const dFee = dRes.data?.value ?? '0';
      setGlobalVehicleFee(vFee);
      setNewVehicleFee(vFee);
      setGlobalDriverFee(dFee);
      setNewDriverFee(dFee);

      const orgIds = (orgsRes.data ?? []).map((o) => o.id);
      const vehicleCounts: Record<string, number> = {};
      const driverCounts: Record<string, number> = {};

      if (orgIds.length > 0) {
        const [vcRes, dcRes] = await Promise.all([
          supabase.from('vehicles').select('organization_id').in('organization_id', orgIds).eq('status', 'active'),
          supabase.from('drivers').select('organization_id').in('organization_id', orgIds).eq('status', 'active'),
        ]);
        (vcRes.data ?? []).forEach((v) => { vehicleCounts[v.organization_id] = (vehicleCounts[v.organization_id] ?? 0) + 1; });
        (dcRes.data ?? []).forEach((d) => { driverCounts[d.organization_id] = (driverCounts[d.organization_id] ?? 0) + 1; });
      }

      setOrgs((orgsRes.data ?? []).map((o) => ({
        id: o.id,
        name: o.name,
        monthly_fee_per_vehicle: o.monthly_fee_per_vehicle,
        monthly_fee_per_driver: o.monthly_fee_per_driver,
        vehicle_count: vehicleCounts[o.id] ?? 0,
        driver_count: driverCounts[o.id] ?? 0,
      })));
    } catch (err: any) {
      setLoadError(err.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleExclude = (section: Section, id: string) => {
    const set = section === 'vehicle' ? new Set(excludedVehicle) : new Set(excludedDriver);
    set.has(id) ? set.delete(id) : set.add(id);
    section === 'vehicle' ? setExcludedVehicle(set) : setExcludedDriver(set);
  };

  const toggleAll = (section: Section, checked: boolean) => {
    const allIds = new Set(checked ? orgs.map((o) => o.id) : []);
    section === 'vehicle' ? setExcludedVehicle(allIds) : setExcludedDriver(allIds);
  };

  const handleSaveVehicle = async () => {
    const parsed = parseFloat(newVehicleFee);
    if (isNaN(parsed) || parsed < 0) { setErrorVehicle('Please enter a valid fee amount'); return; }
    setSavingVehicle(true);
    setErrorVehicle('');
    setSuccessVehicle('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: sErr } = await supabase.from('global_settings')
        .update({ value: parsed.toString(), updated_at: new Date().toISOString(), updated_by: user.id })
        .eq('key', 'monthly_fee_per_vehicle');
      if (sErr) throw sErr;

      setGlobalVehicleFee(parsed.toString());

      const toUpdate = orgs.filter((o) => !excludedVehicle.has(o.id));
      if (toUpdate.length > 0) {
        const { error: uErr } = await supabase.from('organizations')
          .update({ monthly_fee_per_vehicle: parsed })
          .in('id', toUpdate.map((o) => o.id));
        if (uErr) throw uErr;
        setOrgs((prev) => prev.map((o) =>
          excludedVehicle.has(o.id) ? o : { ...o, monthly_fee_per_vehicle: parsed }
        ));
      }

      const skipped = excludedVehicle.size;
      setSuccessVehicle(
        `Vehicle fee updated to R${parsed.toFixed(2)} and applied to ${toUpdate.length} client(s).` +
        (skipped > 0 ? ` ${skipped} client(s) excluded.` : '')
      );
    } catch (err: any) {
      setErrorVehicle(err.message ?? 'Failed to save');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleSaveDriver = async () => {
    const parsed = parseFloat(newDriverFee);
    if (isNaN(parsed) || parsed < 0) { setErrorDriver('Please enter a valid fee amount'); return; }
    setSavingDriver(true);
    setErrorDriver('');
    setSuccessDriver('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: sErr } = await supabase.from('global_settings')
        .update({ value: parsed.toString(), updated_at: new Date().toISOString(), updated_by: user.id })
        .eq('key', 'monthly_fee_per_driver');
      if (sErr) throw sErr;

      setGlobalDriverFee(parsed.toString());

      const toUpdate = orgs.filter((o) => !excludedDriver.has(o.id));
      if (toUpdate.length > 0) {
        const { error: uErr } = await supabase.from('organizations')
          .update({ monthly_fee_per_driver: parsed })
          .in('id', toUpdate.map((o) => o.id));
        if (uErr) throw uErr;
        setOrgs((prev) => prev.map((o) =>
          excludedDriver.has(o.id) ? o : { ...o, monthly_fee_per_driver: parsed }
        ));
      }

      const skipped = excludedDriver.size;
      setSuccessDriver(
        `Driver fee updated to R${parsed.toFixed(2)} and applied to ${toUpdate.length} client(s).` +
        (skipped > 0 ? ` ${skipped} client(s) excluded.` : '')
      );
    } catch (err: any) {
      setErrorDriver(err.message ?? 'Failed to save');
    } finally {
      setSavingDriver(false);
    }
  };

  const parsedNewV = parseFloat(newVehicleFee);
  const parsedGlobalV = parseFloat(globalVehicleFee || '0');
  const parsedNewD = parseFloat(newDriverFee);
  const parsedGlobalD = parseFloat(globalDriverFee || '0');
  const vehicleFeeChanged = newVehicleFee !== globalVehicleFee;
  const driverFeeChanged = newDriverFee !== globalDriverFee;

  const allVehicleExcluded = orgs.length > 0 && excludedVehicle.size === orgs.length;
  const allDriverExcluded = orgs.length > 0 && excludedDriver.size === orgs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Standard Monthly Fees</h2>
            <p className="text-sm text-gray-500">Manage the global rates charged per active vehicle and driver each month</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{loadError}</p>
        </div>
      )}

      {/* ── Vehicle Fee Section ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'vehicle' ? 'driver' : 'vehicle')}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Vehicle Fee</p>
              <p className="text-xs text-gray-500">Current global rate: <span className="font-medium text-gray-700">R{parsedGlobalV.toFixed(2)}</span> / vehicle / month</p>
            </div>
          </div>
          {openSection === 'vehicle' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSection === 'vehicle' && (
          <div className="border-t border-gray-100">
            {/* Rate input */}
            <div className="px-6 py-5 space-y-4">
              {errorVehicle && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{errorVehicle}</p>
                </div>
              )}
              {successVehicle && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{successVehicle}</p>
                </div>
              )}

              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New global rate (R)</label>
                  <div className="relative w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">R</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newVehicleFee}
                      onChange={(e) => { setNewVehicleFee(e.target.value); setSuccessVehicle(''); }}
                      onFocus={(e) => e.target.select()}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {vehicleFeeChanged && !isNaN(parsedNewV) && (
                  <span className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${parsedNewV > parsedGlobalV ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {parsedNewV > parsedGlobalV ? `+R${(parsedNewV - parsedGlobalV).toFixed(2)}` : `-R${(parsedGlobalV - parsedNewV).toFixed(2)}`}
                  </span>
                )}
              </div>

              <button
                onClick={handleSaveVehicle}
                disabled={savingVehicle || !vehicleFeeChanged || isNaN(parsedNewV) || parsedNewV < 0}
                className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingVehicle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingVehicle ? 'Saving...' : 'Save Vehicle Fee'}
              </button>
            </div>

            {/* Client table */}
            <div className="border-t border-gray-100">
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Client Exclusions</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tick clients to <span className="font-medium">exclude</span> from the global rate change above</p>
                </div>
                <button onClick={load} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
              ) : orgs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No client organisations found</div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-[2rem_1fr_5rem_6rem] gap-3 px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100">
                      <label className="flex items-center justify-center cursor-pointer" title="Exclude all">
                        <input
                          type="checkbox"
                          checked={allVehicleExcluded}
                          onChange={(e) => toggleAll('vehicle', e.target.checked)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                      </label>
                      <span>Organisation</span>
                      <span className="text-center">Vehicles</span>
                      <span className="text-right">Current Rate</span>
                    </div>

                    {orgs.map((org) => {
                      const excluded = excludedVehicle.has(org.id);
                      const differsFromGlobal = org.monthly_fee_per_vehicle != null &&
                        Math.abs(org.monthly_fee_per_vehicle - parsedGlobalV) > 0.001;
                      const fee = formatFee(org.monthly_fee_per_vehicle);
                      return (
                        <div
                          key={org.id}
                          onClick={() => toggleExclude('vehicle', org.id)}
                          className={`grid grid-cols-[2rem_1fr_5rem_6rem] gap-3 px-6 py-3 items-center cursor-pointer transition-colors ${excluded ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={excluded}
                              onChange={() => toggleExclude('vehicle', org.id)}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                          </div>
                          <span className={`text-sm font-medium truncate ${excluded ? 'text-amber-700' : 'text-gray-900'}`}>{org.name}</span>
                          <span className="text-sm text-gray-500 text-center">{org.vehicle_count}</span>
                          <div className="text-right">
                            {fee
                              ? <span className={`text-sm font-medium ${differsFromGlobal ? 'text-amber-600' : 'text-gray-900'}`}>{fee}</span>
                              : <span className="text-sm text-gray-400 italic">Not set</span>
                            }
                            {differsFromGlobal && <span className="ml-1 text-xs text-amber-500">(custom)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {excludedVehicle.size > 0 && (
                    <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      {excludedVehicle.size} client(s) will keep their current vehicle fee when you save.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Driver Fee Section ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'driver' ? 'vehicle' : 'driver')}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Driver Fee</p>
              <p className="text-xs text-gray-500">Current global rate: <span className="font-medium text-gray-700">R{parsedGlobalD.toFixed(2)}</span> / driver / month</p>
            </div>
          </div>
          {openSection === 'driver' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSection === 'driver' && (
          <div className="border-t border-gray-100">
            {/* Rate input */}
            <div className="px-6 py-5 space-y-4">
              {errorDriver && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{errorDriver}</p>
                </div>
              )}
              {successDriver && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{successDriver}</p>
                </div>
              )}

              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New global rate (R)</label>
                  <div className="relative w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">R</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newDriverFee}
                      onChange={(e) => { setNewDriverFee(e.target.value); setSuccessDriver(''); }}
                      onFocus={(e) => e.target.select()}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {driverFeeChanged && !isNaN(parsedNewD) && (
                  <span className={`text-xs font-medium px-2.5 py-1.5 rounded-lg ${parsedNewD > parsedGlobalD ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                    {parsedNewD > parsedGlobalD ? `+R${(parsedNewD - parsedGlobalD).toFixed(2)}` : `-R${(parsedGlobalD - parsedNewD).toFixed(2)}`}
                  </span>
                )}
              </div>

              <button
                onClick={handleSaveDriver}
                disabled={savingDriver || !driverFeeChanged || isNaN(parsedNewD) || parsedNewD < 0}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingDriver ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingDriver ? 'Saving...' : 'Save Driver Fee'}
              </button>
            </div>

            {/* Client table */}
            <div className="border-t border-gray-100">
              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Client Exclusions</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tick clients to <span className="font-medium">exclude</span> from the global rate change above</p>
                </div>
                <button onClick={load} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
              ) : orgs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No client organisations found</div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-[2rem_1fr_5rem_6rem] gap-3 px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-t border-gray-100">
                      <label className="flex items-center justify-center cursor-pointer" title="Exclude all">
                        <input
                          type="checkbox"
                          checked={allDriverExcluded}
                          onChange={(e) => toggleAll('driver', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                      <span>Organisation</span>
                      <span className="text-center">Drivers</span>
                      <span className="text-right">Current Rate</span>
                    </div>

                    {orgs.map((org) => {
                      const excluded = excludedDriver.has(org.id);
                      const differsFromGlobal = org.monthly_fee_per_driver != null &&
                        Math.abs(org.monthly_fee_per_driver - parsedGlobalD) > 0.001;
                      const fee = formatFee(org.monthly_fee_per_driver);
                      return (
                        <div
                          key={org.id}
                          onClick={() => toggleExclude('driver', org.id)}
                          className={`grid grid-cols-[2rem_1fr_5rem_6rem] items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${excluded ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={excluded}
                              onChange={() => toggleExclude('driver', org.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <span className={`text-sm font-medium truncate ${excluded ? 'text-amber-700' : 'text-gray-900'}`}>{org.name}</span>
                          <span className="text-sm text-gray-500 text-center">{org.driver_count}</span>
                          <div className="text-right">
                            {fee
                              ? <span className={`text-sm font-medium ${differsFromGlobal ? 'text-amber-600' : 'text-gray-900'}`}>{fee}</span>
                              : <span className="text-sm text-gray-400 italic">Not set</span>
                            }
                            {differsFromGlobal && <span className="ml-1 text-xs text-amber-500">(custom)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {excludedDriver.size > 0 && (
                    <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      {excludedDriver.size} client(s) will keep their current driver fee when you save.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, X, Search, RotateCcw, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  license_disk_expiry: string;
  status: string;
  initial_odometer_reading: number;
  average_fuel_consumption_per_100km: number;
  tank_capacity?: number;
  vin_number?: string;
  vehicle_type?: string;
  license_code_required?: string;
  last_service_date?: string;
  service_interval_km?: number;
  last_service_km_reading?: number;
  organization_id: string;
  deleted_at?: string | null;
  organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

interface VehicleManagementProps {
  onNavigate?: (view: string | null) => void;
}

export default function VehicleManagement({ onNavigate }: VehicleManagementProps = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('none');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);

  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_disk_expiry: '',
    vin_number: '',
    vehicle_type: 'ULP',
    fuel_type: 'ULP-95',
    license_code_required: 'Code B',
    status: 'active',
    initial_odometer_reading: 0,
    average_fuel_consumption_per_100km: 10,
    tank_capacity: 0,
    last_service_date: '',
    service_interval_km: 0,
    last_service_km_reading: 0,
    organization_id: '',
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId !== 'none') {
      loadVehicles();
    } else {
      setVehicles([]);
      setFilteredVehicles([]);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.organizations?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const loadOrganizations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingOrganizations(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserRole(profile.role);

      if (profile.role === 'super_admin') {
        const { data } = await supabase
          .from('organizations')
          .select('id, name, is_management_org')
          .neq('is_management_org', true)
          .order('name');

        if (data) {
          setOrganizations(data);
          setShowOrgSelector(true);
        }
      } else {
        const { data: childOrgs } = await supabase
          .from('organizations')
          .select('id, name, is_management_org')
          .eq('parent_org_id', profile.organization_id)
          .neq('is_management_org', true);

        const { data: ownOrg } = await supabase
          .from('organizations')
          .select('id, name, is_management_org')
          .eq('id', profile.organization_id)
          .maybeSingle();

        const allOrgs = [];
        if (ownOrg) allOrgs.push(ownOrg);
        if (childOrgs) allOrgs.push(...childOrgs);

        setOrganizations(allOrgs);

        // If user only has their own organization (no child orgs), auto-select and hide selector
        if (allOrgs.length === 1) {
          setSelectedOrgId(allOrgs[0].id);
          setShowOrgSelector(false);
        } else {
          setShowOrgSelector(true);
        }
      }
    }
    setLoadingOrganizations(false);
  };

  const loadVehicles = async () => {
    if (selectedOrgId === 'none') return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (selectedOrgId === 'all' && profile.role === 'super_admin') {
        const { data } = await supabase
          .from('vehicles')
          .select('*, organizations(name)')
          .order('registration_number');

        if (data) setVehicles(data);
      } else if (selectedOrgId === 'all') {
        const { data: childOrgs } = await supabase
          .from('organizations')
          .select('id')
          .eq('parent_org_id', profile.organization_id);

        const orgIds = [profile.organization_id];
        if (childOrgs) {
          orgIds.push(...childOrgs.map(org => org.id));
        }

        const { data } = await supabase
          .from('vehicles')
          .select('*, organizations(name)')
          .in('organization_id', orgIds)
          .order('registration_number');

        if (data) setVehicles(data);
      } else {
        const { data } = await supabase
          .from('vehicles')
          .select('*, organizations(name)')
          .eq('organization_id', selectedOrgId)
          .order('registration_number');

        if (data) setVehicles(data);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('Organization not found');
      }

      // Validate VIN is provided
      if (!formData.vin_number || formData.vin_number.trim() === '') {
        throw new Error('VIN Number is required for vehicle verification');
      }

      // Prepare vehicle data
      const vehicleData = {
        ...formData,
        fuel_type: formData.vehicle_type === 'Electric' ? null : formData.fuel_type,
      };

      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) throw error;
      } else {
        const orgId = formData.organization_id || profile.organization_id;
        if (!orgId) throw new Error('Organization is required');

        const { error } = await supabase
          .from('vehicles')
          .insert({
            ...vehicleData,
            organization_id: orgId,
          });

        if (error) throw error;
      }

      resetForm();
      loadVehicles();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      license_disk_expiry: vehicle.license_disk_expiry,
      vin_number: vehicle.vin_number || '',
      vehicle_type: vehicle.vehicle_type || 'ULP',
      fuel_type: (vehicle as any).fuel_type || 'ULP-95',
      license_code_required: vehicle.license_code_required || 'Code B',
      status: vehicle.status,
      initial_odometer_reading: vehicle.initial_odometer_reading,
      average_fuel_consumption_per_100km: vehicle.average_fuel_consumption_per_100km,
      tank_capacity: vehicle.tank_capacity || 0,
      last_service_date: vehicle.last_service_date || '',
      service_interval_km: vehicle.service_interval_km || 0,
      last_service_km_reading: vehicle.last_service_km_reading || 0,
      organization_id: vehicle.organization_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? Note: The vehicle will remain in the system database for audit and reporting purposes.')) return;

    const { data, error } = await supabase
      .rpc('soft_delete_vehicle', { vehicle_id: id });

    if (error) {
      alert('Error deleting vehicle: ' + error.message);
    } else if (data && !data.success) {
      alert('Error: ' + (data.error || 'Failed to delete vehicle'));
    } else {
      loadVehicles();
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Are you sure you want to reactivate this vehicle?')) return;

    const { data, error } = await supabase
      .rpc('reactivate_vehicle', { vehicle_id: id });

    if (error) {
      alert('Error reactivating vehicle: ' + error.message);
    } else if (data && !data.success) {
      alert('Error: ' + (data.error || 'Failed to reactivate vehicle'));
    } else {
      loadVehicles();
    }
  };

  const resetForm = () => {
    setFormData({
      registration_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_disk_expiry: '',
      vin_number: '',
      vehicle_type: 'ULP',
      fuel_type: 'ULP-95',
      license_code_required: 'Code B',
      status: 'active',
      initial_odometer_reading: 0,
      average_fuel_consumption_per_100km: 10,
      tank_capacity: 0,
      last_service_date: '',
      service_interval_km: 0,
      last_service_km_reading: 0,
      organization_id: selectedOrgId !== 'all' ? selectedOrgId : '',
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-900">Vehicles</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData({ ...formData, organization_id: selectedOrgId });
              setShowForm(true);
            }}
            disabled={selectedOrgId === 'all' || selectedOrgId === 'none'}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={selectedOrgId === 'all' || selectedOrgId === 'none' ? 'Please select a specific organization first' : ''}
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate(null)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main Menu
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div key={editingVehicle?.id || 'new'} className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="vehicle-form"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
                >
                  {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </div>

            <form id="vehicle-form" onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!editingVehicle && formData.organization_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Adding vehicle to:</span> {organizations.find(org => org.id === formData.organization_id)?.name}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">Vehicle Identification</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="ABC 123 GP"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      VIN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vin_number || ''}
                      onChange={(e) => setFormData({ ...formData, vin_number: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="1HGBH41JXMN109186"
                      minLength={11}
                      maxLength={17}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">VIN required for fuel purchase authentication (11-17 characters)</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">Vehicle Details</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="Toyota"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="Hilux"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">License & Fuel Details</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      License Disk Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.license_disk_expiry}
                      onChange={(e) => setFormData({ ...formData, license_disk_expiry: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      min={new Date().toISOString().split('T')[0]}
                      max={`${new Date().getFullYear() + 1}-12-31`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Vehicle Type</label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => {
                        const newVehicleType = e.target.value;
                        let defaultFuelType = '';

                        if (newVehicleType === 'ULP' || newVehicleType === 'HYBRID-ULP') {
                          defaultFuelType = 'ULP-95';
                        } else if (newVehicleType === 'DIESEL' || newVehicleType === 'HYBRID-DIESEL') {
                          defaultFuelType = 'Diesel-50';
                        }

                        setFormData({
                          ...formData,
                          vehicle_type: newVehicleType,
                          fuel_type: defaultFuelType
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      required
                    >
                      <option value="ULP">ULP (Petrol)</option>
                      <option value="DIESEL">DIESEL</option>
                      <option value="HYBRID-ULP">HYBRID-ULP (Hybrid Petrol)</option>
                      <option value="HYBRID-DIESEL">HYBRID-DIESEL (Hybrid Diesel)</option>
                      <option value="ELECTRIC">ELECTRIC</option>
                    </select>
                  </div>
                  {formData.vehicle_type !== 'ELECTRIC' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Fuel Type</label>
                      <select
                        value={formData.fuel_type}
                        onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        required
                      >
                        {(formData.vehicle_type === 'ULP' || formData.vehicle_type === 'HYBRID-ULP') && (
                          <>
                            <option value="ULP-93">ULP-93 Octane</option>
                            <option value="ULP-95">ULP-95 Octane</option>
                          </>
                        )}
                        {(formData.vehicle_type === 'DIESEL' || formData.vehicle_type === 'HYBRID-DIESEL') && (
                          <>
                            <option value="Diesel-10">Diesel-10 PPM</option>
                            <option value="Diesel-50">Diesel-50 PPM</option>
                            <option value="Diesel-500">Diesel-500 PPM</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">Status & Requirements</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">License Code Required</label>
                    <select
                      value={formData.license_code_required}
                      onChange={(e) => setFormData({ ...formData, license_code_required: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      required
                    >
                      <option value="Code A1">Code A1 (Motorcycle - Learner)</option>
                      <option value="Code A">Code A (Motorcycle)</option>
                      <option value="Code B">Code B (Light Vehicle)</option>
                      <option value="Code EB">Code EB (Light Vehicle + Trailer)</option>
                      <option value="Code C1">Code C1 (Light Truck)</option>
                      <option value="Code EC1">Code EC1 (Light Truck + Trailer)</option>
                      <option value="Code C">Code C (Heavy Truck)</option>
                      <option value="Code EC">Code EC (Heavy Truck + Trailer)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Initial Odometer (km)
                    </label>
                    <input
                      type="number"
                      value={formData.initial_odometer_reading}
                      onChange={(e) => setFormData({ ...formData, initial_odometer_reading: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="50000"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Fuel Consumption (L/100km)
                    </label>
                    <input
                      type="number"
                      value={formData.average_fuel_consumption_per_100km}
                      onChange={(e) => setFormData({ ...formData, average_fuel_consumption_per_100km: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="10.5"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Tank Capacity (Liters)
                    </label>
                    <input
                      type="number"
                      value={formData.tank_capacity}
                      onChange={(e) => setFormData({ ...formData, tank_capacity: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="60"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-1">Maintenance</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Last Service Date
                    </label>
                    <input
                      type="date"
                      value={formData.last_service_date}
                      onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Last Service KM Reading
                    </label>
                    <input
                      type="number"
                      value={formData.last_service_km_reading}
                      onChange={(e) => setFormData({ ...formData, last_service_km_reading: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="50000"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Service Interval (km)
                    </label>
                    <input
                      type="number"
                      value={formData.service_interval_km}
                      onChange={(e) => setFormData({ ...formData, service_interval_km: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="10000"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Make & Model or Registration"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={selectedOrgId === 'none'}
          />
        </div>
        {showOrgSelector && (
          <div>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">Select an Organization</option>
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              {userRole === 'super_admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading || loadingOrganizations ? (
              <tr>
                <td colSpan={userRole === 'super_admin' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            ) : selectedOrgId === 'none' ? (
              <tr>
                <td colSpan={userRole === 'super_admin' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                  Please select an organization to view vehicles.
                </td>
              </tr>
            ) : filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={userRole === 'super_admin' ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? 'No vehicles found matching your search.' : 'No vehicles added yet.'}
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className={`hover:bg-gray-50 ${vehicle.deleted_at ? 'bg-gray-50 opacity-60' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className={`font-medium ${vehicle.deleted_at ? 'text-gray-500' : 'text-gray-900'}`}>
                    {vehicle.registration_number}
                    {vehicle.deleted_at && <span className="ml-2 text-xs text-red-600">(Deleted)</span>}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className={`text-sm ${vehicle.deleted_at ? 'text-gray-500' : 'text-gray-900'}`}>{vehicle.make} {vehicle.model}</p>
                </td>
                {userRole === 'super_admin' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className={`text-sm ${vehicle.deleted_at ? 'text-gray-500' : 'text-gray-700'}`}>{vehicle.organizations?.name || 'N/A'}</p>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {vehicle.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(vehicle.license_disk_expiry).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vehicle.deleted_at ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {vehicle.deleted_at ? (
                      <button
                        onClick={() => handleReactivate(vehicle.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Reactivate Vehicle"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reactivate
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
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

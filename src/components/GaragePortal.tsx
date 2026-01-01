import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getFuelTypeDisplayName, sortFuelTypes } from '../lib/fuelTypes';
import { Store, LogOut, Save, MapPin, AlertCircle, X } from 'lucide-react';
import GarageContactManagement from './GarageContactManagement';

interface GaragePortalProps {
  garageId: string;
  garageName: string;
  onLogout: () => void;
}

interface OtherOfferings {
  convenience_shop?: boolean;
  branded_convenience_store?: { enabled: boolean; name: string };
  takeaways?: boolean;
  branded_takeaways?: { enabled: boolean; name: string };
  specialty_offering?: { enabled: boolean; name: string };
  lpg_gas?: boolean;
  paraffin?: boolean;
  other?: { enabled: boolean; name: string };
}

interface ContactPerson {
  name: string;
  surname: string;
  email: string;
  phone: string;
  mobile_phone: string;
  password: string;
  is_primary: boolean;
}

interface GarageData {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  contact_persons: ContactPerson[];
  fuel_types?: string[];
  fuel_prices?: Record<string, number>;
  fuel_brand?: string;
  other_offerings?: OtherOfferings;
}

export default function GaragePortal({ garageId, garageName, onLogout }: GaragePortalProps) {
  const [garage, setGarage] = useState<GarageData | null>(null);
  const [fuelPrices, setFuelPrices] = useState<Record<string, number>>({});
  const [otherOfferings, setOtherOfferings] = useState<OtherOfferings>({});
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadGarageData();
  }, [garageId]);

  const loadGarageData = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Garage not found');

      const roundedFuelPrices: Record<string, number> = {};
      if (data.fuel_prices) {
        Object.keys(data.fuel_prices).forEach(fuelType => {
          roundedFuelPrices[fuelType] = Math.round(data.fuel_prices[fuelType] * 100) / 100;
        });
      }

      setGarage(data);
      setFuelPrices(roundedFuelPrices);
      setOtherOfferings(data.other_offerings || {});
      setContactPersons(data.contact_persons || []);
    } catch (err: any) {
      console.error('Error loading garage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('garages')
        .update({
          fuel_prices: fuelPrices,
          other_offerings: otherOfferings,
          contact_persons: contactPersons
        })
        .eq('id', garageId);

      if (updateError) throw updateError;

      setSuccess('Changes saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      loadGarageData();
    } catch (err: any) {
      console.error('Error updating garage:', err);
      setError(err.message || 'Failed to update garage information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (garage) {
      const roundedFuelPrices: Record<string, number> = {};
      if (garage.fuel_prices) {
        Object.keys(garage.fuel_prices).forEach(fuelType => {
          roundedFuelPrices[fuelType] = Math.round(garage.fuel_prices![fuelType] * 100) / 100;
        });
      }
      setFuelPrices(roundedFuelPrices);
      setOtherOfferings(garage.other_offerings || {});
      setContactPersons(garage.contact_persons || []);
      setError('');
      setSuccess('');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-center text-gray-900">Garage not found</p>
          <button
            onClick={onLogout}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{garageName}</h1>
                <p className="text-xs text-gray-600">Garage Portal</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Garage Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <div className="flex items-start gap-2 mt-1 text-gray-900">
                  <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                  <div>
                    {[
                      garage.address_line_1,
                      garage.address_line_2,
                      garage.city,
                      garage.province,
                      garage.postal_code
                    ].filter(field => field && field.trim() !== '').join(', ')}
                  </div>
                </div>
              </div>

              {garage.fuel_brand && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fuel Brand</label>
                  <div className="mt-1 text-gray-900 font-medium">{garage.fuel_brand}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fuel Prices Management</h2>

            {!garage.fuel_types || garage.fuel_types.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No fuel types configured for this garage.</p>
                <p className="text-gray-500 text-sm mt-2">Contact system administrator to add fuel types.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Update your fuel prices below. Prices are in Rand per liter.
                </p>

                <div className="space-y-3">
                  {sortFuelTypes(garage.fuel_types).map((fuelType) => (
                    <div
                      key={fuelType}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900">
                          {getFuelTypeDisplayName(fuelType)}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">Price per liter</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">R</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fuelPrices[fuelType] || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            const roundedValue = isNaN(value) ? 0 : Math.round(value * 100) / 100;
                            setFuelPrices({
                              ...fuelPrices,
                              [fuelType]: roundedValue
                            });
                          }}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-900 text-sm font-medium">Price Update Guidelines:</p>
                  <ul className="text-blue-800 text-sm mt-2 space-y-1 list-disc list-inside">
                    <li>Enter prices in Rand per liter</li>
                    <li>Prices are visible to all users on the system</li>
                    <li>Update prices regularly to reflect market changes</li>
                    <li>Click "Save Changes" at the bottom to apply your updates</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <GarageContactManagement
            contacts={contactPersons}
            onUpdate={setContactPersons}
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Offerings</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the additional services and products offered at your location
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={otherOfferings?.convenience_shop || false}
                  onChange={(e) => {
                    setOtherOfferings({
                      ...otherOfferings,
                      convenience_shop: e.target.checked
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Convenience Shop</span>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={otherOfferings?.branded_convenience_store?.enabled || false}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        branded_convenience_store: e.target.checked
                          ? { enabled: true, name: otherOfferings?.branded_convenience_store?.name || '' }
                          : undefined
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Branded Convenience Store</span>
                </div>
                {otherOfferings?.branded_convenience_store?.enabled && (
                  <input
                    type="text"
                    placeholder="Enter brand name"
                    value={otherOfferings.branded_convenience_store.name}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        branded_convenience_store: {
                          enabled: true,
                          name: e.target.value
                        }
                      });
                    }}
                    className="w-full ml-7 border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={otherOfferings?.takeaways || false}
                  onChange={(e) => {
                    setOtherOfferings({
                      ...otherOfferings,
                      takeaways: e.target.checked
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Takeaways</span>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={otherOfferings?.branded_takeaways?.enabled || false}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        branded_takeaways: e.target.checked
                          ? { enabled: true, name: otherOfferings?.branded_takeaways?.name || '' }
                          : undefined
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Branded Takeaways</span>
                </div>
                {otherOfferings?.branded_takeaways?.enabled && (
                  <input
                    type="text"
                    placeholder="Enter brand name"
                    value={otherOfferings.branded_takeaways.name}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        branded_takeaways: {
                          enabled: true,
                          name: e.target.value
                        }
                      });
                    }}
                    className="w-full ml-7 border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                )}
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={otherOfferings?.specialty_offering?.enabled || false}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        specialty_offering: e.target.checked
                          ? { enabled: true, name: otherOfferings?.specialty_offering?.name || '' }
                          : undefined
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Specialty Offering</span>
                </div>
                {otherOfferings?.specialty_offering?.enabled && (
                  <input
                    type="text"
                    placeholder="Describe specialty offering"
                    value={otherOfferings.specialty_offering.name}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        specialty_offering: {
                          enabled: true,
                          name: e.target.value
                        }
                      });
                    }}
                    className="w-full ml-7 border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={otherOfferings?.lpg_gas || false}
                  onChange={(e) => {
                    setOtherOfferings({
                      ...otherOfferings,
                      lpg_gas: e.target.checked
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">LPG Gas</span>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={otherOfferings?.paraffin || false}
                  onChange={(e) => {
                    setOtherOfferings({
                      ...otherOfferings,
                      paraffin: e.target.checked
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Paraffin</span>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={otherOfferings?.other?.enabled || false}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        other: e.target.checked
                          ? { enabled: true, name: otherOfferings?.other?.name || '' }
                          : undefined
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Other</span>
                </div>
                {otherOfferings?.other?.enabled && (
                  <input
                    type="text"
                    placeholder="Describe other offering"
                    value={otherOfferings.other.name}
                    onChange={(e) => {
                      setOtherOfferings({
                        ...otherOfferings,
                        other: {
                          enabled: true,
                          name: e.target.value
                        }
                      });
                    }}
                    className="w-full ml-7 border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-900 text-sm font-medium">Guidelines:</p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Select all services and products you offer</li>
                <li>For branded items, provide the brand name</li>
                <li>These offerings are visible to all users</li>
                <li>Click "Save Changes" at the bottom to apply your updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>{success}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

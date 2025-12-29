import { useState, useEffect } from 'react';
import { Camera, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { supabase } from '../lib/supabase';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  license_disk_expiry: string;
  vin_number?: string;
  license_code_required?: string;
  initial_odometer_reading?: number;
}

interface DrawVehicleProps {
  organizationId: string;
  driverId: string;
  onBack: () => void;
}

export default function DrawVehicle({ organizationId, driverId, onBack }: DrawVehicleProps) {
  const [step, setStep] = useState<'scan' | 'enter-odometer' | 'confirm-mismatch' | 'confirm-license-warning'>('scan');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [odometerReading, setOdometerReading] = useState('');
  const [expectedOdometer, setExpectedOdometer] = useState<number | null>(null);
  const [isFirstDraw, setIsFirstDraw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [odometerMismatch, setOdometerMismatch] = useState(false);
  const [licenseWarning, setLicenseWarning] = useState(false);
  const [driverLicenseCode, setDriverLicenseCode] = useState<string>('');

  useEffect(() => {
    loadVehicles();
    getCurrentLocation();
    loadDriverLicenseCode();
  }, []);

  const loadDriverLicenseCode = async () => {
    const { data: driver } = await supabase
      .from('drivers')
      .select('license_type')
      .eq('id', driverId)
      .maybeSingle();

    if (driver) {
      setDriverLicenseCode(driver.license_type || 'Code B');
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const loadVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('registration_number');

    if (data) setVehicles(data);
  };

  const handleScanStart = () => {
    setShowBarcodeScanner(true);
  };

  const handleBarcodeScan = async (barcodeData: string) => {
    setShowBarcodeScanner(false);
    setError('');

    const result = await findVehicleByLicenseDisk(barcodeData);
    if (!result) {
      setError('License disk verification failed. The barcode data does not match any vehicle.');
      return;
    }

    const { vehicle } = result;

    const hasActiveDrawing = await checkActiveDrawing(vehicle.id, driverId);
    if (hasActiveDrawing) {
      setError('This vehicle is already drawn by you. Please return it before drawing again.');
      return;
    }

    setSelectedVehicle(vehicle);

    // Check if driver's license qualifies for this vehicle
    const isQualified = await checkDriverLicenseQualifies(driverId, vehicle);
    if (!isQualified) {
      setLicenseWarning(true);
      setStep('confirm-license-warning');
    } else {
      setLicenseWarning(false);
      await loadExpectedOdometer(vehicle.id);
      setStep('enter-odometer');
    }
  };

  const loadExpectedOdometer = async (vehicleId: string) => {
    const { data: lastReturn } = await supabase
      .from('vehicle_transactions')
      .select('odometer_reading')
      .eq('vehicle_id', vehicleId)
      .eq('transaction_type', 'return')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastReturn?.odometer_reading) {
      setExpectedOdometer(lastReturn.odometer_reading);
      setIsFirstDraw(false);
    } else {
      // No previous return - this is the first draw, use initial odometer reading
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('initial_odometer_reading')
        .eq('id', vehicleId)
        .maybeSingle();

      if (vehicle?.initial_odometer_reading) {
        setExpectedOdometer(vehicle.initial_odometer_reading);
        setIsFirstDraw(true);
      } else {
        setExpectedOdometer(null);
        setIsFirstDraw(false);
      }
    }
  };

  const checkActiveDrawing = async (vehicleId: string, driverId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('vehicle_transactions')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .eq('driver_id', driverId)
      .eq('transaction_type', 'draw')
      .is('related_transaction_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return false;

    const { data: returnTransaction } = await supabase
      .from('vehicle_transactions')
      .select('id')
      .eq('related_transaction_id', data.id)
      .eq('transaction_type', 'return')
      .maybeSingle();

    return !returnTransaction;
  };

  const checkDriverLicenseQualifies = async (driverId: string, vehicle: Vehicle): Promise<boolean> => {
    // Get driver's license type
    const { data: driver } = await supabase
      .from('drivers')
      .select('license_type')
      .eq('id', driverId)
      .maybeSingle();

    if (!driver) {
      console.error('checkDriverLicenseQualifies: Driver not found');
      return false;
    }

    const licenseCode = driver.license_type || 'Code B';
    setDriverLicenseCode(licenseCode);

    const vehicleLicenseRequired = vehicle.license_code_required || 'Code B';

    console.log('Checking license qualification:', {
      driver_id: driverId,
      vehicle_id: vehicle.id,
      vehicle_reg: vehicle.registration_number,
      driver_license: licenseCode,
      vehicle_requires: vehicleLicenseRequired
    });

    // Call the database function to check if driver qualifies
    const { data, error } = await supabase
      .rpc('check_driver_license_qualifies', {
        p_driver_license_code: licenseCode,
        p_vehicle_license_required: vehicleLicenseRequired
      });

    if (error) {
      console.error('Error checking license qualification:', error);
      return false;
    }

    const isQualified = data === true;
    console.log('License qualification result:', isQualified);

    return isQualified;
  };

  const findVehicleByLicenseDisk = async (barcodeData: string): Promise<{ vehicle: Vehicle } | null> => {
    const barcodeFields = barcodeData.split('%');

    for (const vehicle of vehicles) {
      const vehicleReg = vehicle.registration_number.toUpperCase().replace(/\s+/g, '').replace(/-/g, '');

      for (const field of barcodeFields) {
        const cleanField = field.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');

        if (cleanField && cleanField === vehicleReg) {
          const expiryDate = new Date(vehicle.license_disk_expiry);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);

          if (expiryDate < today) {
            setError('Vehicle License Expired');
            return null;
          }

          return { vehicle };
        }
      }
    }

    return null;
  };

  const handleOdometerCheck = () => {
    if (!odometerReading || !selectedVehicle) return;

    const actualOdometer = parseInt(odometerReading);

    if (expectedOdometer !== null && Math.abs(actualOdometer - expectedOdometer) > 5) {
      setOdometerMismatch(true);
      setStep('confirm-mismatch');
    } else {
      handleSubmit(false, licenseWarning);
    }
  };

  const handleSubmit = async (logOdometerException: boolean, logLicenseException: boolean = false) => {
    if (!odometerReading || !selectedVehicle) return;

    console.log('handleSubmit called with:', {
      logOdometerException,
      logLicenseException,
      licenseWarningState: licenseWarning,
      driverLicenseCode,
      vehicleLicenseRequired: selectedVehicle.license_code_required
    });

    setError('');
    setLoading(true);

    try {
      const { data: transaction, error: insertError } = await supabase
        .from('vehicle_transactions')
        .insert({
          organization_id: organizationId,
          vehicle_id: selectedVehicle.id,
          driver_id: driverId,
          transaction_type: 'draw',
          odometer_reading: parseInt(odometerReading),
          location: location ? `${location.lat},${location.lng}` : 'Unknown',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (logOdometerException && expectedOdometer !== null) {
        console.log('Attempting to log odometer exception:', {
          driver_id: driverId,
          vehicle_id: selectedVehicle.id,
          organization_id: organizationId,
          expected_odometer: expectedOdometer,
          actual_odometer: odometerReading
        });

        const { error: exceptionError } = await supabase
          .from('vehicle_exceptions')
          .insert({
            vehicle_id: selectedVehicle.id,
            driver_id: driverId,
            organization_id: organizationId,
            exception_type: 'odometer_mismatch',
            description: `Odometer reading mismatch detected during vehicle draw. Expected ${expectedOdometer} km based on last return, but driver reported ${odometerReading} km.`,
            expected_value: expectedOdometer.toString(),
            actual_value: odometerReading,
            transaction_id: transaction.id,
            resolved: false,
          });

        if (exceptionError) {
          console.error('FAILED to log odometer exception:', exceptionError);
          setError(`Warning: Vehicle drawn but odometer exception logging failed: ${exceptionError.message}`);
        } else {
          console.log('Odometer exception logged successfully');
        }
      }

      if (logLicenseException) {
        const requiredLicense = selectedVehicle.license_code_required || 'Code B';
        console.log('Attempting to log license exception:', {
          driver_id: driverId,
          vehicle_id: selectedVehicle.id,
          organization_id: organizationId,
          driver_license: driverLicenseCode,
          required_license: requiredLicense
        });

        const { error: exceptionError } = await supabase
          .from('vehicle_exceptions')
          .insert({
            vehicle_id: selectedVehicle.id,
            driver_id: driverId,
            organization_id: organizationId,
            exception_type: 'unauthorized_license',
            description: `Driver does not have the required license to drive this vehicle. Driver has ${driverLicenseCode}, but vehicle requires ${requiredLicense}.`,
            expected_value: requiredLicense,
            actual_value: driverLicenseCode,
            transaction_id: transaction.id,
            resolved: false,
          });

        if (exceptionError) {
          console.error('FAILED to log license exception:', exceptionError);
          setError(`Warning: Vehicle drawn but exception logging failed: ${exceptionError.message}`);
        } else {
          console.log('License exception logged successfully');
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to draw vehicle');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('scan');
    setSelectedVehicle(null);
    setOdometerReading('');
    setExpectedOdometer(null);
    setIsFirstDraw(false);
    setOdometerMismatch(false);
    setLicenseWarning(false);
    setSuccess(false);
    setError('');
    onBack();
  };

  if (showBarcodeScanner) {
    return (
      <BarcodeScanner
        label="Scan License Disk Barcode"
        onScan={handleBarcodeScan}
        onCancel={() => setShowBarcodeScanner(false)}
      />
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Drawn Successfully!</h2>
          <p className="text-gray-600 mb-2">Vehicle: {selectedVehicle?.registration_number}</p>
          <p className="text-gray-600 mb-6">Odometer: {parseInt(odometerReading).toLocaleString()} km</p>
          <button
            onClick={resetForm}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-blue-700 p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Draw Vehicle</h1>
            <p className="text-sm text-blue-100">Check Out a Vehicle</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === 'scan' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Vehicle</h2>
            <p className="text-gray-600 mb-6">Scan the license disk barcode or manually select a vehicle.</p>

            {selectedVehicle && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-900 font-medium">Vehicle Selected:</p>
                <p className="text-lg font-bold text-green-900">{selectedVehicle.registration_number}</p>
                <p className="text-sm text-green-700">{selectedVehicle.make} {selectedVehicle.model}</p>
                <p className="text-xs text-green-600 mt-2">
                  License Expires: {new Date(selectedVehicle.license_disk_expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manual Selection</label>
                <select
                  value={selectedVehicle?.id || ''}
                  onChange={async (e) => {
                    const vehicle = vehicles.find(v => v.id === e.target.value);
                    if (vehicle) {
                      setError('');
                      const hasActiveDrawing = await checkActiveDrawing(vehicle.id, driverId);
                      if (hasActiveDrawing) {
                        setError('This vehicle is already drawn by you. Please return it before drawing again.');
                        return;
                      }
                      setSelectedVehicle(vehicle);
                      await loadExpectedOdometer(vehicle.id);
                    }
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-base bg-white appearance-none cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{ fontSize: '16px', minHeight: '50px' }}
                >
                  <option value="">Select Vehicle by Registration</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVehicle && (
                <button
                  onClick={async () => {
                    const isQualified = await checkDriverLicenseQualifies(driverId, selectedVehicle);
                    if (!isQualified) {
                      setLicenseWarning(true);
                      setStep('confirm-license-warning');
                    } else {
                      setLicenseWarning(false);
                      setStep('enter-odometer');
                    }
                  }}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Continue to Odometer Reading
                </button>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={handleScanStart}
                className="w-full bg-blue-600 text-white py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-6 h-6" />
                Scan License Disk Barcode
              </button>
            </div>
          </div>
        )}

        {step === 'enter-odometer' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Odometer Reading</h2>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900 font-medium">Vehicle:</p>
              <p className="text-lg font-bold text-green-900">{selectedVehicle?.registration_number}</p>
              <p className="text-sm text-green-700">{selectedVehicle?.make} {selectedVehicle?.model}</p>
              <p className="text-xs text-green-600 mt-2">
                License Expires: {selectedVehicle && new Date(selectedVehicle.license_disk_expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {expectedOdometer !== null && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Expected Odometer Reading</p>
                  <p className="text-2xl font-bold text-blue-900">{expectedOdometer.toLocaleString()} km</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {isFirstDraw ? 'Based on initial odometer reading (first draw)' : 'Based on last return transaction'}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Please verify the current odometer reading matches or is close to this value.</p>
                </div>
              </div>
            )}

            {expectedOdometer === null && (
              <div className="bg-amber-50 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">No Odometer Reference Available</p>
                  <p className="text-xs text-amber-700 mt-1">Please enter the current odometer reading carefully.</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Odometer Reading (km)</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-lg bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ fontSize: '16px', minHeight: '50px' }}
                placeholder="125000"
                required
              />
            </div>

            <button
              onClick={handleOdometerCheck}
              disabled={loading || !odometerReading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Confirm Draw Vehicle'}
            </button>
          </div>
        )}

        {step === 'confirm-mismatch' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Odometer Reading Mismatch</h2>

            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-red-900 text-center mb-4">
                The odometer reading you entered does not match the expected reading.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-700">Expected Reading:</span>
                  <span className="text-lg font-bold text-red-900">{expectedOdometer?.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-700">Your Reading:</span>
                  <span className="text-lg font-bold text-red-900">{parseInt(odometerReading).toLocaleString()} km</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-red-200">
                  <span className="text-sm font-medium text-red-700">Difference:</span>
                  <span className="text-lg font-bold text-red-900">
                    {Math.abs(parseInt(odometerReading) - (expectedOdometer || 0)).toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-amber-900 mb-2">Possible Causes:</p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>Vehicle was used without proper authorization</li>
                <li>Previous return was not properly recorded</li>
                <li>Odometer reading was incorrectly entered</li>
                <li>You may have selected the wrong vehicle</li>
              </ul>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              If you are certain this is the correct vehicle and the odometer reading is accurate,
              an exception report will be logged for investigation by your organization.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSubmit(true, licenseWarning)}
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Confirm & Log Exception'}
              </button>

              <button
                onClick={() => {
                  setStep('enter-odometer');
                  setOdometerMismatch(false);
                  setOdometerReading('');
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Re-enter Odometer Reading
              </button>

              <button
                onClick={() => {
                  setStep('scan');
                  setSelectedVehicle(null);
                  setOdometerReading('');
                  setExpectedOdometer(null);
                  setIsFirstDraw(false);
                  setOdometerMismatch(false);
                }}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Select Different Vehicle
              </button>
            </div>
          </div>
        )}

        {step === 'confirm-license-warning' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-4">License Warning</h2>

            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-amber-900 text-center mb-4">
                Your license does not authorize you to drive this vehicle.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Your License:</span>
                  <span className="text-lg font-bold text-amber-900">{driverLicenseCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Required License:</span>
                  <span className="text-lg font-bold text-amber-900">{selectedVehicle?.license_code_required || 'Code B'}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-sm text-amber-900 font-medium">Vehicle Details:</p>
                <p className="text-base font-bold text-amber-900">{selectedVehicle?.registration_number}</p>
                <p className="text-sm text-amber-700">{selectedVehicle?.make} {selectedVehicle?.model}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-red-900 mb-2">Warning:</p>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>Driving a vehicle without the proper license is illegal</li>
                <li>You may be personally liable for any accidents or damage</li>
                <li>Your organization's insurance may not cover incidents</li>
                <li>This exception will be logged and reported to management</li>
              </ul>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              If you choose to proceed, an exception report will be logged for investigation by your organization.
              It is strongly recommended that you select a different vehicle or contact your supervisor.
            </p>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await loadExpectedOdometer(selectedVehicle!.id);
                  setStep('enter-odometer');
                }}
                className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                I Understand, Continue Anyway
              </button>

              <button
                onClick={() => {
                  setStep('scan');
                  setSelectedVehicle(null);
                  setOdometerReading('');
                  setExpectedOdometer(null);
                  setIsFirstDraw(false);
                  setLicenseWarning(false);
                }}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Select Different Vehicle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

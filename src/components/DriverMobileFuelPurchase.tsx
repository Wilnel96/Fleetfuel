import { useState, useEffect } from 'react';
import { Fuel, Camera, MapPin, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { supabase } from '../lib/supabase';
import { DriverData } from './DriverAuth';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  license_disk_expiry: string;
  vin_number?: string;
  fuel_type?: string;
  tank_capacity?: number;
  organization_id: string;
}

interface Garage {
  id: string;
  name: string;
  address: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  commission_rate: number;
  fuel_prices?: Record<string, number>;
  latitude?: number;
  longitude?: number;
}

interface ScanData {
  image: string;
  extractedText: string;
}

interface DriverMobileFuelPurchaseProps {
  driver: DriverData;
  onLogout: () => void | Promise<void>;
  onComplete?: () => void;
}

export default function DriverMobileFuelPurchase({ driver, onLogout, onComplete }: DriverMobileFuelPurchaseProps) {
  // ==========================================
  // TESTING MODE CONFIGURATION
  // ==========================================
  // Set to true to bypass license disk scanning for testing purposes
  // Set to false to require license disk scanning (production mode)
  const SKIP_LICENSE_SCAN_FOR_TESTING = true;
  // ==========================================

  const [drawnVehicle, setDrawnVehicle] = useState<Vehicle | null>(null);
  const [licenseDiskScan, setLicenseDiskScan] = useState<ScanData | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [extractedVin, setExtractedVin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fuelEfficiency, setFuelEfficiency] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMismatch, setLocationMismatch] = useState(false);
  const [distanceFromGarage, setDistanceFromGarage] = useState<number | null>(null);

  const [currentStep, setCurrentStep] = useState<'garage_selection' | 'location_confirmation' | 'license_scan' | 'spending_check' | 'authorized' | 'fuel_details'>('garage_selection');
  const [selectedGarageId, setSelectedGarageId] = useState('');
  const [spendingLimitError, setSpendingLimitError] = useState<{
    type: 'daily' | 'monthly';
    limit: number;
    currentSpending: number;
    estimatedCost: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    liters: '',
    pricePerLiter: '',
    totalAmount: '',
    odometerReading: '',
  });

  const [garages, setGarages] = useState<Garage[]>([]);

  useEffect(() => {
    loadDrawnVehicle();
    loadGarages();
    getCurrentLocation();
  }, []);

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

  const loadDrawnVehicle = async () => {
    setLoadingVehicle(true);
    try {
      console.log('Loading drawn vehicle for driver:', driver.id);

      // Get the most recent draw for this driver
      const { data: activeDraws, error: drawError } = await supabase
        .from('vehicle_transactions')
        .select('vehicle_id, id, created_at')
        .eq('driver_id', driver.id)
        .eq('transaction_type', 'draw')
        .order('created_at', { ascending: false });

      if (drawError) {
        console.error('Error loading active draws:', drawError);
        setError('Failed to load drawn vehicle');
        return;
      }

      if (!activeDraws || activeDraws.length === 0) {
        console.log('No vehicles currently drawn by this driver');
        setError('You must draw a vehicle before you can refuel. Please contact your administrator.');
        return;
      }

      // Find the first draw that doesn't have a return transaction
      let activeDrawId = null;
      let vehicleId = null;

      for (const draw of activeDraws) {
        const { data: returnTx } = await supabase
          .from('vehicle_transactions')
          .select('id')
          .eq('related_transaction_id', draw.id)
          .eq('transaction_type', 'return')
          .maybeSingle();

        if (!returnTx) {
          activeDrawId = draw.id;
          vehicleId = draw.vehicle_id;
          break;
        }
      }

      if (!vehicleId) {
        console.log('All drawn vehicles have been returned');
        setError('No vehicle currently drawn. Please draw a vehicle first.');
        return;
      }

      // Load the drawn vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('status', 'active')
        .maybeSingle();

      if (vehicleError || !vehicle) {
        console.error('Error loading vehicle:', vehicleError);
        setError('Failed to load vehicle information');
        return;
      }

      console.log('Loaded drawn vehicle:', vehicle);
      setDrawnVehicle(vehicle);
      setError('');
    } catch (err: any) {
      console.error('Error in loadDrawnVehicle:', err);
      setError(err.message || 'Failed to load vehicle');
    } finally {
      setLoadingVehicle(false);
    }
  };

  const loadGarages = async () => {
    const { data } = await supabase
      .from('garages')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (data) setGarages(data);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkLocationProximity = (garage: Garage): { isNear: boolean; distance: number | null } => {
    if (!location || !garage.latitude || !garage.longitude) {
      return { isNear: true, distance: null };
    }

    const distance = calculateDistance(
      location.lat,
      location.lng,
      garage.latitude,
      garage.longitude
    );

    const MAX_DISTANCE_KM = 0.5;
    return {
      isNear: distance <= MAX_DISTANCE_KM,
      distance,
    };
  };

  const checkSpendingLimits = async () => {
    if (!drawnVehicle || !selectedGarageId) {
      setError('Missing vehicle or garage information.');
      setCurrentStep('garage_selection');
      return;
    }

    try {
      const selectedGarage = garages.find(g => g.id === selectedGarageId);
      if (!selectedGarage) {
        setError('Garage not found.');
        setCurrentStep('garage_selection');
        return;
      }

      // Get organization spending limits
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('daily_spending_limit, monthly_spending_limit')
        .eq('id', drawnVehicle.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        setError('Failed to check spending limits.');
        setCurrentStep('garage_selection');
        return;
      }

      // Calculate estimated fuel cost (tank capacity * price per liter)
      const fuelPrice = selectedGarage.fuel_prices?.[drawnVehicle.fuel_type || ''] || 0;
      const tankCapacity = parseFloat(drawnVehicle.tank_capacity?.toString() || '0');
      const estimatedCost = tankCapacity * fuelPrice;

      console.log('Spending check:', {
        tankCapacity,
        fuelPrice,
        estimatedCost,
        dailyLimit: organization.daily_spending_limit,
        monthlyLimit: organization.monthly_spending_limit
      });

      // Check daily limit if set
      if (organization.daily_spending_limit) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: dailyTransactions, error: dailyError } = await supabase
          .from('fuel_transactions')
          .select('total_amount')
          .eq('organization_id', drawnVehicle.organization_id)
          .gte('created_at', today.toISOString());

        if (dailyError) {
          console.error('Error fetching daily transactions:', dailyError);
        } else {
          const dailySpending = dailyTransactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || '0'), 0) || 0;

          if (dailySpending + estimatedCost > organization.daily_spending_limit) {
            setSpendingLimitError({
              type: 'daily',
              limit: organization.daily_spending_limit,
              currentSpending: dailySpending,
              estimatedCost
            });
            return;
          }
        }
      }

      // Check monthly limit if set
      if (organization.monthly_spending_limit) {
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyTransactions, error: monthlyError } = await supabase
          .from('fuel_transactions')
          .select('total_amount')
          .eq('organization_id', drawnVehicle.organization_id)
          .gte('created_at', firstDayOfMonth.toISOString());

        if (monthlyError) {
          console.error('Error fetching monthly transactions:', monthlyError);
        } else {
          const monthlySpending = monthlyTransactions?.reduce((sum, t) => sum + parseFloat(t.total_amount || '0'), 0) || 0;

          if (monthlySpending + estimatedCost > organization.monthly_spending_limit) {
            setSpendingLimitError({
              type: 'monthly',
              limit: organization.monthly_spending_limit,
              currentSpending: monthlySpending,
              estimatedCost
            });
            return;
          }
        }
      }

      // All checks passed
      setSpendingLimitError(null);
      setCurrentStep('authorized');
    } catch (err) {
      console.error('Error checking spending limits:', err);
      setError('Failed to verify spending limits.');
      setCurrentStep('garage_selection');
    }
  };

  const handleBarcodeScan = async (barcodeData: string) => {
    console.log('=== BARCODE SCAN STARTED ===');
    console.log('Barcode data received:', barcodeData);
    console.log('Drawn vehicle:', drawnVehicle);

    setLicenseDiskScan({ image: '', extractedText: barcodeData });
    setShowBarcodeScanner(false);

    if (!drawnVehicle) {
      setError('No vehicle drawn. Cannot verify license disk.');
      return;
    }

    const verified = await verifyLicenseDisk(barcodeData, drawnVehicle);
    console.log('License disk verification result:', verified);

    if (!verified) {
      setError('License disk verification failed. The scanned license disk does not match your drawn vehicle.');
      setLicenseDiskScan(null);
      return;
    }

    setCurrentStep('spending_check');
    await checkSpendingLimits();
  };


  const verifyLicenseDisk = async (barcodeData: string, vehicle: Vehicle): Promise<boolean> => {
    console.log('Raw barcode data:', barcodeData);
    console.log('Verifying against vehicle:', { reg: vehicle.registration_number, vin: vehicle.vin_number });

    const barcodeFields = barcodeData.split('%');
    console.log('Barcode fields:', barcodeFields);

    let extractedVinFromBarcode = '';

    // Extract VIN from barcode
    for (let i = 0; i < barcodeFields.length; i++) {
      const field = barcodeFields[i].trim();
      if (field.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(field)) {
        extractedVinFromBarcode = field.toUpperCase();
        console.log('Extracted VIN from barcode:', extractedVinFromBarcode);
        break;
      }
    }

    const vehicleReg = vehicle.registration_number.toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
    const vehicleVin = vehicle.vin_number?.trim().toUpperCase() || '';

    console.log(`Checking vehicle: ${vehicle.registration_number} (cleaned: ${vehicleReg}, VIN: ${vehicleVin})`);

    // Check if any barcode field matches the registration number
    let registrationMatch = false;
    for (const field of barcodeFields) {
      const cleanField = field.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
      console.log(`  Comparing field "${cleanField}" with "${vehicleReg}"`);

      if (cleanField && cleanField === vehicleReg) {
        console.log(`✓ Match found! Field "${field}" matches vehicle ${vehicle.registration_number}`);
        registrationMatch = true;
        break;
      }
    }

    if (!registrationMatch) {
      console.log('❌ Registration number not found in barcode');
      setError(`License disk does not match vehicle ${vehicle.registration_number}`);
      return false;
    }

    // Check license disk expiry
    const expiryDate = new Date(vehicle.license_disk_expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      setError('Vehicle license disk has expired');
      return false;
    }

    // Verify VIN if both are available
    if (vehicleVin && extractedVinFromBarcode && vehicleVin !== extractedVinFromBarcode) {
      console.log(`VIN mismatch: vehicle VIN "${vehicleVin}" vs barcode VIN "${extractedVinFromBarcode}"`);
      setError(`VIN verification failed. Barcode VIN (${extractedVinFromBarcode}) does not match vehicle VIN (${vehicleVin}).`);
      return false;
    }

    // Store extracted VIN
    if (extractedVinFromBarcode) {
      setExtractedVin(extractedVinFromBarcode);
    }

    console.log(`✓ License disk verification passed for ${vehicle.registration_number}`);
    return true;
  };


  const handleGarageSelection = () => {
    setError('');

    if (!selectedGarageId) {
      setError('Please select a garage.');
      return;
    }

    if (!drawnVehicle) {
      setError('No vehicle drawn.');
      return;
    }

    const selectedGarage = garages.find(g => g.id === selectedGarageId);
    if (!selectedGarage) {
      setError('Garage not found.');
      return;
    }

    const proximityCheck = checkLocationProximity(selectedGarage);
    setDistanceFromGarage(proximityCheck.distance);
    setLocationMismatch(!proximityCheck.isNear);
    setCurrentStep('location_confirmation');
  };

  const proceedToScan = () => {
    setCurrentStep('license_scan');
    setShowBarcodeScanner(true);
  };

  const skipLicenseScanForTesting = async () => {
    console.log('⚠️ BYPASSING LICENSE SCAN FOR TESTING');
    setLicenseDiskScan({ image: '', extractedText: 'TESTING_MODE_BYPASS' });
    setCurrentStep('spending_check');
    await checkSpendingLimits();
  };

  const handleFuelDetailsSubmit = () => {
    if (!formData.liters || !formData.pricePerLiter || !formData.odometerReading) {
      setError('Please fill in all fuel details.');
      return;
    }
    setCurrentStep('fuel_details');
    completeFuelTransaction();
  };

  const completeFuelTransaction = async () => {
    setError('');
    setLoading(true);

    const selectedGarage = garages.find(g => g.id === selectedGarageId);
    if (!selectedGarage) {
      setError('Please select a garage.');
      setLoading(false);
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const commissionRate = selectedGarage.commission_rate;
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const netAmount = totalAmount - commissionAmount;

    try {
      // Get the previous odometer reading for this vehicle
      const { data: lastTransaction } = await supabase
        .from('fuel_transactions')
        .select('odometer_reading')
        .eq('vehicle_id', drawnVehicle.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get driver token from local storage
      const driverToken = localStorage.getItem('driverToken');
      if (!driverToken) {
        throw new Error('Driver session expired. Please login again.');
      }

      // Call edge function to create transaction
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-fuel-transaction`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-Driver-Token': driverToken,
        },
        body: JSON.stringify({
          vehicleId: drawnVehicle.id,
          garageId: formData.garageId,
          liters: parseFloat(formData.liters),
          pricePerLiter: parseFloat(formData.pricePerLiter),
          totalAmount,
          commissionRate,
          commissionAmount,
          netAmount,
          previousOdometerReading: lastTransaction?.odometer_reading || null,
          odometerReading: parseInt(formData.odometerReading),
          location: location ? `${location.lat},${location.lng}` : 'Unknown',
          fuelType: drawnVehicle.fuel_type || 'Diesel-50',
          licenseDiskImage: licenseDiskScan?.image,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create transaction');
      }

      if (locationMismatch && distanceFromGarage !== null) {
        const { error: exceptionError } = await supabase
          .from('vehicle_exceptions')
          .insert({
            vehicle_id: drawnVehicle.id,
            driver_id: driver.id,
            organization_id: driver.organizationId,
            exception_type: 'location_mismatch',
            description: `Location mismatch detected during fuel purchase. Driver location was ${distanceFromGarage.toFixed(2)} km away from garage ${selectedGarage.name}.`,
            expected_value: selectedGarage.latitude && selectedGarage.longitude
              ? `${selectedGarage.latitude},${selectedGarage.longitude}`
              : 'Unknown',
            actual_value: `${location?.lat},${location?.lng}`,
            resolved: false,
          });

        if (exceptionError) {
          console.error('Failed to log location exception:', exceptionError);
        }
      }

      const efficiency = await calculateFuelEfficiency(
        drawnVehicle.id,
        parseInt(formData.odometerReading),
        parseFloat(formData.liters)
      );
      setFuelEfficiency(efficiency);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const calculateFuelEfficiency = async (
    vehicleId: string,
    currentOdometer: number,
    litersPurchased: number
  ): Promise<number | null> => {
    try {
      const { data: previousTransaction } = await supabase
        .from('fuel_transactions')
        .select('odometer_reading')
        .eq('vehicle_id', vehicleId)
        .order('authorized_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (previousTransaction && previousTransaction.odometer_reading) {
        const kmTravelled = currentOdometer - previousTransaction.odometer_reading;
        if (kmTravelled > 0 && litersPurchased > 0) {
          return kmTravelled / litersPurchased;
        }
      }
    } catch (err) {
      console.error('Error calculating fuel efficiency:', err);
    }
    return null;
  };

  const resetForm = () => {
    setLicenseDiskScan(null);
    setExtractedVin('');
    setFormData({
      liters: '',
      pricePerLiter: '',
      totalAmount: '',
      odometerReading: '',
    });
    setSelectedGarageId('');
    setSuccess(false);
    setFuelEfficiency(null);
    setError('');
    setLocationMismatch(false);
    setDistanceFromGarage(null);
    setCurrentStep('garage_selection');
    setShowBarcodeScanner(false);
    loadDrawnVehicle();
  };

  useEffect(() => {
    if (formData.liters && formData.pricePerLiter) {
      const total = (parseFloat(formData.liters) * parseFloat(formData.pricePerLiter)).toFixed(2);
      setFormData(prev => ({ ...prev, totalAmount: total }));
    }
  }, [formData.liters, formData.pricePerLiter]);

  useEffect(() => {
    if (selectedGarageId && drawnVehicle?.fuel_type && currentStep === 'authorized') {
      const selectedGarage = garages.find(g => g.id === selectedGarageId);
      if (selectedGarage?.fuel_prices) {
        const price = selectedGarage.fuel_prices[drawnVehicle.fuel_type];
        if (price) {
          setFormData(prev => ({ ...prev, pricePerLiter: price.toFixed(2) }));
        }
      }
    }
  }, [selectedGarageId, drawnVehicle, garages, currentStep]);

  if (currentStep === 'location_confirmation') {
    const selectedGarage = garages.find(g => g.id === selectedGarageId);
    return (
      <div className={`min-h-screen ${locationMismatch ? 'bg-amber-50' : 'bg-green-50'} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          {locationMismatch ? (
            <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          ) : (
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Location Verification</h2>

          {locationMismatch ? (
            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-amber-900 mb-3 text-center">
                Your location does not match the selected garage location
              </p>

              {distanceFromGarage !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">Distance from garage:</span>
                    <span className="font-bold text-amber-900">
                      {distanceFromGarage < 1
                        ? `${(distanceFromGarage * 1000).toFixed(0)} meters`
                        : `${distanceFromGarage.toFixed(2)} km`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">Maximum allowed:</span>
                    <span className="font-bold text-amber-900">500 meters</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-green-900 mb-2 text-center">
                Location Confirmed
              </p>
              {distanceFromGarage !== null && (
                <p className="text-xs text-green-700 text-center">
                  You are {distanceFromGarage < 1
                    ? `${(distanceFromGarage * 1000).toFixed(0)} meters`
                    : `${distanceFromGarage.toFixed(2)} km`} from the garage
                </p>
              )}
            </div>
          )}

          {selectedGarage && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Selected Garage:</p>
              <p className="text-base font-bold text-blue-900">{selectedGarage.name}</p>
              <p className="text-sm text-blue-700">{selectedGarage.address}, {selectedGarage.city}</p>
            </div>
          )}

          {locationMismatch && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-xs font-medium text-red-900 mb-2">Important:</p>
              <p className="text-xs text-red-800 mb-2">
                Refueling should only be done at the selected garage location. If you proceed, an exception report will be logged for investigation.
              </p>
              <p className="text-xs text-red-700">
                Please ensure you are at the correct garage before proceeding.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {SKIP_LICENSE_SCAN_FOR_TESTING ? (
              <>
                <button
                  onClick={skipLicenseScanForTesting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue (Testing Mode - No License Scan)
                </button>
                <button
                  onClick={proceedToScan}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors text-sm"
                >
                  Scan License Disk (Optional)
                </button>
              </>
            ) : (
              <button
                onClick={proceedToScan}
                className={`w-full ${locationMismatch ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-lg font-semibold transition-colors`}
              >
                Continue to Refuel
              </button>
            )}

            <button
              onClick={() => {
                setCurrentStep('garage_selection');
                setLocationMismatch(false);
                setDistanceFromGarage(null);
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'license_scan' && showBarcodeScanner) {
    return (
      <BarcodeScanner
        label="Scan License Disk to Verify Vehicle"
        onScan={handleBarcodeScan}
        onCancel={() => {
          setShowBarcodeScanner(false);
          setCurrentStep('location_confirmation');
        }}
      />
    );
  }

  if (currentStep === 'spending_check') {
    if (spendingLimitError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Spending Limit Exceeded</h2>

            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-red-900 mb-3 text-center">
                {spendingLimitError.type === 'daily'
                  ? 'Daily spending limit has been reached'
                  : 'Monthly spending limit has been reached'}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">Current spending:</span>
                  <span className="font-bold text-red-900">R {spendingLimitError.currentSpending.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">Estimated fuel cost:</span>
                  <span className="font-bold text-red-900">R {spendingLimitError.estimatedCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-red-200 my-2"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">Total would be:</span>
                  <span className="font-bold text-red-900">
                    R {(spendingLimitError.currentSpending + spendingLimitError.estimatedCost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-700">{spendingLimitError.type === 'daily' ? 'Daily' : 'Monthly'} limit:</span>
                  <span className="font-bold text-red-900">R {spendingLimitError.limit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-amber-800">
                This transaction would exceed your organization's {spendingLimitError.type} spending limit.
                Please contact your fleet manager to request a limit increase or wait until the limit resets.
              </p>
            </div>

            <button
              onClick={() => {
                setSpendingLimitError(null);
                setCurrentStep('garage_selection');
                setShowBarcodeScanner(false);
                setLicenseDiskScan(null);
                if (onComplete) onComplete();
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Driver's Main Menu
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Checking Spending Limits</h2>
          <p className="text-gray-600 text-sm">Verifying your organization's daily and monthly spending limits...</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'authorized') {
    const selectedGarage = garages.find(g => g.id === selectedGarageId);
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Authorized to Refuel</h2>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-green-900 mb-2 text-center">
              License disk verified successfully
            </p>
            <p className="text-xs text-green-700 text-center">
              You are authorized to refuel at the selected garage
            </p>
          </div>

          {selectedGarage && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Garage:</p>
              <p className="text-base font-bold text-blue-900">{selectedGarage.name}</p>
              <p className="text-sm text-blue-700">{selectedGarage.address}, {selectedGarage.city}</p>
            </div>
          )}

          {drawnVehicle && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Vehicle:</p>
              <p className="text-base font-bold text-blue-900">{drawnVehicle.registration_number}</p>
              <p className="text-sm text-blue-700">{drawnVehicle.make} {drawnVehicle.model}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-amber-900 mb-2">Next Steps:</p>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Proceed to refuel your vehicle</li>
              <li>Note the fuel amount and odometer reading</li>
              <li>Return here to enter the details</li>
            </ol>
          </div>

          <button
            onClick={() => setCurrentStep('fuel_details')}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            I've Refueled - Enter Details
          </button>

          <button
            onClick={() => {
              setCurrentStep('garage_selection');
              setShowBarcodeScanner(false);
              setLicenseDiskScan(null);
            }}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Authorized!</h2>
          <p className="text-gray-600 mb-6">Fuel purchase authorized. Payment will be processed via daily EFT run.</p>

          {fuelEfficiency !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-1">Fuel Efficiency</p>
              <p className="text-3xl font-bold text-blue-600">{fuelEfficiency.toFixed(2)}</p>
              <p className="text-sm text-blue-700">km per liter</p>
              <p className="text-xs text-blue-600 mt-2">Since last refueling</p>
            </div>
          )}

          <button
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                resetForm();
              }
            }}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Fuel Purchase</h1>
              <p className="text-sm text-blue-100">Driver: {driver.firstName} {driver.lastName}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {SKIP_LICENSE_SCAN_FOR_TESTING && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-semibold">
          ⚠️ TESTING MODE: License disk scanning is disabled
        </div>
      )}

      <div className="p-4 max-w-2xl mx-auto">
        {loadingVehicle ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vehicle information...</p>
          </div>
        ) : !drawnVehicle ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 font-medium mb-1">No Vehicle Drawn</p>
                <p className="text-amber-800 text-sm">{error || 'You must draw a vehicle before you can refuel. Please contact your administrator.'}</p>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Driver's Main Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentStep === 'garage_selection' ? 'Select Garage' : 'Enter Fuel Details'}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">Your Drawn Vehicle:</p>
              <p className="text-xl font-bold text-blue-900">{drawnVehicle.registration_number}</p>
              <p className="text-sm text-blue-700">{drawnVehicle.make} {drawnVehicle.model}</p>
              <p className="text-xs text-blue-600 mt-2">License Expires: {new Date(drawnVehicle.license_disk_expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              {drawnVehicle.vin_number && (
                <p className="text-xs text-blue-600">VIN: {drawnVehicle.vin_number}</p>
              )}
            </div>

            {location && (
              <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Location Captured</p>
                  <p className="text-xs text-green-700">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                </div>
              </div>
            )}

            {currentStep === 'garage_selection' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Garage</label>
                  <select
                    value={selectedGarageId}
                    onChange={(e) => setSelectedGarageId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  >
                    <option value="">Choose a garage to refuel at</option>
                    {garages.map((garage) => (
                      <option key={garage.id} value={garage.id}>
                        {garage.name} - {garage.address}, {garage.city} - Tel: {garage.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGarageSelection}
                  disabled={loading || !selectedGarageId}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Continue to Location Verification
                    </>
                  )}
                </button>
              </div>
            )}

            {currentStep === 'fuel_details' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Liters</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.liters}
                      onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="50.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Liter (R)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerLiter}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                      placeholder="Select garage to see price"
                    />
                    {drawnVehicle?.fuel_type && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fuel Type: {drawnVehicle.fuel_type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (R)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalAmount}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading (km)</label>
                    <input
                      type="number"
                      value={formData.odometerReading}
                      onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="125000"
                      required
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800">
                    You are authorized to refuel. Enter the fuel details from your transaction.
                  </p>
                </div>

                <button
                  onClick={handleFuelDetailsSubmit}
                  disabled={loading || !formData.liters || !formData.pricePerLiter || !formData.odometerReading}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Fuel className="w-5 h-5" />
                      Complete Fuel Purchase
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

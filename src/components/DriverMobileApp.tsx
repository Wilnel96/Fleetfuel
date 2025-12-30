import { useState } from 'react';
import { Fuel, Car, LogOut, MapPin, ArrowLeft } from 'lucide-react';
import { DriverData } from './DriverAuth';
import DriverMobileFuelPurchase from './DriverMobileFuelPurchase';
import DrawVehicle from './DrawVehicle';
import ReturnVehicle from './ReturnVehicle';
import MobileGarageDirectory from './MobileGarageDirectory';

interface DriverMobileAppProps {
  driver: DriverData;
  onLogout: () => void | Promise<void>;
}

type MenuOption = 'menu' | 'draw' | 'return' | 'refuel' | 'directory';

export default function DriverMobileApp({ driver, onLogout }: DriverMobileAppProps) {
  const [currentView, setCurrentView] = useState<MenuOption>('menu');

  if (currentView === 'draw') {
    return (
      <DrawVehicle
        organizationId={driver.organizationId}
        driverId={driver.id}
        onBack={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'return') {
    return (
      <ReturnVehicle
        organizationId={driver.organizationId}
        driverId={driver.id}
        onBack={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'refuel') {
    return (
      <div>
        <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('menu')}
              className="hover:bg-blue-700 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Refueling</h1>
              <p className="text-sm text-blue-100">Driver: {driver.firstName} {driver.lastName}</p>
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
        <div className="pt-16">
          <DriverMobileFuelPurchase
            driver={driver}
            onLogout={onLogout}
            onComplete={() => setCurrentView('menu')}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'directory') {
    return (
      <MobileGarageDirectory
        onBack={() => setCurrentView('menu')}
        organizationId={driver.organizationId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Driver Portal</h1>
              <p className="text-sm text-blue-100">{driver.firstName} {driver.lastName}</p>
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

      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Select an option to get started</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setCurrentView('draw')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Draw Vehicle</h3>
                <p className="text-sm text-gray-600">Check out a vehicle and record the starting odometer reading</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('return')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Return Vehicle</h3>
                <p className="text-sm text-gray-600">Check in a vehicle and record the closing odometer reading</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('refuel')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Fuel className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Refueling</h3>
                <p className="text-sm text-gray-600">Record a fuel purchase transaction</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('directory')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Garage Directory</h3>
                <p className="text-sm text-gray-600">Find participating garages near you</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

import { CreditCard, Building2, ArrowLeft } from 'lucide-react';

interface ClientPortalSelectionProps {
  onSelectPortal: (portalType: 'card' | 'account') => void;
  onBack: () => void;
}

export default function ClientPortalSelection({ onSelectPortal, onBack }: ClientPortalSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-blue-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">MyFuel</h1>
          <p className="text-blue-100">Select Your Fuel Management System</p>
        </div>

        <div className="p-8">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login Selection
          </button>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => onSelectPortal('card')}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-xl p-6 text-left transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-blue-600 rounded-full group-hover:scale-110 transition-transform">
                  <CreditCard className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">MyFuel Card</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Pay for fuel with credit or debit cards. Perfect for individuals and fleets wanting better control over fuel spending.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-300 w-full">
                  <p className="text-xs text-gray-600 font-medium">Features:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Card-based payments</li>
                    <li>• Real-time transaction tracking</li>
                    <li>• Spending controls</li>
                  </ul>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectPortal('account')}
              className="group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-300 rounded-xl p-6 text-left transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-amber-600 rounded-full group-hover:scale-110 transition-transform">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">MyFuel Accounts</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Open local accounts at specific garages. Enhanced security for fleet operators and garage local account holders.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-300 w-full">
                  <p className="text-xs text-gray-600 font-medium">Features:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Local garage accounts</li>
                    <li>• Account spending limits</li>
                    <li>• Monthly statements</li>
                  </ul>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Both systems share the same garage network and provide comprehensive fuel management for your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

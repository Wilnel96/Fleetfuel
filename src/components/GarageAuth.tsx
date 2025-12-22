import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store, AlertCircle, ArrowLeft } from 'lucide-react';

interface GarageAuthProps {
  onLogin: (garageId: string, garageName: string) => void;
  onBack?: () => void;
}

export default function GarageAuth({ onLogin, onBack }: GarageAuthProps) {
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: garages, error: garageError } = await supabase
        .from('garages')
        .select('id, name, contact_persons, status');

      if (garageError) throw garageError;

      if (!garages || garages.length === 0) {
        setError('Invalid email or password');
        return;
      }

      let matchedGarage = null;

      for (const garage of garages) {
        if (garage.status !== 'active') continue;

        const contactPersons = garage.contact_persons as Array<{
          email: string;
          password: string;
          name: string;
        }>;

        if (!contactPersons || contactPersons.length === 0) continue;

        const matchedContact = contactPersons.find(
          (contact) =>
            contact.email?.toLowerCase() === contactEmail.trim().toLowerCase() &&
            contact.password === password
        );

        if (matchedContact) {
          matchedGarage = garage;
          break;
        }
      }

      if (!matchedGarage) {
        setError('Invalid email or password');
        return;
      }

      onLogin(matchedGarage.id, matchedGarage.name);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login Selection
          </button>
        )}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4">
            <Store className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Garage Portal</h1>
          <p className="text-gray-600 mt-2 text-center">
            Sign in to manage your fuel prices
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}

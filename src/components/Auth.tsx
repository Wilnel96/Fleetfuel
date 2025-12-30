import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Fuel, AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onBack?: () => void;
}

export default function Auth({ onBack }: AuthProps = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[Auth] Attempting login with email:', email);
      console.log('[Auth] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }

      console.log('[Auth] Login successful:', data.user?.email);
      console.log('[Auth] Session:', data.session ? 'Created' : 'No session');
      console.log('[Auth] User ID:', data.user?.id);
      console.log('[Auth] Access token:', data.session?.access_token ? 'Present' : 'Missing');

      // Set a safety timeout - if auth state doesn't update in 5 seconds, stop loading
      const safetyTimeout = setTimeout(() => {
        console.warn('[Auth] Safety timeout - auth state change may not have fired');
        setLoading(false);
        setError('Login successful but page did not refresh. Please try refreshing the page.');
      }, 5000);

      // Check if session is established every 500ms
      const checkInterval = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[Auth] Session confirmed, should redirect soon');
          clearTimeout(safetyTimeout);
          clearInterval(checkInterval);
        }
      }, 500);

      // Clean up interval after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000);

    } catch (err: any) {
      console.error('[Auth] Auth error:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Fuel className="w-10 h-10" />
            <h1 className="text-2xl font-bold">FleetFuel</h1>
          </div>
          <p className="text-blue-100 text-sm">Mobile Fuel Management</p>
        </div>

        <form onSubmit={handleAuth} className="p-6 space-y-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login Selection
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Need access?</p>
            <p className="text-xs text-gray-500 mt-1">Contact your management company to set up an account</p>
          </div>
        </form>
      </div>
    </div>
  );
}

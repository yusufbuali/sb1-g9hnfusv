import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await login(email, password);

    if (error) {
      setError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    // Successful login will trigger the useEffect above
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-secondary-900">
              Case Management System
            </h1>
            <p className="text-secondary-600 mt-2">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </>
              )}
            </button>

            <div className="mt-4 text-center text-sm text-secondary-600">
              <p>Demo Accounts:</p>
              <div className="mt-2 space-y-1">
                <p>Registration: john.smith@registration.com</p>
                <p>Forensics Head: michael.chen@forensics.com</p>
                <p>Forensics: emily.brown@forensics.com</p>
                <p>Admin: admin@system.com</p>
                <p className="text-xs text-secondary-500 mt-2">
                  Password for all accounts: demo123456
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
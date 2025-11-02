import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      if (result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-4xl font-bold text-primary-600 mb-2">
            DIET Track
          </h2>
          <h3 className="text-center text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h3>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
            <span className="mx-3 text-gray-400">•</span>
            <Link to="/admin-login" className="text-sm text-primary-600 hover:text-primary-700">
              Admin Login
            </Link>
          </div>
        </form>
        <div className="mt-4">
          {(() => {
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const authBase = apiBase.replace(/\/?api\/?$/, '');
            return (
              <a
                href={`${authBase}/api/auth/google`}
                className="w-full inline-flex items-center justify-center btn-outline py-3 text-lg"
                aria-label="Sign in with Google"
              >
                <span className="mr-3 flex items-center justify-center h-5 w-5 rounded-full bg-white text-sm font-semibold text-gray-700">
                  G
                </span>
                <span>Sign in with Google</span>
              </a>
            );
          })()}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-700">
            <strong>Admin:</strong> admin@diettrack.com / admin123
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Admin accounts sign in through the same form and are redirected straight to the Admin Panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

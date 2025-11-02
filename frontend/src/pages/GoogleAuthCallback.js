import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse token from query string
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token and redirect to app; AuthProvider will fetch user
      localStorage.setItem('token', token);
      // Optionally store user after fetching /auth/me; AuthProvider will do it on mount
      navigate('/dashboard');
    } else {
      // No token - go to login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-sm text-gray-700">Signing you in…</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;

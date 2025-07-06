import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      const message = isDemoMode ? 'Welcome to the demo!' : 'Welcome back!';
      toast.success(message);
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setIsLoading(true);
    try {
      await login({ email: 'demo@example.com', password: 'demo123' });
      toast.success('Welcome to the demo!');
      navigate('/chat');
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login failed - please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            💬
          </div>
          <h1 className="auth-title">Welcome to WhatsApp</h1>
          <p className="auth-subtitle">
            {isDemoMode ? 'Demo Mode - No registration required' : 'Sign in to your account'}
          </p>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="demo-notice" style={{ marginBottom: '24px' }}>
            🎮 Try the demo with one click!
            <div className="demo-credentials">
              Email: demo@example.com<br />
              Password: demo123
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-auth"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo Login Button */}
          {isDemoMode && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="btn-auth"
              style={{ 
                background: 'var(--whatsapp-blue)', 
                marginBottom: '16px',
                order: -1 
              }}
            >
              {isLoading ? 'Loading Demo...' : '🎮 Try Demo Now'}
            </button>
          )}
        </form>

        {/* Links */}
        <div className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

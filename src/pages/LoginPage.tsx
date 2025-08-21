import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Shield, Home, School, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async (username: string) => {
    setLoading(true);
    const success = await login(username, 'password123');
    if (success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-red-50">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 p-12 text-white">
          <div className="flex flex-col justify-center space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-red-400 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">LunchBox Express</h1>
                <p className="text-orange-100">Digital Dabbawala Service for School Children</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Safe & Reliable Delivery</h3>
                  <p className="text-orange-100">Trusted delivery partners ensure your child's meal reaches safely</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">School Partnership</h3>
                  <p className="text-orange-100">Direct partnership with schools for seamless coordination</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Tracking</h3>
                  <p className="text-orange-100">Track your order from kitchen to school with live updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">LunchBox Express</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              {/* Demo Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleDemoLogin('rajesh_sharma')}
                  disabled={loading}
                  className="flex flex-col items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                    <Home className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium">Parent</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('speedrider')}
                  disabled={loading}
                  className="flex flex-col items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium">Delivery</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('dps_koramangala')}
                  disabled={loading}
                  className="flex flex-col items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                    <School className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium">School</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('admin_user')}
                  disabled={loading}
                  className="flex flex-col items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mb-1">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-xs font-medium">Admin</span>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
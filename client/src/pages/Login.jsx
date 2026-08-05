import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Store, User, Lock, MapPin, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { userId, password });
      login(res.data.user);
      navigate('/');
      addToast('Welcome back!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Left Side - Brand / Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          {/* Abstract pattern or decoration can go here */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="z-10 text-center">
          <div className="bg-emerald-500 p-4 rounded-2xl mb-8 inline-block shadow-2xl shadow-emerald-900/50">
            <Store className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Grocery Store<br />Management System</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Efficiently manage your inventory, sales, and customers with our state-of-the-art platform.
          </p>
        </div>

        <div className="absolute bottom-12 left-12 text-slate-500 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>123 Market Street, Lahore, Pakistan</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Branch Code: LHR-001 | +92 300 1234567</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8 lg:hidden">
            <div className="bg-slate-900 p-3 rounded-full mb-3 inline-block">
              <Store className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Grocery System</h2>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-8">Access your dashboard using your User ID.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">User ID</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your User ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:scale-[1.02]">
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            &copy; 2026 Grocery Store Management System
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        timezone,
      });
      setAuth(res.data.user, res.data.access_token);
      toast.success('Account created! Welcome to HabitSheet.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#0F9D58] flex items-center justify-center text-white shadow-sm">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#202124]">HabitSheet</h1>
            <p className="text-[11px] text-[#5F6368]">Create your personal habit ledger</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg border border-[#DADCE0] shadow-md p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-[#202124]">Create new account</h2>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Your timezone sets the midnight rollover for your daily checkboxes.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#202124] mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full px-3 py-2 border border-[#DADCE0] rounded focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#202124] mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3 py-2 border border-[#DADCE0] rounded focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#202124] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 border border-[#DADCE0] rounded focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#202124] mb-1">Timezone</label>
            <input
              type="text"
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-[#DADCE0] rounded font-mono text-[11px] bg-[#F8F9FA] focus:outline-none focus:border-[#0F9D58]"
            />
            <p className="text-[10px] text-[#80868B] mt-1">Detected from your browser.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0B7A43] text-white font-medium rounded text-xs transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? 'Creating...' : 'Register Workbook'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#F1F3F4] text-xs text-[#5F6368]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0F9D58] hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

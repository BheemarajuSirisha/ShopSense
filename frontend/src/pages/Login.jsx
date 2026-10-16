import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('admin@shopsense.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      const user = await login(email, password, 'admin');
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch {
      toast.error('Authentication failed. Please check credentials.');
    }
  };

  const handleAdminQuickAccess = async () => {
    try {
      setEmail('admin@shopsense.com');
      setPassword('password123');
      const user = await login('admin@shopsense.com', 'password123', 'admin');
      toast.success(`Signed in as ${user.name} (Admin)`);
      navigate(from, { replace: true });
    } catch {
      toast.error('Admin login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDEFF6] via-[#FCE4F1] to-[#FBE4F0] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Soft Blush and Magenta Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#E14DB0]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#B5179E]/15 blur-3xl pointer-events-none" />

      {/* Login Card in White Plum Luxe */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-[#F6D3E6] rounded-3xl shadow-[0_16px_40px_rgba(181,23,158,0.12)] p-6 sm:p-8 text-[#6B4A62] relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-1.5">
            <Logo 
              showText={true} 
              variant="dark" 
              className="w-8 h-8"
              textClassName="text-2xl sm:text-3xl" 
              size={32}
              showSubtitle={false}
            />
          </div>
          <p className="text-xs font-semibold text-[#6B4A62] tracking-normal">
            Multi-Vendor E-Commerce Analytics Platform
          </p>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#B5179E] mt-2">
            Platform Operations Access
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A98AA0] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B5179E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopsense.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDEFF6]/50 border border-[#F6D3E6] rounded-xl text-sm text-[#3B0A33] placeholder-[#A98AA0] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A98AA0] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B5179E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FDEFF6]/50 border border-[#F6D3E6] rounded-xl text-sm text-[#3B0A33] placeholder-[#A98AA0] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#A98AA0] hover:text-[#3B0A33] absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white font-semibold text-sm shadow-md hover:shadow-[0_8px_20px_rgba(181,23,158,0.35)] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Admin Access */}
        <div className="mt-5 pt-5 border-t border-[#F6D3E6]">
          <button
            type="button"
            onClick={handleAdminQuickAccess}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#F6D3E6] bg-[#FDEFF6] hover:bg-[#FCE4F1] text-[#7A1259] hover:text-[#3B0A33] font-semibold text-xs transition-all flex items-center justify-center gap-2 group shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-[#B5179E]" />
            <span>1-Click Admin Access</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

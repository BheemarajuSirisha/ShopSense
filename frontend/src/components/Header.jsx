import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Calendar, 
  ChevronDown, 
  LogOut, 
  User, 
  ShieldCheck, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { DEMO_USERS } from '../context/demoUsers';

export default function Header({ onOpenSidebar }) {
  const { user, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  const handleSwitchAccount = async (roleKey) => {
    try {
      await login(null, null, roleKey);
      setDropdownOpen(false);
      toast.success(`Switched to ${roleKey === 'admin' ? 'Administrator' : 'Merchant Vendor'}`);
    } catch {
      toast.error('Failed to switch user');
    }
  };

  // Dynamic formatted date for the date chip (lazy initialized once)
  const [dateFormatted] = useState(() =>
    new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  );

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#F6D3E6] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile menu & Rounded Search Field */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-[#3B0A33] hover:bg-[#FCE4F1] border border-[#F6D3E6] transition-colors"
          aria-label="Open sidebar drawer"
        >
          <Menu className="w-5 h-5 text-[#B5179E]" />
        </button>

        {/* Rounded Search Field: ("Search products, vendors, orders...") */}
        <div className="relative w-full max-w-sm sm:max-w-md">
          <Search className="w-4 h-4 text-[#A98AA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, vendors, orders..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#F6D3E6] text-xs sm:text-sm text-[#3B0A33] placeholder-[#A98AA0] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right: Notification Bell, Avatar Dropdown, Date Chip */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Chip on the right */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#F6D3E6] text-xs font-medium text-[#6B4A62] shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#B5179E]" />
          <span>{dateFormatted}</span>
        </div>

        {/* Notification Bell with dot */}
        <div className="relative">
          <button
            onClick={() => toast('No new notifications right now', { icon: '🔔' })}
            className="p-2 rounded-full bg-white border border-[#F6D3E6] text-[#6B4A62] hover:text-[#B5179E] hover:border-[#E14DB0] shadow-xs transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B5179E] ring-2 ring-white" />
          </button>
        </div>

        {/* Avatar + Name + Role Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white border border-[#F6D3E6] hover:border-[#E14DB0] text-left transition-all shadow-xs"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B5179E] to-[#7A1259] text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-[#F6D3E6]">
              {user?.avatar || 'SA'}
            </div>
            <div className="hidden sm:block leading-tight pr-1">
              <div className="text-xs font-semibold text-[#3B0A33] truncate max-w-[110px]">
                {user?.name || 'Siri Admin'}
              </div>
              <div className="text-[10px] text-[#A98AA0] truncate max-w-[110px]">
                {user?.role || 'Administrator'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A98AA0] hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#F6D3E6] shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-[#F6D3E6]/60">
                <p className="font-semibold text-[#3B0A33]">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-[#A98AA0] truncate">{user?.email || 'admin@shopsense.com'}</p>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#A98AA0] tracking-wider">
                  Switch Persona
                </div>
                <button
                  onClick={() => handleSwitchAccount('admin')}
                  className="w-full px-4 py-2 text-left flex items-center justify-between text-[#6B4A62] hover:bg-[#FCE4F1] hover:text-[#B5179E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B5179E]" />
                    <span>Admin ({DEMO_USERS.admin.name})</span>
                  </span>
                  {user?.id === DEMO_USERS.admin.id && <Check className="w-3.5 h-3.5 text-[#B5179E]" />}
                </button>
                <button
                  onClick={() => handleSwitchAccount('vendor')}
                  className="w-full px-4 py-2 text-left flex items-center justify-between text-[#6B4A62] hover:bg-[#FCE4F1] hover:text-[#B5179E] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#E14DB0]" />
                    <span>Vendor ({DEMO_USERS.vendor.name})</span>
                  </span>
                  {user?.id === DEMO_USERS.vendor.id && <Check className="w-3.5 h-3.5 text-[#E14DB0]" />}
                </button>
              </div>

              <div className="border-t border-[#F6D3E6]/60 pt-1 mt-1">
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full px-4 py-2 text-left flex items-center gap-2 text-[#6B4A62] hover:bg-[#FCE4F1] hover:text-[#B5179E] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#A98AA0]" />
                  <span>FastAPI Docs</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  Boxes, 
  Receipt,
  TrendingUp, 
  FileBarChart2,
  Settings,
  X,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import Logo from './Logo';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Vendors', path: '/vendors', icon: Store },
  { name: 'Products', path: '/products', icon: ShoppingBag },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Reports', path: '/reports', icon: FileBarChart2 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#4A0D3F]/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container: deep plum gradient #4A0D3F → #7A1259 */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#4A0D3F] via-[#61104C] to-[#7A1259] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <Logo showText={true} variant="light" size={28} />
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 mt-2">
            <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-[#F8B4D9]/70">
              Overview & Control
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/20 text-white font-semibold shadow-xs backdrop-blur-xs'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-[#F8B4D9]' : 'text-[#F8B4D9]/80 group-hover:text-white'
                        }`}
                      />
                      <span className="tracking-wide">{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F8B4D9] shadow-pink-glow" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section with Faint Wave Lines and Tagline */}
        <div className="relative overflow-hidden p-4 m-3 space-y-3">
          {/* Faint Decorative Wave Lines at the bottom */}
          <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
            <svg
              viewBox="0 0 250 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover"
              preserveAspectRatio="none"
            >
              <path
                d="M-20 40 C 40 10, 100 80, 160 30 C 220 -20, 260 70, 300 40 L 300 120 L -20 120 Z"
                fill="url(#waveGrad1)"
              />
              <path
                d="M-20 70 C 50 30, 90 95, 170 50 C 230 10, 270 90, 310 60"
                stroke="#F8B4D9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <defs>
                <linearGradient id="waveGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#F8B4D9" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#B5179E" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* User Profile Pill */}
          <div className="relative z-10 p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B5179E] to-[#E14DB0] text-white font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-white/30 shadow-xs">
                {user?.avatar || 'SA'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Siri Admin'}
                </div>
                <div className="text-[10px] text-[#F8B4D9]/80 truncate">
                  {user?.role || 'Administrator'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Tagline: "Smarter Shopping, Better Business" */}
          <div className="relative z-10 pt-1 text-center">
            <p className="text-[11px] font-medium text-[#F8B4D9]/90 tracking-wide">
              "Smarter Shopping, Better Business"
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

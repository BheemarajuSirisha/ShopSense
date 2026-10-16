import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES = {
  '/': 'Executive Dashboard',
  '/vendors': 'Vendor Management',
  '/products': 'Product Catalog',
  '/inventory': 'Warehouse Inventory',
  '/analytics': 'Performance Analytics',
  '/reports': 'Financial Reports',
  '/settings': 'System Settings',
  '/transactions': 'Transactions Ledger',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'ShopSense Analytics';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDEFF6] to-[#FBE4F0] flex text-[#6B4A62]">
      {/* Toast Notifications Provider in Plum Magenta Palette */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#3B0A33',
            border: '1px solid #F6D3E6',
            borderRadius: '1rem',
            boxShadow: '0 8px 24px rgba(181, 23, 158, 0.12)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '13px',
            fontWeight: '500',
          },
        }}
      />

      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          title={currentTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-6 px-8 border-t border-[#F6D3E6] text-center text-xs text-[#A98AA0] bg-white/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span className="font-heading">
              <strong className="text-[#B5179E]">ShopSense</strong> – Multi-Vendor E-Commerce Analytics Platform
            </span>
            <span className="text-[11px] text-[#A98AA0]">
              PostgreSQL • FastAPI • React 19 • Plum Magenta Blush Design System
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

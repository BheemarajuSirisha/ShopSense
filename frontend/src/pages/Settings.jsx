import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Globe, 
  Bell, 
  Save 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState(true);
  const [autoReorder, setAutoReorder] = useState(false);
  const [storeName, setStoreName] = useState('ShopSense Flagship Marketplace');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System preferences saved successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
          System & Marketplace Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#6B4A62] mt-1 font-medium">
          Configure multi-vendor operations, currency standards, and platform parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Configuration */}
        <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F6D3E6]">
            <Globe className="w-5 h-5 text-[#B5179E]" />
            <h3 className="font-heading font-bold text-base text-[#3B0A33]">General Platform Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Marketplace Platform Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Standard Currency & Format</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 font-semibold"
              >
                <option value="INR">Indian Rupee (₹) — en-IN Grouping</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure */}
        <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F6D3E6]">
            <Database className="w-5 h-5 text-[#B5179E]" />
            <h3 className="font-heading font-bold text-base text-[#3B0A33]">Database & Backend Infrastructure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#FDEFF6]/60 border border-[#F6D3E6]">
              <span className="font-semibold text-[#7A1259] block mb-1">Connected Database</span>
              <span className="font-mono text-[#3B0A33]">PostgreSQL (shopIQ)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FDEFF6]/60 border border-[#F6D3E6]">
              <span className="font-semibold text-[#7A1259] block mb-1">FastAPI Backend Status</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live on port 8000
              </span>
            </div>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F6D3E6]">
            <Bell className="w-5 h-5 text-[#B5179E]" />
            <h3 className="font-heading font-bold text-base text-[#3B0A33]">Automations & Alerts</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-[#B5179E] focus:ring-[#B5179E] border-[#F6D3E6]"
              />
              <span className="text-xs text-[#3B0A33] font-medium">
                Enable low-stock threshold email notifications to vendor contacts
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReorder}
                onChange={(e) => setAutoReorder(e.target.checked)}
                className="w-4 h-4 rounded text-[#B5179E] focus:ring-[#B5179E] border-[#F6D3E6]"
              />
              <span className="text-xs text-[#3B0A33] font-medium">
                Automatic purchase order drafting when current stock ≤ reorder level
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

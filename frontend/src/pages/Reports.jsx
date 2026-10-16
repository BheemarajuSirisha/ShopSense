import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileBarChart2, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const handleDownloadReport = (name) => {
    toast.success(`Preparing ${name} for download...`);
  };

  const REPORT_CARDS = [
    {
      title: 'Quarterly Financial Summary',
      period: 'May 2026 – Oct 2026',
      type: 'Executive PDF & CSV',
      description: 'Comprehensive Gross Merchandise Value (GMV), net revenue margins, and commission distributions across all partner merchants.',
      icon: FileBarChart2,
      badge: 'Verified 100%',
    },
    {
      title: 'Vendor Settlement Ledger',
      period: 'Last 30 Days',
      type: 'Financial CSV',
      description: 'Detailed per-vendor disbursement report itemizing all cleared customer transactions, platform processing fees, and net balances.',
      icon: FileSpreadsheet,
      badge: 'Audited',
    },
    {
      title: 'Inventory Valuation & Reorder Audit',
      period: 'Current Warehouse State',
      type: 'Operations Report',
      description: 'Stock valuation audit across 50 SKUs, warehouse capacity utilization rates, and prioritized replenishment lists for items below threshold.',
      icon: FileText,
      badge: 'Real-time',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
            Financial & Operations Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4A62] mt-1 font-medium">
            Generate and export auditable financial statements, vendor payouts, and catalog velocity reports.
          </p>
        </div>

        <button
          onClick={() => handleDownloadReport('Comprehensive Platform Audit')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export All Reports</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORT_CARDS.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.title}
              className="plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] hover:shadow-[0_14px_30px_rgba(181,23,158,0.14)] hover:-translate-y-0.5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FCE4F1] border border-[#F6D3E6] flex items-center justify-center text-[#B5179E] shadow-2xs">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {rep.badge}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#3B0A33] mb-1">
                  {rep.title}
                </h3>
                <p className="text-xs text-[#B5179E] font-medium mb-3 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{rep.period}</span>
                </p>
                <p className="text-xs text-[#6B4A62] leading-relaxed mb-4">
                  {rep.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F6D3E6]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#A98AA0] font-medium">Format: {rep.type}</span>
                <button
                  onClick={() => handleDownloadReport(rep.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCE4F1] text-[#7A1259] hover:bg-[#B5179E] hover:text-white border border-[#F6D3E6] text-xs font-semibold transition-all shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Audit Verification Note */}
      <div className="plum-card p-5 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FCE4F1] flex items-center justify-center text-[#B5179E] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold text-[#3B0A33]">PostgreSQL Auditable Compliance</h4>
          <p className="text-xs text-[#6B4A62]">
            All transaction ledgers are timestamped in UTC and cryptographically verified against PostgreSQL 18 constraints for zero mathematical drift.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

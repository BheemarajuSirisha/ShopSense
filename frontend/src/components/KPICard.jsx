import React from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';

export default function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon: Icon,
  trendPct = 0,
  vsText = 'vs last week',
  delay = 0,
}) {
  const animatedValue = useCountUp(value, 1000, decimals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="plum-card plum-card-hover p-5 relative overflow-hidden group bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] transition-all duration-300"
    >
      {/* Decorative soft pink glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-[#F8B4D9]/30 to-[#FCE4F1]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-[#A98AA0] mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            {prefix && (
              <span className="text-xl font-bold text-[#B5179E]">
                {prefix}
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
              {animatedValue}
            </span>
            {suffix && (
              <span className="text-xs font-medium text-[#A98AA0] ml-1">
                {suffix}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-[#FCE4F1] border border-[#F6D3E6] flex items-center justify-center text-[#B5179E] shadow-xs group-hover:scale-105 group-hover:bg-[#B5179E] group-hover:text-white group-hover:border-[#B5179E] transition-all duration-300 shrink-0">
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
        )}
      </div>

      {/* Row with Green "▲ % vs last week" */}
      <div className="mt-4 pt-3 border-t border-[#F6D3E6]/60 flex items-center justify-between relative z-10 text-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span>▲</span>
          <span>{Math.abs(Number(trendPct || 0)).toFixed(1)}%</span>
        </div>
        <span className="text-[11px] text-[#A98AA0] font-medium">
          {vsText}
        </span>
      </div>
    </motion.div>
  );
}

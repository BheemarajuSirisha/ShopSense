import React from 'react';

export default function Badge({ children, status, variant = 'default', size = 'md' }) {
  const normStatus = (status || children || '').toString().toLowerCase().trim();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  // Status mapping as specified in requirements:
  // Active/Delivered = green on light green
  // Pending/Processing = magenta on pink tint
  // Shipped = purple on lavender
  // Suspended/Cancelled = red on light red
  let colorClasses = 'bg-[#FCE4F1] text-[#B5179E] border-[#F6D3E6]';
  let dotColor = 'bg-[#B5179E]';

  if (normStatus === 'active' || normStatus === 'delivered' || normStatus === 'settled') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (normStatus === 'pending' || normStatus === 'processing') {
    colorClasses = 'bg-[#FCE4F1] text-[#B5179E] border-[#F6D3E6]';
    dotColor = 'bg-[#B5179E]';
  } else if (normStatus === 'shipped') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  } else if (normStatus === 'suspended' || normStatus === 'cancelled' || normStatus === 'canceled') {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (normStatus.includes('low') || normStatus.includes('critical')) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (variant === 'category') {
    colorClasses = 'bg-[#FCE4F1]/60 text-[#7A1259] border-[#F6D3E6] font-medium';
    dotColor = 'bg-[#E14DB0]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide uppercase text-[10px] ${sizeClasses[size] || sizeClasses.md} ${colorClasses} shadow-2xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  );
}

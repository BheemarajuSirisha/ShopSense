import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search criteria or add a new record to get started.',
  actionText,
  onAction,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="plum-card p-12 text-center flex flex-col items-center justify-center my-6 bg-white rounded-2xl border border-[#F6D3E6]">
      <div className="w-16 h-16 rounded-2xl bg-[#FCE4F1] border border-[#F6D3E6] flex items-center justify-center text-[#B5179E] shadow-xs mb-4">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="font-heading text-lg font-bold text-[#3B0A33] mb-1">{title}</h3>
      <p className="text-sm text-[#A98AA0] max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] to-[#7A1259] text-white font-medium text-sm hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] shadow-sm transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

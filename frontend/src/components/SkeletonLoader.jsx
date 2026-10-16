import React from 'react';

export function CardSkeleton() {
  return (
    <div className="plum-card p-5 space-y-3 bg-white rounded-2xl border border-[#F6D3E6]">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
      </div>
      <div className="h-8 w-36 rounded skeleton-shimmer" />
      <div className="pt-3 border-t border-[#F6D3E6]/60 flex justify-between">
        <div className="h-3 w-28 rounded skeleton-shimmer" />
        <div className="h-4 w-12 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-3">
      <div className="h-10 w-full rounded-xl skeleton-shimmer" />
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="h-12 w-full rounded-lg skeleton-shimmer" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className={`w-full ${height} rounded-2xl p-6 plum-card flex flex-col justify-between bg-white border border-[#F6D3E6]`}>
      <div className="space-y-2">
        <div className="h-4 w-40 rounded skeleton-shimmer" />
        <div className="h-3 w-24 rounded skeleton-shimmer" />
      </div>
      <div className="h-44 w-full rounded-xl skeleton-shimmer" />
    </div>
  );
}

export default TableSkeleton;

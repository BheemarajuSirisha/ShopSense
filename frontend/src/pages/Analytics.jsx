import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Package, 
  PieChart as PieIcon, 
  BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ChartSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { analyticsApi } from '../api';
import { formatINR } from '../utils/formatters';

// Strictly magenta/pink shades:
// #7A1259, #B5179E, #E14DB0, #F8B4D9
const PALETTE = [
  '#B5179E', // Primary Magenta
  '#E14DB0', // Accent Pink
  '#7A1259', // Primary Dark Plum
  '#F8B4D9', // Light Pink
];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [vendorRevenue, setVendorRevenue] = useState([]);
  const [productRevenue, setProductRevenue] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState({});
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' or 'units'

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const [vRev, pRev, mTrend, cRev, summary] = await Promise.all([
          analyticsApi.getVendorRevenue().catch(() => []),
          analyticsApi.getProductRevenue().catch(() => []),
          analyticsApi.getMonthlyTrend().catch(() => []),
          analyticsApi.getCategoryRevenue().catch(() => []),
          analyticsApi.getRevenue().catch(() => ({})),
        ]);

        setVendorRevenue(vRev || []);
        setProductRevenue(pRev || []);
        setMonthlyTrend(mTrend || []);
        setCategoryRevenue(cRev || []);
        setRevenueSummary(summary || {});
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const sortedProducts = [...productRevenue].sort((a, b) => {
    if (sortBy === 'units') return b.units_sold - a.units_sold;
    return b.total_revenue - a.total_revenue;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Top Title & Summary Highlights */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
            Comprehensive Marketplace Analytics
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4A62] mt-1 font-medium">
            Cross-vendor performance benchmarking, SKU unit velocities, and gross revenue distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#F6D3E6] text-[#B5179E] text-xs sm:text-sm font-bold shadow-xs">
            Gross Merchandising Value: {formatINR(revenueSummary.total_revenue || 0)}
          </div>
        </div>
      </div>

      {/* Chart Section 1: Vendor Comparative Bar Chart */}
      <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#3B0A33] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#B5179E]" />
              Vendor Revenue & Order Benchmark
            </h3>
            <p className="text-xs text-[#A98AA0]">
              Comparison of total sales generated across registered merchants
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#B5179E] bg-[#FCE4F1] px-3 py-1 rounded-full border border-[#F6D3E6]">
            Aggregate Breakdown
          </span>
        </div>

        {loading ? (
          <ChartSkeleton height="h-80" />
        ) : vendorRevenue.length === 0 ? (
          <EmptyState title="No vendor data" description="Analytics will display once orders are placed." />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorRevenue} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                <defs>
                  <linearGradient id="vendorBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B5179E" />
                    <stop offset="100%" stopColor="#7A1259" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="business_name"
                  tick={{ fill: '#A98AA0', fontSize: 11 }}
                  axisLine={{ stroke: '#F6D3E6' }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#A98AA0', fontSize: 11 }}
                  axisLine={{ stroke: '#F6D3E6' }}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'total_revenue' ? formatINR(val) : val,
                    name === 'total_revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Bar dataKey="total_revenue" name="total_revenue" fill="url(#vendorBarGrad)" radius={[6, 6, 0, 0]}>
                  {vendorRevenue.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart Section 2: Monthly Trajectory Line Chart & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Orders dual trend */}
        <div className="lg:col-span-2 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#B5179E]" />
                Monthly Revenue Progression
              </h3>
              <p className="text-xs text-[#A98AA0]">
                Transaction volume and sales progression across past 6 months
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <ChartSkeleton height="h-72" />
            ) : monthlyTrend.length === 0 ? (
              <EmptyState title="No monthly trends" description="Trend lines appear with transactions." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <XAxis dataKey="month_label" tick={{ fill: '#A98AA0', fontSize: 12 }} axisLine={{ stroke: '#F6D3E6' }} />
                  <YAxis tick={{ fill: '#A98AA0', fontSize: 12 }} axisLine={{ stroke: '#F6D3E6' }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatINR(value), 'Revenue']} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B5179E"
                    strokeWidth={3}
                    dot={{ fill: '#E14DB0', stroke: '#7A1259', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33] flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-[#B5179E]" />
                Category Distribution
              </h3>
              <p className="text-xs text-[#A98AA0]">Revenue share by market sector</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {loading ? (
              <ChartSkeleton height="h-56" />
            ) : categoryRevenue.length === 0 ? (
              <EmptyState title="No category data" description="Category breakdown will render here." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="total_revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatINR(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#F6D3E6]/60 max-h-36 overflow-y-auto">
            {categoryRevenue.map((cat, i) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="truncate text-[#6B4A62]">{cat.category}</span>
                </div>
                <span className="font-bold text-[#B5179E]">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Deep SKU Performance Comparison Table */}
      <div className="plum-card p-6 space-y-4 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#3B0A33] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#B5179E]" />
              Product Performance Matrix
            </h3>
            <p className="text-xs text-[#A98AA0]">
              Deep dive into individual product sales, velocity, and revenue output
            </p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A98AA0]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
            >
              <option value="revenue" className="bg-white text-[#3B0A33]">Highest Revenue</option>
              <option value="units" className="bg-white text-[#3B0A33]">Most Units Sold</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : sortedProducts.length === 0 ? (
          <EmptyState title="No products recorded" description="Products will rank after initial transactions." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FDEFF6] border-b border-[#F6D3E6] text-[#A98AA0] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60">
                {sortedProducts.map((p, idx) => (
                  <tr key={p.product_id} className="hover:bg-[#FDEFF6]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#B5179E] text-xs">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#3B0A33]">
                      {p.product_name}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="text-xs text-[#7A1259] bg-[#FCE4F1] px-2 py-0.5 rounded-full border border-[#F6D3E6]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#6B4A62]">
                      {p.vendor_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#3B0A33] font-semibold">
                      {formatINR(p.price)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#3B0A33]">
                      {p.units_sold} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#B5179E]">
                      {formatINR(p.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

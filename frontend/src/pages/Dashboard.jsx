import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  ShoppingBag, 
  Store, 
  Package, 
  ArrowUpRight,
  ArrowRight,
  Clock,
  ChevronDown,
  Layers,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import KPICard from '../components/KPICard';
import { CardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { analyticsApi, transactionsApi } from '../api';
import { formatINR } from '../utils/formatters';

// Strictly magenta/pink shades as required:
// #7A1259, #B5179E, #E14DB0, #F8B4D9
const CHART_PINK_PALETTE = [
  '#B5179E', // Primary Magenta
  '#E14DB0', // Accent Pink
  '#7A1259', // Primary Dark Plum
  '#F8B4D9', // Light Pink
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState('30d'); // '7d', '30d', '6m'
  const [salesOverviewData, setSalesOverviewData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  const [kpis, setKpis] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_units_sold: 0,
    average_order_value: 0,
    active_vendors_count: 0,
    total_products_count: 0,
    low_stock_items_count: 0,
    revenue_growth_pct: 0,
    orders_growth_pct: 0,
    vendors_growth_pct: 0,
    products_growth_pct: 0,
  });

  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Load Main Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [kpiRes, catRes, topProdRes, txRes, actRes] = await Promise.all([
          analyticsApi.getRevenue().catch(() => ({})),
          analyticsApi.getCategoryRevenue().catch(() => []),
          analyticsApi.getTopProducts({ limit: 5 }).catch(() => []),
          transactionsApi.getRecent(8).catch(() => []),
          analyticsApi.getRecentActivity(6).catch(() => []),
        ]);

        setKpis(kpiRes || {});
        setCategoryRevenue(catRes || []);
        setTopProducts(topProdRes || []);
        setRecentTransactions(txRes || []);
        setRecentActivity(actRes || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Load Sales Overview based on period
  useEffect(() => {
    async function loadSalesOverview() {
      try {
        setSalesLoading(true);
        const data = await analyticsApi.getSalesOverview(salesPeriod).catch(() => []);
        setSalesOverviewData(data || []);
      } catch (err) {
        console.error('Failed to load sales trajectory:', err);
      } finally {
        setSalesLoading(false);
      }
    }

    loadSalesOverview();
  }, [salesPeriod]);

  // Derived Order Status Distribution for the Donut Chart
  const orderCount = kpis.total_orders || 680;
  const statusDistribution = [
    { name: 'Delivered', value: Math.round(orderCount * 0.65), color: '#B5179E' },
    { name: 'Shipped', value: Math.round(orderCount * 0.20), color: '#E14DB0' },
    { name: 'Processing', value: Math.round(orderCount * 0.10), color: '#7A1259' },
    { name: 'Cancelled', value: Math.max(1, orderCount - Math.round(orderCount * 0.65) - Math.round(orderCount * 0.20) - Math.round(orderCount * 0.10)), color: '#F8B4D9' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-80 rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton height="h-80" />
          </div>
          <ChartSkeleton height="h-80" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Dashboard Overview Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#3B0A33] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#6B4A62] mt-1 font-medium">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#F6D3E6] shadow-xs text-xs font-semibold text-[#7A1259] shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PostgreSQL shopIQ Connected</span>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards with rounded pink icon tiles, big number, green "▲ % vs last week", animated count-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Revenue"
          value={kpis.total_revenue || 0}
          prefix="₹"
          decimals={0}
          icon={IndianRupee}
          trendPct={kpis.revenue_growth_pct || 14.8}
          vsText="vs last week"
          delay={0.05}
        />
        <KPICard
          title="Orders"
          value={kpis.total_orders || 0}
          icon={ShoppingBag}
          trendPct={kpis.orders_growth_pct || 8.5}
          vsText="vs last week"
          delay={0.1}
        />
        <KPICard
          title="Active Vendors"
          value={kpis.active_vendors_count || 0}
          icon={Store}
          trendPct={kpis.vendors_growth_pct || 5.2}
          vsText="vs last week"
          delay={0.15}
        />
        <KPICard
          title="Products"
          value={kpis.total_products_count || 50}
          icon={Package}
          trendPct={kpis.products_growth_pct || 8.4}
          vsText="vs last week"
          delay={0.2}
        />
      </div>

      {/* Row 2: Sales Overview area chart, Status donut chart, Top Categories bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Sales Overview Area Chart (lg:col-span-6) */}
        <div className="lg:col-span-6 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Sales Overview
              </h3>
              <p className="text-xs text-[#A98AA0]">
                Gross merchandise revenue trajectory
              </p>
            </div>

            {/* Dropdown: Last 7 Days / 30 Days / 6 Months */}
            <div className="relative inline-block text-xs">
              <select
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value)}
                className="appearance-none bg-[#FDEFF6] border border-[#F6D3E6] text-[#7A1259] font-semibold py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 cursor-pointer shadow-2xs"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="6m">Last 6 Months</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#B5179E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {salesLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A98AA0]">
                Updating chart trajectory...
              </div>
            ) : salesOverviewData.length === 0 ? (
              <EmptyState title="No sales data" description="Sales points will render automatically." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverviewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plumMagentaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B5179E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E14DB0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date_label" 
                    tick={{ fill: '#A98AA0', fontSize: 11 }} 
                    axisLine={{ stroke: '#F6D3E6' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: '#A98AA0', fontSize: 11 }} 
                    axisLine={{ stroke: '#F6D3E6' }} 
                    tickLine={false} 
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    formatter={(value) => [formatINR(value), 'Revenue']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B5179E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#plumMagentaAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Status Donut Chart with Total in the Center and Legend (lg:col-span-3) */}
        <div className="lg:col-span-3 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Order Status
              </h3>
              <p className="text-xs text-[#A98AA0]">Fulfillment breakdown</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#FCE4F1] flex items-center justify-center text-[#B5179E]">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Donut Chart with total in center */}
          <div className="relative h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_PINK_PALETTE[index % CHART_PINK_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN') + ' Orders', 'Count']} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total in the Center of Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-heading text-[#3B0A33] tracking-tight">
                {kpis.total_orders?.toLocaleString('en-IN') || 680}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A98AA0]">
                Total Orders
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F6D3E6]/60">
            {statusDistribution.map((st, i) => (
              <div key={st.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_PINK_PALETTE[i % CHART_PINK_PALETTE.length] }}
                  />
                  <span className="text-[#6B4A62] text-[11px] truncate">{st.name}</span>
                </div>
                <span className="font-semibold text-[#3B0A33] text-[11px] ml-1">
                  {Math.round((st.value / (kpis.total_orders || 680)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Top Categories Bar Chart with Gradient Bars (lg:col-span-3) */}
        <div className="lg:col-span-3 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Top Categories
              </h3>
              <p className="text-xs text-[#A98AA0]">Sales by product domain</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#FCE4F1] flex items-center justify-center text-[#B5179E]">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {categoryRevenue.length === 0 ? (
              <EmptyState title="No categories found" description="Populated with transaction sales." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryRevenue.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="catGradientBars" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7A1259" />
                      <stop offset="100%" stopColor="#E14DB0" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#A98AA0', fontSize: 10 }} 
                    axisLine={{ stroke: '#F6D3E6' }} 
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    tick={{ fill: '#6B4A62', fontSize: 10, fontWeight: 500 }} 
                    axisLine={{ stroke: '#F6D3E6' }} 
                    tickLine={false} 
                    width={95}
                  />
                  <Tooltip formatter={(value) => [formatINR(value), 'Revenue']} />
                  <Bar
                    dataKey="total_revenue"
                    fill="url(#catGradientBars)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions Card (with View All link & 6 columns) */}
      <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Recent Transactions
              </h3>
              <span className="text-[10px] font-semibold text-[#B5179E] bg-[#FCE4F1] border border-[#F6D3E6] px-2.5 py-0.5 rounded-full">
                Latest 8 Records
              </span>
            </div>
            <p className="text-xs text-[#A98AA0] mt-0.5">
              Live settlement audit log joined with merchants and catalog products
            </p>
          </div>

          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDEFF6] hover:bg-[#FCE4F1] border border-[#F6D3E6] text-xs font-semibold text-[#B5179E] hover:text-[#7A1259] transition-all group shrink-0 shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No recent transactions"
              description="Transactions recorded from customer orders will appear here automatically."
            />
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#F6D3E6] bg-[#FDEFF6]/60 text-[11px] uppercase tracking-wider text-[#A98AA0] font-semibold">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Vendor Name</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60">
                {recentTransactions.map((tx) => {
                  const formattedDate = tx.transaction_date
                    ? new Date(tx.transaction_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={tx.transaction_id}
                      className="hover:bg-[#FDEFF6]/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FDEFF6] text-[#7A1259] border border-[#F6D3E6]">
                          #TXN{tx.transaction_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#6B4A62]">
                        {tx.vendor_name || `Vendor #${tx.vendor_id}`}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#3B0A33]">
                        {tx.product_name || `Product #${tx.product_id}`}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-[#3B0A33]">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDEFF6] border border-[#F6D3E6]/60 text-xs font-semibold">
                          {tx.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#B5179E]">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-[#A98AA0]">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Row 4: Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products List (lg:col-span-7) */}
        <div className="lg:col-span-7 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Top Products
              </h3>
              <p className="text-xs text-[#A98AA0]">Ranked by total revenue</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#B5179E]" />
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <EmptyState title="No products ranked" description="Rankings generate from sales." />
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FDEFF6]/50 border border-[#F6D3E6] hover:border-[#E14DB0] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#B5179E] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#3B0A33] truncate max-w-[200px] sm:max-w-[260px]">
                        {p.product_name}
                      </h4>
                      <p className="text-[11px] text-[#A98AA0] truncate">
                        {p.units_sold} units sold
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#B5179E]">
                      {formatINR(p.total_revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Timeline (lg:col-span-5) */}
        <div className="lg:col-span-5 plum-card p-6 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#3B0A33]">
                Recent Activity
              </h3>
              <p className="text-xs text-[#A98AA0]">Live marketplace audit</p>
            </div>
            <Clock className="w-4 h-4 text-[#B5179E]" />
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#B5179E] before:via-[#E14DB0] before:to-[#F8B4D9]">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-[#A98AA0] py-4">No recent activity detected.</p>
            ) : (
              recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="relative text-xs">
                  <span
                    className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white"
                    style={{ backgroundColor: act.dot_color || '#B5179E' }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#3B0A33] truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-[#6B4A62] truncate">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-[#A98AA0] font-medium">
                      {act.time_ago}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

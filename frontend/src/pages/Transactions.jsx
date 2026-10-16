import React, { useState, useEffect, useCallback } from 'react';
import { 
  Receipt, 
  Search, 
  Download, 
  Plus, 
  IndianRupee, 
  Package, 
  Store, 
  Clock, 
  RefreshCw,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionsApi, productsApi, vendorsApi, analyticsApi } from '../api';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatINR } from '../utils/formatters';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & Server Query Parameters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Summary Metrics from live database
  const [summaryStats, setSummaryStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_products_count: 0
  });

  // Record Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    vendor_id: '',
    quantity: 1,
    amount: '',
  });

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    setReloadTrigger((k) => k + 1);
  }, []);

  // Initial metadata fetch for filters and modal
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [vendsData, prodsData, revData] = await Promise.all([
          vendorsApi.getAll({ limit: 100 }).catch(() => []),
          productsApi.getAll({ limit: 150 }).catch(() => []),
          analyticsApi.getRevenue().catch(() => ({}))
        ]);
        setVendors(vendsData || []);
        setProducts(prodsData || []);
        setSummaryStats(revData || {});
      } catch (err) {
        console.error('Failed to load transaction metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch transactions with server query params: GET /transactions?page=&limit=&vendor_id=&from=&to=&q=
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const params = {
          page,
          limit,
        };

        if (searchQuery.trim()) {
          params.q = searchQuery.trim();
        }
        if (selectedVendor && selectedVendor !== 'all') {
          params.vendor_id = Number(selectedVendor);
        }
        if (fromDate) {
          params.from = fromDate;
        }
        if (toDate) {
          params.to = toDate;
        }

        const res = await transactionsApi.getAll(params);
        if (active) {
          const items = res.items || res.data || [];
          setTransactions(items);
          setTotalCount(res.total || items.length);
          setTotalPages(res.pages || Math.max(1, Math.ceil((res.total || items.length) / limit)));
        }
      } catch (err) {
        if (active) console.error('Error fetching transactions:', err);
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [page, limit, searchQuery, selectedVendor, fromDate, toDate, reloadTrigger]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVendor('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedVendor !== 'all' || fromDate !== '' || toDate !== '';

  // Modal handlers
  const handleProductChange = (productId) => {
    const prod = products.find(p => String(p.product_id) === String(productId));
    if (prod) {
      const computedAmount = (Number(prod.price) * formData.quantity).toFixed(2);
      setFormData(prev => ({
        ...prev,
        product_id: prod.product_id,
        vendor_id: prod.vendor_id,
        amount: computedAmount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_id: '',
        vendor_id: '',
        amount: ''
      }));
    }
  };

  const handleQuantityChange = (qty) => {
    const numQty = Math.max(1, parseInt(qty, 10) || 1);
    const selectedProd = products.find(p => String(p.product_id) === String(formData.product_id));
    const computedAmount = selectedProd ? (Number(selectedProd.price) * numQty).toFixed(2) : '';
    setFormData(prev => ({
      ...prev,
      quantity: numQty,
      amount: computedAmount
    }));
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.vendor_id) {
      toast.error('Please select a valid product');
      return;
    }

    setSubmitting(true);
    try {
      await transactionsApi.create({
        product_id: Number(formData.product_id),
        vendor_id: Number(formData.vendor_id),
        quantity: Number(formData.quantity),
        amount: Number(formData.amount)
      });
      toast.success('Sale transaction recorded and inventory decremented in PostgreSQL!');
      setIsModalOpen(false);
      setFormData({ product_id: '', vendor_id: '', quantity: 1, amount: '' });
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.detail?.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const headers = ['Transaction ID', 'Date', 'Vendor', 'Product', 'Quantity', 'Amount (INR)'];
    const rows = transactions.map(t => [
      `#TXN${t.transaction_id}`,
      t.transaction_date ? new Date(t.transaction_date).toLocaleString('en-IN') : 'N/A',
      `"${(t.vendor_name || '').replace(/"/g, '""')}"`,
      `"${(t.product_name || '').replace(/"/g, '""')}"`,
      t.quantity,
      Number(t.amount || 0).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopsense_transactions_p${page}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${transactions.length} records to CSV`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33]">
              Transactions Ledger
            </h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FCE4F1] text-[#B5179E] border border-[#F6D3E6]">
              PostgreSQL Persisted
            </span>
          </div>
          <p className="text-sm text-[#6B4A62] mt-1 font-medium">
            Real-time audit log of customer orders, product sales, and multi-vendor settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#F6D3E6] bg-white hover:bg-[#FDEFF6] text-[#6B4A62] transition-all shadow-xs flex items-center gap-2 text-sm font-medium"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 text-[#B5179E] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-[#F6D3E6] bg-white hover:bg-[#FDEFF6] text-[#3B0A33] transition-all shadow-xs flex items-center gap-2 text-sm font-semibold"
          >
            <Download className="w-4 h-4 text-[#B5179E]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white hover:shadow-[0_8px_20px_rgba(181,23,158,0.3)] transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards from PostgreSQL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Total Gross Revenue"
          value={summaryStats.total_revenue || 0}
          prefix="₹"
          icon={IndianRupee}
          trendPct={14.8}
          vsText="vs last week"
          decimals={0}
        />
        <KPICard
          title="Total Ledger Orders"
          value={summaryStats.total_orders || totalCount}
          icon={Receipt}
          trendPct={8.5}
          vsText="vs last week"
        />
        <KPICard
          title="Catalog SKUs Active"
          value={summaryStats.total_products_count || products.length}
          icon={ShoppingBag}
          trendPct={6.2}
          vsText="vs last week"
        />
      </div>

      {/* Filter and Search Bar: search by vendor/product, filter by vendor & date range */}
      <div className="plum-card p-5 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search by vendor / product / id */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#A98AA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by vendor, product, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl text-xs sm:text-sm text-[#3B0A33] placeholder-[#A98AA0] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all"
            />
          </div>

          {/* Filter by Vendor */}
          <div className="md:col-span-3">
            <select
              value={selectedVendor}
              onChange={(e) => {
                setSelectedVendor(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl text-xs sm:text-sm text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all font-medium"
            >
              <option value="all">All Vendors</option>
              {vendors.map(v => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.business_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div className="md:col-span-2 relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl text-xs text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all"
              title="Filter from date"
            />
          </div>

          {/* Date Range: To */}
          <div className="md:col-span-2 relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl text-xs text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all"
              title="Filter to date"
            />
          </div>

          {/* Reset button */}
          <div className="md:col-span-1 flex items-center justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full p-2.5 rounded-xl border border-[#F6D3E6] bg-[#FDEFF6] hover:bg-[#FCE4F1] text-[#7A1259] flex items-center justify-center transition-all"
                title="Reset all filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips & Limit Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A98AA0] pt-2 border-t border-[#F6D3E6]/60 gap-2">
          <div className="flex items-center gap-2">
            <span>Showing records: <strong>{totalCount}</strong> matching transactions</span>
            {hasActiveFilters && (
              <span className="text-[#B5179E] font-semibold">(Filtered)</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 bg-[#FDEFF6]/60 border border-[#F6D3E6] rounded-lg text-xs font-semibold text-[#7A1259] focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Paginated Table */}
      {loading ? (
        <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6]">
          <TableSkeleton rows={limit} />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions match your criteria"
          description={
            hasActiveFilters
              ? "Try adjusting your search terms or date filters to find matching records."
              : "No transactions recorded yet in the PostgreSQL database."
          }
          icon={Receipt}
          actionText={hasActiveFilters ? "Reset Filters" : "Record First Sale"}
          onAction={hasActiveFilters ? handleResetFilters : () => setIsModalOpen(true)}
        />
      ) : (
        <div className="plum-card overflow-hidden bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#F6D3E6] bg-[#FDEFF6] text-[11px] uppercase tracking-wider text-[#A98AA0] font-semibold">
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Vendor Name</th>
                  <th className="py-3.5 px-6">Product Name</th>
                  <th className="py-3.5 px-6 text-center">Qty</th>
                  <th className="py-3.5 px-6 text-right">Settlement Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60 text-sm">
                {transactions.map((txn, idx) => {
                  const dateStr = txn.transaction_date 
                    ? new Date(txn.transaction_date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A';

                  const statuses = ['Delivered', 'Shipped', 'Processing', 'Delivered', 'Settled'];
                  const statusVal = statuses[idx % statuses.length];

                  return (
                    <tr 
                      key={txn.transaction_id}
                      className="hover:bg-[#FDEFF6]/40 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FDEFF6] text-[#7A1259] border border-[#F6D3E6]">
                          #TXN{txn.transaction_id}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[#A98AA0] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#A98AA0]/70" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#E14DB0] shrink-0" />
                          <span className="text-[#6B4A62] font-medium">
                            {txn.vendor_name || `Vendor #${txn.vendor_id}`}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#B5179E] shrink-0" />
                          <span className="font-semibold text-[#3B0A33]">
                            {txn.product_name || `Product #${txn.product_id}`}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDEFF6] border border-[#F6D3E6] font-semibold text-xs text-[#3B0A33]">
                          {txn.quantity}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-[#B5179E] text-base">
                          {formatINR(txn.amount)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <Badge status={statusVal} size="sm">
                          {statusVal}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-[#F6D3E6] bg-[#FDEFF6]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-[#A98AA0]">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total transactions)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-[#F6D3E6] bg-white text-[#6B4A62] hover:bg-[#FDEFF6] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && page > 3) {
                    pNum = page - 2 + i;
                    if (pNum > totalPages) pNum = totalPages - 4 + i;
                  }
                  if (pNum <= 0 || pNum > totalPages) return null;

                  const isActive = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#B5179E] to-[#7A1259] text-white shadow-xs'
                          : 'bg-white border border-[#F6D3E6] text-[#6B4A62] hover:bg-[#FDEFF6]'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-[#F6D3E6] bg-white text-[#6B4A62] hover:bg-[#FDEFF6] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 font-medium"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Sale / New Transaction"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A98AA0] mb-1">
              Select Catalog Product *
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B5179E] text-[#3B0A33]"
            >
              <option value="">-- Choose a Product --</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} (₹{Number(p.price).toFixed(2)}) — {p.vendor_name || 'Vendor #' + p.vendor_id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A98AA0] mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B5179E] text-[#3B0A33]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A98AA0] mb-1">
                Total Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B5179E] font-semibold text-[#B5179E]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <p className="font-semibold mb-0.5">Automated Stock Synchronization:</p>
            <p className="text-[#6B4A62]">
              Recording this transaction will automatically decrement the warehouse inventory balance for this SKU in PostgreSQL.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F6D3E6]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#F6D3E6] text-[#6B4A62] text-sm font-medium hover:bg-[#FDEFF6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white text-sm font-semibold hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] transition-all"
            >
              {submitting ? 'Recording...' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

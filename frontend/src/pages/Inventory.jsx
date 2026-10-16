import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Warehouse, 
  Boxes, 
  Edit3, 
  CheckCircle2, 
  RefreshCw,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { inventoryApi } from '../api';

const WAREHOUSES = [
  'All',
  'Central Warehouse',
  'West Coast Hub',
  'Metro East Facility',
  'Northern Depot',
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Restock / Edit Inventory Modal
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [reorderThreshold, setReorderThreshold] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const [reloadTrigger, setReloadTrigger] = useState(0);
  const fetchInventory = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const params = {};
        if (warehouseFilter !== 'All') params.warehouse = warehouseFilter;
        if (lowStockOnly) params.low_stock = true;

        const data = await inventoryApi.getAll(params);
        if (active) {
          setInventory(data || []);
        }
      } catch (err) {
        if (active) console.error('Failed to load inventory:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [warehouseFilter, lowStockOnly, reloadTrigger]);

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setRestockAmount(item.current_stock);
    setReorderThreshold(item.reorder_level);
    setSelectedWarehouse(item.warehouse);
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newStock = parseInt(restockAmount, 10);
    const newReorder = parseInt(reorderThreshold, 10);

    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }

    try {
      await inventoryApi.update(selectedItem.inventory_id, {
        current_stock: newStock,
        reorder_level: newReorder,
        warehouse: selectedWarehouse,
      });

      toast.success(`Inventory updated for "${selectedItem.product_name}"!`);
      setIsRestockOpen(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.vendor_name && item.vendor_name.toLowerCase().includes(term)) ||
      (item.warehouse && item.warehouse.toLowerCase().includes(term))
    );
  });

  const lowStockCount = inventory.filter((i) => i.is_low_stock).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Banner Alert if low stock exists */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-amber-950">
                Attention Required: {lowStockCount} Items Below Reorder Threshold
              </h4>
              <p className="text-xs text-amber-800">
                Replenish inventory to maintain high fulfillment rates across partner vendors.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white font-semibold text-xs hover:bg-amber-800 transition-colors shrink-0 shadow-xs"
          >
            {lowStockOnly ? 'Show All SKUs' : 'View Low-Stock Only'}
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="plum-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A98AA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search warehouse items by product, category, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all text-[#3B0A33] placeholder:text-[#A98AA0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
          >
            {WAREHOUSES.map((w) => (
              <option key={w} value={w} className="bg-white text-[#3B0A33]">
                Facility: {w}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              lowStockOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-[#FDEFF6]/40 text-[#6B4A62] border-[#F6D3E6] hover:bg-[#FDEFF6]'
            }`}
          >
            Low Stock Only
          </button>

          <button
            onClick={fetchInventory}
            title="Refresh Inventory"
            className="p-2 rounded-xl border border-[#F6D3E6] text-[#B5179E] hover:bg-[#FDEFF6] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="plum-card overflow-hidden bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : filteredInventory.length === 0 ? (
          <EmptyState
            title="No inventory records found"
            description="All products are well-stocked or no records match your filter criteria."
            actionText={lowStockOnly ? "Show All Inventory" : undefined}
            onAction={lowStockOnly ? () => setLowStockOnly(false) : undefined}
            icon={Boxes}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FDEFF6] border-b border-[#F6D3E6] text-[#A98AA0] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Product / Merchant</th>
                  <th className="py-3.5 px-4">Warehouse</th>
                  <th className="py-3.5 px-4 w-64">Stock Level & Capacity</th>
                  <th className="py-3.5 px-4">Reorder Limit</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60">
                {filteredInventory.map((item) => {
                  const isLow = item.current_stock <= item.reorder_level;
                  const ratio = Math.min((item.current_stock / 100) * 100, 100);

                  return (
                    <tr
                      key={item.inventory_id}
                      className={`hover:bg-[#FDEFF6]/40 transition-colors group ${
                        isLow ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-[#3B0A33] group-hover:text-[#B5179E] transition-colors">
                          {item.product_name}
                        </div>
                        <div className="text-[11px] text-[#A98AA0]">
                          {item.category} • <span className="text-[#B5179E] font-medium">{item.vendor_name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#6B4A62]">
                          <Warehouse className="w-3.5 h-3.5 text-[#E14DB0] shrink-0" />
                          <span>{item.warehouse}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${isLow ? 'text-amber-800' : 'text-[#3B0A33]'}`}>
                              {item.current_stock} units
                            </span>
                            {isLow ? (
                              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> In Stock
                              </span>
                            )}
                          </div>

                          {/* Visual Progress Bar in Plum / Magenta */}
                          <div className="w-full h-2 rounded-full bg-[#FDEFF6] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLow
                                  ? 'bg-amber-500'
                                  : 'bg-gradient-to-r from-[#B5179E] to-[#E14DB0]'
                              }`}
                              style={{ width: `${Math.max(ratio, 8)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-semibold text-[#6B4A62]">
                        ≤ {item.reorder_level} units
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => openRestockModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCE4F1] text-[#7A1259] hover:bg-[#B5179E] hover:text-white border border-[#F6D3E6] text-xs font-semibold transition-all duration-200 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Restock / Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title="Adjust Inventory Stock"
        subtitle={selectedItem ? `SKU #${selectedItem.product_id} – ${selectedItem.product_name}` : ''}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
              Current Stock Level (Units) *
            </label>
            <input
              type="number"
              min="0"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
              Reorder Warning Threshold (Units) *
            </label>
            <input
              type="number"
              min="1"
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
              Warehouse Facility *
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
            >
              {WAREHOUSES.filter((w) => w !== 'All').map((w) => (
                <option key={w} value={w} className="bg-white text-[#3B0A33]">
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F6D3E6]">
            <button
              type="button"
              onClick={() => setIsRestockOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B4A62] hover:bg-[#FDEFF6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] shadow-sm transition-all"
            >
              Update Inventory
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

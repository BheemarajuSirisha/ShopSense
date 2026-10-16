import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Trash2, 
  Edit3, 
  Building,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { productsApi, vendorsApi } from '../api';
import { formatINR } from '../utils/formatters';

const CATEGORIES = [
  'All',
  'Jewelry & Luxury',
  'Accessories',
  'Gourmet & Beverage',
  'Home & Living',
  'Fashion & Apparel',
  'Beauty & Wellness',
  'Consumer Electronics',
  'Fragrance & Care',
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'Jewelry & Luxury',
    price: '',
    stock: '',
    vendor_id: '',
    warehouse: 'Central Warehouse',
    reorder_level: 15,
  });

  // Delete confirmation modal state
  const [deleteProductItem, setDeleteProductItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const [productsData, vendorsData] = await Promise.all([
        productsApi.getAll(params),
        vendorsApi.getAll(),
      ]);

      setProducts(productsData || []);
      setVendors(vendorsData || []);
    } catch (err) {
      console.error('Failed to load products or vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Jewelry & Luxury',
      price: '',
      stock: '',
      vendor_id: vendors.length > 0 ? vendors[0].vendor_id : '',
      warehouse: 'Central Warehouse',
      reorder_level: 15,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      vendor_id: product.vendor_id,
      warehouse: product.warehouse || 'Central Warehouse',
      reorder_level: product.reorder_level || 15,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      toast.error('Product title is required');
      return;
    }
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Price must be a positive number');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }
    if (!formData.vendor_id) {
      toast.error('Please select an active vendor');
      return;
    }

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.product_id, {
          product_name: formData.product_name.trim(),
          category: formData.category,
          price: priceNum,
          stock: stockNum,
        });
        toast.success(`Product "${formData.product_name}" updated!`);
      } else {
        await productsApi.create({
          product_name: formData.product_name.trim(),
          category: formData.category,
          price: priceNum,
          stock: stockNum,
          vendor_id: parseInt(formData.vendor_id, 10),
          warehouse: formData.warehouse,
          reorder_level: parseInt(formData.reorder_level, 10) || 15,
        });
        toast.success(`Product "${formData.product_name}" created & inventory initialized!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      // Handled via toast
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductItem) return;
    try {
      await productsApi.delete(deleteProductItem.product_id);
      toast.success(`Product "${deleteProductItem.product_name}" deleted.`);
      setDeleteProductItem(null);
      fetchData();
    } catch {
      // Handled via toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
            Marketplace Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4A62] mt-1 font-medium">
            Manage SKU listings, unit prices, category taxonomy, and vendor links.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="plum-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A98AA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, category, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all text-[#3B0A33] placeholder:text-[#A98AA0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white text-[#3B0A33]">
                Category: {c}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#FDEFF6] p-1 rounded-xl border border-[#F6D3E6]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-[#B5179E] text-white shadow-xs' : 'text-[#6B4A62] hover:text-[#3B0A33]'
              }`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-[#B5179E] text-white shadow-xs' : 'text-[#6B4A62] hover:text-[#3B0A33]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Products"
            className="p-2 rounded-xl border border-[#F6D3E6] text-[#B5179E] hover:bg-[#FDEFF6] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content: Table or Grid */}
      {loading ? (
        <div className="plum-card p-6 bg-white rounded-2xl border border-[#F6D3E6]">
          <TableSkeleton rows={6} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="No products match your current search or category filter."
          actionText="Add Product"
          onAction={openAddModal}
        />
      ) : viewMode === 'table' ? (
        <div className="plum-card overflow-hidden bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FDEFF6] border-b border-[#F6D3E6] text-[#A98AA0] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Product Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Vendor Partner</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60">
                {products.map((p) => {
                  const isLow = p.stock <= (p.reorder_level || 15);
                  return (
                    <tr key={p.product_id} className="hover:bg-[#FDEFF6]/40 transition-colors group">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-[#3B0A33] group-hover:text-[#B5179E] transition-colors">
                          {p.product_name}
                        </div>
                        <div className="text-[11px] text-[#A98AA0]">
                          SKU #{p.product_id.toString().padStart(5, '0')} • {p.warehouse || 'Central'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="category" size="sm">
                          {p.category}
                        </Badge>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs text-[#6B4A62] font-medium flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#E14DB0]" />
                          <span>{p.vendor_name || `Vendor #${p.vendor_id}`}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-[#B5179E] text-sm">
                        {formatINR(p.price)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block font-semibold text-xs ${isLow ? 'text-amber-700 font-bold' : 'text-[#3B0A33]'}`}>
                            {p.stock} units
                          </span>
                          {isLow && (
                            <Badge status="low stock" size="sm">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-[#6B4A62] hover:text-[#B5179E] hover:bg-[#FDEFF6] transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteProductItem(p)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const isLow = p.stock <= (p.reorder_level || 15);
            return (
              <div
                key={p.product_id}
                className="plum-card p-5 flex flex-col justify-between bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)] hover:shadow-[0_14px_30px_rgba(181,23,158,0.14)] hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="category" size="sm">
                      {p.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1 text-[#A98AA0] hover:text-[#B5179E]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteProductItem(p)}
                        className="p-1 text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-[#3B0A33] mb-1 line-clamp-2">
                    {p.product_name}
                  </h3>
                  <p className="text-xs text-[#A98AA0] flex items-center gap-1 mb-3">
                    <Building className="w-3 h-3 text-[#E14DB0]" />
                    <span>{p.vendor_name || `Vendor #${p.vendor_id}`}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F6D3E6]/60 flex items-center justify-between">
                  <span className="text-base font-bold text-[#B5179E]">
                    {formatINR(p.price)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#6B4A62] font-semibold">{p.stock} units</span>
                    {isLow && <Badge status="low stock" size="sm">Low</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
        subtitle="Configure SKU pricing, category, and initial stock balance."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g., Artisan Ceramic Espresso Cup"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} className="bg-white text-[#3B0A33]">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Vendor *</label>
              <select
                disabled={!!editingProduct}
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 disabled:opacity-60"
              >
                {vendors.map(v => (
                  <option key={v.vendor_id} value={v.vendor_id} className="bg-white text-[#3B0A33]">
                    {v.business_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2499.00"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Stock Units *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F6D3E6]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B4A62] hover:bg-[#FDEFF6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] shadow-sm transition-all duration-200"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteProductItem}
        onClose={() => setDeleteProductItem(null)}
        title="Delete Product SKU"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6B4A62] leading-relaxed">
            Are you sure you want to delete <strong>"{deleteProductItem?.product_name}"</strong>?
            This will cascade and remove its warehouse inventory record permanently.
          </p>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F6D3E6]">
            <button
              type="button"
              onClick={() => setDeleteProductItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B4A62] hover:bg-[#FDEFF6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

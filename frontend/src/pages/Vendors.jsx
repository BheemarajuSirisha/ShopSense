import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  Store,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { vendorsApi } from '../api';

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

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Register Vendor Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    category: 'Jewelry & Luxury',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus.toLowerCase();

      const data = await vendorsApi.getAll(params);
      setVendors(data || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  // Client-side live validation
  const validateField = (name, value) => {
    let error = '';
    const v = (value || '').trim();

    if (name === 'business_name') {
      if (!v) error = 'Business name is required';
      else if (v.length < 2) error = 'Minimum 2 characters required';
    } else if (name === 'owner_name') {
      if (!v) error = 'Owner name is required';
      else if (v.length < 2) error = 'Minimum 2 characters required';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!v) error = 'Email is required';
      else if (!emailRegex.test(v)) error = 'Invalid email address format';
    } else if (name === 'phone') {
      const digits = v.replace(/\D/g, '');
      if (!v) error = 'Phone number is required';
      else if (digits.length < 7 || digits.length > 15) error = 'Must contain 7 to 15 digits';
    } else if (name === 'category') {
      if (!v) error = 'Category is required';
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const keys = ['business_name', 'owner_name', 'email', 'phone', 'category'];
    let allValid = true;
    keys.forEach((key) => {
      const isValid = validateField(key, formData[key]);
      if (!isValid) allValid = false;
    });

    if (!allValid) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await vendorsApi.create(formData);
      toast.success(`Vendor "${formData.business_name}" registered successfully!`);
      setIsRegisterOpen(false);
      setFormData({
        business_name: '',
        owner_name: '',
        email: '',
        phone: '',
        category: 'Jewelry & Luxury',
        status: 'active',
      });
      setFormErrors({});
      fetchVendors();
    } catch {
      // Handled via toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (vendorId, businessName, newStatus) => {
    try {
      await vendorsApi.updateStatus(vendorId, newStatus);
      toast.success(`Vendor "${businessName}" status set to ${newStatus}.`);
      setVendors((prev) =>
        prev.map((v) => (v.vendor_id === vendorId ? { ...v, status: newStatus } : v))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B0A33] tracking-tight">
            Registered Marketplace Vendors
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4A62] mt-1 font-medium">
            Manage merchant profiles, product authorizations, and review status.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="plum-card p-4 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A98AA0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by business name, owner, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 focus:border-[#B5179E] transition-all text-[#3B0A33] placeholder:text-[#A98AA0]"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
          >
            <option value="All" className="bg-white text-[#3B0A33]">Status: All</option>
            <option value="Active" className="bg-white text-[#3B0A33]">Active</option>
            <option value="Pending" className="bg-white text-[#3B0A33]">Pending</option>
            <option value="Suspended" className="bg-white text-[#3B0A33]">Suspended</option>
          </select>

          <button
            onClick={fetchVendors}
            title="Refresh Vendors"
            className="p-2 rounded-xl border border-[#F6D3E6] text-[#B5179E] hover:bg-[#FDEFF6] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="plum-card overflow-hidden bg-white rounded-2xl border border-[#F6D3E6] shadow-[0_8px_24px_rgba(181,23,158,0.08)]">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            title="No vendors found"
            description="No vendors match the specified search or filter criteria."
            actionText="Register New Vendor"
            onAction={() => setIsRegisterOpen(true)}
            icon={Store}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FDEFF6] border-b border-[#F6D3E6] text-[#A98AA0] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Merchant & Contact</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Catalog / Sales</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6D3E6]/60">
                {vendors.map((v) => (
                  <tr
                    key={v.vendor_id}
                    className="hover:bg-[#FDEFF6]/40 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B5179E] to-[#7A1259] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {v.business_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#3B0A33] text-sm truncate">
                            {v.business_name}
                          </div>
                          <div className="text-[11px] text-[#A98AA0] flex items-center gap-2 mt-0.5">
                            <span>Owner: {v.owner_name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#6B4A62] mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#B5179E]" />
                              {v.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#E14DB0]" />
                              {v.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant="category" size="sm">
                        {v.category}
                      </Badge>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-[#3B0A33]">
                        {v.products_count ?? v.product_count ?? 5} SKUs listed
                      </div>
                      <div className="text-[11px] text-[#A98AA0]">
                        Member since {new Date(v.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge status={v.status} size="sm">
                        {v.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        {v.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(v.vendor_id, v.business_name, 'active')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                            title="Approve & Activate Vendor"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </button>
                        )}

                        {v.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(v.vendor_id, v.business_name, 'suspended')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                            title="Suspend Vendor"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Vendor Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Vendor"
        subtitle="Live schema validation will check for unique email and contact specifications."
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
              Business / Store Name *
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleInputChange}
              placeholder="e.g., Crown Jewels & Silks"
              className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border ${
                formErrors.business_name ? 'border-red-400 bg-red-50' : 'border-[#F6D3E6]'
              } focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33] placeholder-[#A98AA0]`}
            />
            {formErrors.business_name && (
              <p className="text-[11px] text-red-500 mt-0.5">{formErrors.business_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
              Owner Full Name *
            </label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleInputChange}
              placeholder="e.g., Katherine Wright"
              className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border ${
                formErrors.owner_name ? 'border-red-400 bg-red-50' : 'border-[#F6D3E6]'
              } focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33] placeholder-[#A98AA0]`}
            />
            {formErrors.owner_name && (
              <p className="text-[11px] text-red-500 mt-0.5">{formErrors.owner_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="partner@domain.com"
                className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border ${
                  formErrors.email ? 'border-red-400 bg-red-50' : 'border-[#F6D3E6]'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33] placeholder-[#A98AA0]`}
              />
              {formErrors.email && (
                <p className="text-[11px] text-red-500 mt-0.5">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border ${
                  formErrors.phone ? 'border-red-400 bg-red-50' : 'border-[#F6D3E6]'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20 text-[#3B0A33] placeholder-[#A98AA0]`}
              />
              {formErrors.phone && (
                <p className="text-[11px] text-red-500 mt-0.5">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-white text-[#3B0A33]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A98AA0] mb-1">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-[#FDEFF6]/40 border border-[#F6D3E6] text-[#3B0A33] focus:outline-none focus:ring-2 focus:ring-[#B5179E]/20"
              >
                <option value="active" className="bg-white text-[#3B0A33]">Active (Immediate)</option>
                <option value="pending" className="bg-white text-[#3B0A33]">Pending Approval</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F6D3E6]">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B4A62] hover:bg-[#FDEFF6] border border-transparent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#B5179E] via-[#E14DB0] to-[#7A1259] text-white hover:shadow-[0_4px_16px_rgba(181,23,158,0.35)] shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

import apiClient from './axios';

export const vendorsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/vendors', { params });
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/vendors/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/vendors', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/vendors/${id}`, data);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/vendors/${id}/status`, { status });
    return res.data;
  },
};

export const productsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/products', { params });
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/products', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
};

export const inventoryApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/inventory', { params });
    return res.data || [];
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/inventory/${id}`, data);
    return res.data;
  },
};

export const analyticsApi = {
  getRevenue: async () => {
    const res = await apiClient.get('/analytics/revenue');
    return res.data || {};
  },
  getVendorRevenue: async () => {
    const res = await apiClient.get('/analytics/vendor-revenue');
    return res.data || [];
  },
  getProductRevenue: async (params = {}) => {
    const res = await apiClient.get('/analytics/product-revenue', { params });
    return res.data || [];
  },
  getTopProducts: async (params = {}) => {
    const res = await apiClient.get('/analytics/top-product', { params });
    return res.data || [];
  },
  getMonthlyTrend: async () => {
    const res = await apiClient.get('/analytics/monthly-trend');
    return res.data || [];
  },
  getCategoryRevenue: async () => {
    const res = await apiClient.get('/analytics/category-revenue');
    return res.data || [];
  },
  getRecentActivity: async (limit = 8) => {
    const res = await apiClient.get('/analytics/recent-activity', { params: { limit } });
    return res.data || [];
  },
  getSalesOverview: async (period = '6m') => {
    const res = await apiClient.get('/analytics/sales-overview', { params: { period } });
    return res.data || [];
  },
};

export const transactionsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/transactions', { params });
    const items = Array.isArray(res.data) ? res.data : [];
    const total = parseInt(res.headers['x-total-count'] || items.length, 10);
    const pages = parseInt(res.headers['x-total-pages'] || Math.max(1, Math.ceil(total / (params.limit || 10))), 10);
    return { items, total, pages, data: items };
  },
  getRecent: async (limit = 8) => {
    const res = await apiClient.get('/transactions/recent', { params: { limit } });
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/transactions', data);
    return res.data;
  },
};

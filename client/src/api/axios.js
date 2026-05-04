import axios from 'axios';

// Ensure the application can point to the backend 
// (Vite proxies /api to port 5000 in dev; in production this points to root domain)
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject JWT for admin routes
apiClient.interceptors.request.use((config) => {
  if (config.url.startsWith('/admin')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses to catch 401s and broadcast event
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Public
  getBusinessStatus: async () => (await apiClient.get('/business-status')).data,
  getCategories: async () => (await apiClient.get('/categories')).data,
  getProducts: async () => (await apiClient.get(`/products?t=${Date.now()}`)).data,
  getProductDetails: async (id) => (await apiClient.get(`/products/${id}`)).data,
  submitOrder: async (payload) => (await apiClient.post('/orders', payload)).data,
  trackOrder: async (orderNumber) => (await apiClient.get(`/orders/track/${orderNumber}`)).data,

  // Admin Auth
  adminLogin: async (credentials) => (await apiClient.post('/auth/login', credentials)).data,

  // Admin Protected
  getAdminSettings: async () => (await apiClient.get('/admin/settings')).data,
  getAdminStats: async () => (await apiClient.get('/admin/stats')).data,
  updateAdminSettings: async (mode) => (await apiClient.patch('/admin/settings/manual-override', { mode })).data,
  updateMenuMode: async (menu_mode) => (await apiClient.patch('/admin/settings/menu-mode', { menu_mode })).data,
  updateHeroSettings: async (formData) => (await apiClient.patch('/admin/settings/hero', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  getAdminOrders: async () => (await apiClient.get('/admin/orders')).data,
  updateOrderStatus: async (id, status) => (await apiClient.patch(`/admin/orders/${id}/status`, { status })).data,

  // Admin Products
  getAdminProducts: async () => (await apiClient.get(`/admin/products?t=${Date.now()}`)).data,
  createProduct: async (formData) => (await apiClient.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  updateProduct: async (id, formData) => (await apiClient.put(`/admin/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  toggleProductAvailability: async (id, is_available) => (await apiClient.patch(`/admin/products/${id}/toggle`, { is_available })).data,
  toggleProductRecommendation: async (id, is_recommended) => (await apiClient.patch(`/admin/products/${id}/recommend`, { is_recommended })).data,
  softDeleteProduct: async (id) => (await apiClient.delete(`/admin/products/${id}`)).data,

  // Admin Categories
  getAdminCategories: async () => (await apiClient.get('/admin/categories')).data,
  createCategory: async (data) => (await apiClient.post('/admin/categories', data)).data,
  updateCategory: async (id, data) => (await apiClient.put(`/admin/categories/${id}`, data)).data,
  softDeleteCategory: async (id) => (await apiClient.delete(`/admin/categories/${id}`)).data,

  // Admin Option Groups
  getAdminOptionGroups: async () => (await apiClient.get('/admin/option-groups')).data,
  createOptionGroup: async (data) => (await apiClient.post('/admin/option-groups', data)).data,
  updateOptionGroup: async (id, data) => (await apiClient.put(`/admin/option-groups/${id}`, data)).data,
  softDeleteOptionGroup: async (id) => (await apiClient.delete(`/admin/option-groups/${id}`)).data,

  // Admin Option Items
  getAdminOptionItems: async () => (await apiClient.get('/admin/option-items')).data,
  createOptionItem: async (data) => (await apiClient.post('/admin/option-items', data)).data,
  updateOptionItem: async (id, data) => (await apiClient.put(`/admin/option-items/${id}`, data)).data,
  softDeleteOptionItem: async (id) => (await apiClient.delete(`/admin/option-items/${id}`)).data
};

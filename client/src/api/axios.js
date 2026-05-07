import axios from 'axios';

// Get dynamic base URL for local network testing
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:5000`;
  return 'http://localhost:5000';
};

// Create a clean axios instance using the environment variable
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject JWT for admin routes
api.interceptors.request.use((config) => {
  // Check if the URL belongs to admin paths (which require auth)
  if (config.url.includes('/admin')) {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses to catch 401s and broadcast event
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;

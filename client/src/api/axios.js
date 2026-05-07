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
});

// Intercept requests to inject JWT and set correct Content-Type
api.interceptors.request.use((config) => {
  // Let the browser set Content-Type automatically for FormData (multipart/form-data with boundary)
  // For all other requests, default to application/json
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

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

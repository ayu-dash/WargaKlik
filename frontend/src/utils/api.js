import axios from 'axios';
import Cookies from 'js-cookie';

const isNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';

const api = axios.create({
  baseURL: isNgrok 
    ? process.env.NEXT_PUBLIC_NGROK_API_URL 
    : process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    ...(isNgrok && { 'ngrok-skip-browser-warning': 'true' })
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh / 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken });
        
        if (res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          
          Cookies.set('token', accessToken, { expires: 1/24 }); // 1 hour
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 }); // 7 days
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        // If refresh fails, clear cookies and redirect to login
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    
    // Return standard error format
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server';
    const validationErrors = error.response?.data?.errors || null;
    
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.validationErrors = validationErrors;
    enhancedError.originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

export default api;

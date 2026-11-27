import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Auto-attach Bearer token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: Extract data from backend TransformInterceptor envelope
apiClient.interceptors.response.use(
  (response) => {
    // If backend envelope exists ({ success: true, data: ... }), return data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      document.cookie = 'accessToken=; path=/; max-age=0';
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

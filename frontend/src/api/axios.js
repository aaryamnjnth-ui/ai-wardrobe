import axios from 'axios';

// Base API configuration pointing to http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // We can add auth token or custom headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message || 
                    'An unexpected error occurred';
    
    // Attach user-friendly error
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default apiClient;

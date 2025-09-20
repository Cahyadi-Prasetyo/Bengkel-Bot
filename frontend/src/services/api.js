import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (profileData) => api.put('/api/user/profile', profileData),
};

export const diagnosisAPI = {
  getSymptoms: (language = 'id') => api.get(`/api/symptoms?language=${language}`),
  createDiagnosis: (diagnosisData) => api.post('/api/diagnosis', diagnosisData),
  getHistory: (limit = 10, skip = 0) => api.get(`/api/diagnosis/history?limit=${limit}&skip=${skip}`),
};

export const sparepartsAPI = {
  search: (query, currency = 'IDR') => api.get(`/api/spare-parts/search?query=${query}&currency=${currency}`),
};

export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

// API isteklerini izlemek için debug log ekleyelim
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API İsteği:', config.method?.toUpperCase(), config.url);
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Yanıtı:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    toast.error(`Bir hata oluştu: ${errorMessage}`);
    
    const originalRequest = error.config;

    // Token yenileme işlemi
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { token } = response.data;

        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, API_BASE_URL, SOCKET_URL };

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const matchService = {
  getMatches: async (params?: any) => {
    const response = await api.get('/matches', { params });
    return response.data;
  },
  getMatchById: async (id: string) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
  getLiveMatches: async () => {
    const response = await api.get('/matches/live');
    return response.data;
  },
};

export const teamService = {
  getTeams: async (params?: any) => {
    const response = await api.get('/teams', { params });
    return response.data;
  },
  getTeamById: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
  getTeamStats: async (id: string) => {
    const response = await api.get(`/teams/${id}/stats`);
    return response.data;
  },
};

export const newsService = {
  getNews: async (params?: any) => {
    const response = await api.get('/news', { params });
    return response.data;
  },
  getNewsById: async (id: string) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
  getNewsByCategory: async (category: string) => {
    const response = await api.get(`/news/category/${category}`);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  getFavorites: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },
  addFavorite: async (type: string, id: string) => {
    const response = await api.post('/users/favorites', { type, id });
    return response.data;
  },
  removeFavorite: async (type: string, id: string) => {
    const response = await api.delete(`/users/favorites/${type}/${id}`);
    return response.data;
  },
}; 
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
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || error.message;

    // Rate limit hatası için yeniden deneme
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryDelay = error.response.headers['retry-after'] || 1000;
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return api(originalRequest);
    }

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

    // Hata mesajını göster
    if (errorMessage) {
      toast.error(`Bir hata oluştu: ${errorMessage}`);
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
    try {
      const response = await api.get('/matches', { params });
      return response.data;
    } catch (error) {
      return [];
    }
  },
  getMatchById: async (id: string) => {
    try {
      const response = await api.get(`/matches/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  getLiveMatches: async () => {
    try {
      const response = await api.get('/matches/live');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export const teamService = {
  getTeams: async (params?: any) => {
    try {
      const response = await api.get('/teams', { params });
      return response.data;
    } catch (error) {
      return [];
    }
  },
  getTeamById: async (id: string) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  getTeamStats: async (id: string) => {
    try {
      const response = await api.get(`/teams/${id}/stats`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
};

export const newsService = {
  getNews: async (params?: any) => {
    try {
      const response = await api.get('/news', { params });
      return response.data;
    } catch (error) {
      return [];
    }
  },
  getNewsById: async (id: string) => {
    try {
      const response = await api.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  getNewsByCategory: async (category: string) => {
    try {
      const response = await api.get(`/news/category/${category}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  addFavorite: async (type: string, id: string) => {
    try {
      const response = await api.post('/users/favorites', { type, id });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  removeFavorite: async (type: string, id: string) => {
    try {
      const response = await api.delete(`/users/favorites/${type}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 
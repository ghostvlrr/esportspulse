import axios from 'axios';

const BASE_URL = 'https://vlrggapi.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// İstek interceptor'ı
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Sunucu yanıt verdi ama hata kodu döndü
      console.error('API Hatası:', error.response.status, error.response.data);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Bağlantı Hatası:', error.request);
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('İstek Hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getUpcomingMatches = async () => {
  try {
    const response = await api.get('/match?q=upcoming');
    return response.data?.data?.segments || [];
  } catch (error) {
    console.error('Yaklaşan maçlar alınırken hata:', error);
    return [];
  }
};

export const getLiveMatches = async () => {
  try {
    const response = await api.get('/match?q=live');
    return response.data?.data?.segments || [];
  } catch (error) {
    console.error('Canlı maçlar alınırken hata:', error);
    return [];
  }
};

export const getCompletedMatches = async () => {
  try {
    const response = await api.get('/match?q=results');
    return response.data?.data?.segments || [];
  } catch (error) {
    console.error('Tamamlanan maçlar alınırken hata:', error);
    return [];
  }
};

export const getMatchDetails = async (id: string) => {
  try {
    const response = await api.get(`/match/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error('Maç detayları alınırken hata:', error);
    return null;
  }
};

export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data?.data || [];
  } catch (error) {
    console.error('Takımlar alınırken hata:', error);
    return [];
  }
};

export const getTeamDetails = async (id: string) => {
  try {
    const response = await api.get(`/team/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error('Takım detayları alınırken hata:', error);
    return null;
  }
};

export const getNews = async () => {
  try {
    const response = await api.get('/news');
    return response.data?.data?.segments || [];
  } catch (error) {
    console.error('Haberler alınırken hata:', error);
    return [];
  }
};

export const getNewsDetails = async (id: string) => {
  try {
    const response = await api.get(`/news/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error('Haber detayları alınırken hata:', error);
    return null;
  }
};

export default api; 
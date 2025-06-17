import AsyncStorage from '@react-native-async-storage/async-storage';
import { VLR_API_BASE, ENDPOINTS } from '@/constants/ApiConfig';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = VLR_API_BASE;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 dakika

interface ApiResponse<T> {
  data: T;
  error?: string;
  isFromCache?: boolean;
}

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json();
      return { data: null as T, error: error.message || 'Bir hata oluştu' };
    }
    const data = await response.json();
    return { data };
  }

  private async checkCache<T>(endpoint: string): Promise<ApiResponse<T> | null> {
    try {
      const cachedData = await AsyncStorage.getItem(`cache_${endpoint}`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return { data, isFromCache: true };
        }
      }
    } catch (error) {
      console.error('Önbellek kontrolü sırasında hata:', error);
    }
    return null;
  }

  private async saveToCache<T>(endpoint: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `cache_${endpoint}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Önbelleğe kaydetme sırasında hata:', error);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const networkState = await NetInfo.fetch();
      
      if (!networkState.isConnected) {
        const cachedData = await this.checkCache<T>(endpoint);
        if (cachedData) {
          return cachedData;
        }
        return { data: null as T, error: 'İnternet bağlantısı yok' };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: await this.getHeaders(),
      });
      
      const result = await this.handleResponse<T>(response);
      
      if (!result.error) {
        await this.saveToCache(endpoint, result.data);
      }
      
      return result;
    } catch (error) {
      const cachedData = await this.checkCache<T>(endpoint);
      if (cachedData) {
        return cachedData;
      }
      return { data: null as T, error: 'Bağlantı hatası' };
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { data: null as T, error: 'Bağlantı hatası' };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { data: null as T, error: 'Bağlantı hatası' };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { data: null as T, error: 'Bağlantı hatası' };
    }
  }
}

export const apiService = new ApiService(); 
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://vlrggapi.vercel.app';

interface ApiResponse<T> {
  data: T;
  error?: string;
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

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: await this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
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
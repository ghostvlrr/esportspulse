import { Match } from '../types/match';

export class MatchService {
  private readonly baseUrl = 'http://localhost:3001/api';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 saniye

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          credentials: 'include'
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
        }
      }
    }

    throw lastError || new Error('Maksimum deneme sayısına ulaşıldı');
  }

  async getMatches(params?: { status?: string; date?: string }): Promise<Match[]> {
    try {
      let url = `${this.baseUrl}/matches`;
      if (params) {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.date) query.append('date', params.date);
        if (Array.from(query).length > 0) {
          url += `?${query.toString()}`;
        }
      }
      const response = await this.fetchWithRetry(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Maçlar alınırken hata:', error);
      return []; // Hata durumunda boş dizi döndür
    }
  }

  async getMatchById(id: string): Promise<Match | null> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/matches/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Maç detayı alınırken hata:', error);
      return null; // Hata durumunda null döndür
    }
  }
} 
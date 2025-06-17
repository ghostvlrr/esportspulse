import { api } from './api';
import { Match } from '../store/slices/matchesSlice';

interface MatchFilters {
  status?: 'live' | 'upcoming' | 'completed';
  date?: string;
}

class MatchService {
  async getMatches(filters?: MatchFilters): Promise<Match[]> {
    try {
      const response = await api.get('/api/matches', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Maçlar yüklenirken hata oluştu:', error);
      throw error;
    }
  }

  async getLiveMatches(): Promise<Match[]> {
    try {
      const response = await api.get('/api/matches/live');
      return response.data;
    } catch (error) {
      console.error('Canlı maçlar yüklenirken hata oluştu:', error);
      throw error;
    }
  }

  async getMatchById(id: string): Promise<Match> {
    try {
      const response = await api.get(`/api/matches/${id}`);
      return response.data;
    } catch (error) {
      console.error('Maç detayları yüklenirken hata oluştu:', error);
      throw error;
    }
  }

  async getMatchesByDate(date: string): Promise<Match[]> {
    try {
      const response = await api.get('/api/matches', {
        params: { date, status: 'completed' }
      });
      return response.data;
    } catch (error) {
      console.error('Tarihe göre maçlar yüklenirken hata oluştu:', error);
      throw error;
    }
  }
}

export default new MatchService(); 
import { api } from './api';
import type { Team } from '../types/team';

export const getTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    console.error('Takımlar alınırken hata:', error);
    return [];
  }
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Takım detayları alınırken hata:', error);
    return null;
  }
};

export const getTeamStats = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/teams/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Takım istatistikleri alınırken hata:', error);
    return null;
  }
}; 
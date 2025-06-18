import { useCallback } from 'react';
import { MatchService } from '../services/matchService';

const matchService = new MatchService();

export const useMatchService = () => {
  const getMatches = useCallback(async () => {
    try {
      const response = await matchService.getMatches();
      return response;
    } catch (error) {
      console.error('Maçlar alınırken hata:', error);
      throw error;
    }
  }, []);

  const getMatchById = useCallback(async (id: string) => {
    try {
      const response = await matchService.getMatchById(id);
      return response;
    } catch (error) {
      console.error('Maç detayı alınırken hata:', error);
      throw error;
    }
  }, []);

  return {
    getMatches,
    getMatchById,
  };
};

export default useMatchService; 
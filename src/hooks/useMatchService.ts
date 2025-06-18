import { useCallback, useState } from 'react';
import { MatchService } from '../services/matchService';

const matchService = new MatchService();

const useMatchService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchService.getMatches();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchService.getMatchById(id);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getMatches,
    getMatchById,
    loading,
    error
  };
};

export default useMatchService; 
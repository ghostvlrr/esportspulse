import axios from 'axios';

const BASE_URL = 'https://vlrggapi.vercel.app';

export interface Match {
  id: string;
  team1: {
    name: string;
    score: number;
  };
  team2: {
    name: string;
    score: number;
  };
  status: string;
  time: string;
  event: string;
  series: string;
}

export interface Team {
  id: string;
  name: string;
  country: string;
  ranking: number;
}

export const apiService = {
  // Canlı maçları getir
  getLiveMatches: async (): Promise<Match[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/matches/live`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Yaklaşan maçları getir
  getUpcomingMatches: async (): Promise<Match[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/matches/upcoming`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Tamamlanan maçları getir
  getCompletedMatches: async (): Promise<Match[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/matches/completed`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Takım detaylarını getir
  getTeamDetails: async (teamId: string): Promise<Team | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/team/${teamId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Maç detaylarını getir
  getMatchDetails: async (matchId: string): Promise<Match | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/match/${matchId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}; 
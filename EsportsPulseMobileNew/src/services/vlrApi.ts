import axios from 'axios';

const BASE_URL = 'https://vlrggapi.vercel.app';

export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'completed';
  startTime?: string;
  time?: string;
  tournament: string;
}

export interface Team {
  id: string;
  name: string;
  country?: string;
  ranking?: number;
}

export interface Player {
  id: string;
  name: string;
  country?: string;
  team?: string;
  role?: string;
}

export interface Tournament {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface MatchDetails extends Match {
  maps: {
    name: string;
    score1: number;
    score2: number;
  }[];
  players: {
    team1: {
      name: string;
      agent: string;
      kills: number;
      deaths: number;
      assists: number;
    }[];
    team2: {
      name: string;
      agent: string;
      kills: number;
      deaths: number;
      assists: number;
    }[];
  };
}

export const vlrApi = {
  // Canlı maçlar
  getLiveMatches: async (): Promise<Match[]> => (await axios.get(`${BASE_URL}/matches/live`)).data,
  // Yaklaşan maçlar
  getUpcomingMatches: async (): Promise<Match[]> => (await axios.get(`${BASE_URL}/matches/upcoming`)).data,
  // Tamamlanan maçlar
  getCompletedMatches: async (): Promise<Match[]> => (await axios.get(`${BASE_URL}/matches/completed`)).data,
  // Maç detayları
  getMatchDetails: async (matchId: string): Promise<MatchDetails> => (await axios.get(`${BASE_URL}/matches/${matchId}`)).data,
  // Takım detayları
  getTeamDetails: async (teamId: string): Promise<Team> => (await axios.get(`${BASE_URL}/teams/${teamId}`)).data,
  // Takımın maçları
  getTeamMatches: async (teamId: string): Promise<Match[]> => (await axios.get(`${BASE_URL}/teams/${teamId}/matches`)).data,
  // Oyuncu detayları
  getPlayerDetails: async (playerId: string): Promise<Player> => (await axios.get(`${BASE_URL}/players/${playerId}`)).data,
  // Turnuva detayları
  getTournamentDetails: async (tournamentId: string): Promise<Tournament> => (await axios.get(`${BASE_URL}/tournaments/${tournamentId}`)).data,
  // Turnuva maçları
  getTournamentMatches: async (tournamentId: string): Promise<Match[]> => (await axios.get(`${BASE_URL}/tournaments/${tournamentId}/matches`)).data,
}; 
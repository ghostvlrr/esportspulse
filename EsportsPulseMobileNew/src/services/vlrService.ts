import axios from 'axios';

const BASE_URL = 'https://vlrggapi.vercel.app';

export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: 'upcoming' | 'live' | 'completed';
  startTime: string;
  tournament: string;
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

export const getLiveMatches = async (): Promise<Match[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/matches/live`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/matches/upcoming`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getMatchDetails = async (matchId: string): Promise<MatchDetails | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/matches/${matchId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getTeamMatches = async (teamId: string): Promise<Match[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/teams/${teamId}/matches`);
    return response.data;
  } catch (error) {
    return [];
  }
}; 
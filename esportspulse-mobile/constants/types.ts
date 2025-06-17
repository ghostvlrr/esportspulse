// Valorant API tipleri
export interface Team {
  id: string;
  name: string;
  country: string;
  players: Player[];
  stats: {
    wins: number;
    losses: number;
    winRate: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  teams: Team[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: 'live' | 'upcoming' | 'completed';
  tournament: string;
  startTime: string;
  endTime?: string;
}

export interface Map {
  name: string;
  score1: number;
  score2: number;
}

export interface MatchDetails extends Match {
  map: string;
  rounds: {
    number: number;
    winner: string;
    score1: number;
    score2: number;
  }[];
  players: {
    team1: Player[];
    team2: Player[];
  };
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  country: string;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    kd: number;
  };
}

export interface ApiResponse<T> {
  data: {
    status: number;
    segments: T[];
  };
  error?: string;
} 
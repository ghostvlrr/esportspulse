export interface Team {
  id: string;
  name: string;
  logo?: string;
  region?: string;
  ranking?: number;
  wins?: number;
  losses?: number;
  country?: string;
  players?: Player[];
  stats?: {
    wins: number;
    losses: number;
    winRate: number;
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
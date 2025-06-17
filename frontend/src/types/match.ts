export interface Team {
  name: string;
  logo: string;
}

export interface Score {
  home: number;
  away: number;
}

export interface Tournament {
  name: string;
  logo: string;
}

export interface Match {
  id: string;
  status: 'live' | 'upcoming' | 'completed';
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  date: string;
  tournament: Tournament;
} 
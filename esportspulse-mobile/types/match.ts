export interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: string;
  date: string;
  tournament: string;
  tournamentIcon?: string;
  matchPage?: string;
} 
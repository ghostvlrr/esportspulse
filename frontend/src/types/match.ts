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
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  team1_logo_url?: string;
  team2_logo_url?: string;
  score1?: string;
  score2?: string;
  time_completed?: string;
  time_until_match?: string;
  match_event?: string;
  match_series?: string;
  tournament_name?: string;
  round_info?: string;
  status?: string;
  match_page?: string;
  tournament_icon?: string;
  tournamentIcon?: string;
  date: Date;
  notifications: Required<NotificationSettings>;
  team1LogoPng?: string | null;
  team1LogoSvg?: string | null;
  team2LogoPng?: string | null;
  team2LogoSvg?: string | null;
  _rowIndex?: number;
  parsed_date?: string;
  matchDate?: Date | null;
}

export interface NotificationSettings {
  enabled: boolean;
  beforeMatch: number;
  matchStart: boolean;
  matchEnd: boolean;
  scoreUpdate: boolean;
} 
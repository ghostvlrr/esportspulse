export interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  team1LogoPng?: string;
  team1LogoSvg?: string;
  team2LogoPng?: string;
  team2LogoSvg?: string;
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
  date: Date;
  notifications: Required<NotificationSettings>;
  _rowIndex?: number;
  parsed_date?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  beforeMatch: number;
  matchStart: boolean;
  matchEnd: boolean;
  scoreUpdate: boolean;
} 
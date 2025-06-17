export const VLR_API_BASE = 'https://vlrggapi.vercel.app';

export const ENDPOINTS = {
  // Maçlar
  live: '/match?q=live_score',
  upcoming: '/match?q=upcoming',
  completed: '/match?q=results',
  matchDetails: (id: string) => `/match/${id}`,

  // Takımlar
  teams: '/team',
  team: (id: string) => `/team/${id}`,

  // Oyuncular
  players: '/player',
  player: (id: string) => `/player/${id}`,

  // Turnuvalar
  tournaments: '/event',
  tournament: (id: string) => `/event/${id}`,

  // Bildirimler
  notifications: '/notifications',
};
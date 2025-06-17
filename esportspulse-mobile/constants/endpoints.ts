export const ENDPOINTS = {
  // Maç endpoint'leri
  live: '/matches/live',
  upcoming: '/matches/upcoming',
  completed: '/matches/completed',
  matchDetails: (id: string) => `/match/${id}`,

  // Takım endpoint'leri
  teams: '/teams',
  team: (id: string) => `/team/${id}`,
  teamMatches: (id: string) => `/team/${id}/matches`,
  teamPlayers: (id: string) => `/team/${id}/players`,

  // Oyuncu endpoint'leri
  players: '/players',
  player: (id: string) => `/player/${id}`,
  playerMatches: (id: string) => `/player/${id}/matches`,

  // Turnuva endpoint'leri
  tournaments: '/tournaments',
  tournamentsOngoing: '/tournaments/ongoing',
  tournamentsUpcoming: '/tournaments/upcoming',
  tournamentsCompleted: '/tournaments/completed',
  tournament: (id: string) => `/tournament/${id}`,
  tournamentMatches: (id: string) => `/tournament/${id}/matches`,
  tournamentTeams: (id: string) => `/tournament/${id}/teams`,
}; 
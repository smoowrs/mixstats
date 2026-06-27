export interface Player {
  id: string;
  name: string;
  steamId?: string;
  elo: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  winRate: number;
  kd: number;
  assists: number;
  mvp: number;
  avgAssist: number;
  avgMvp: number;
  avgKill?: number;
  avgDeath?: number;
}

export interface Match {
  id: string;
  date: string;
  teamA: string[]; // Player IDs
  teamB: string[]; // Player IDs
  scoreA: number;
  scoreB: number;
  eloChangeA: number;
  eloChangeB: number;
}

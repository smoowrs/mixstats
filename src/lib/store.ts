import { useState, useEffect } from 'react';
import { Player, Match, LeaderboardPlayer } from '../types';
import { calculateElo } from './elo';

const INITIAL_LEADERBOARD: LeaderboardPlayer[] = [
  { id: 'fabio', name: 'Fabio', games: 14, wins: 10, kills: 249, deaths: 202, winRate: 71.43, kd: 1.23, assists: 64, mvp: 40, avgAssist: 4.57, avgMvp: 2.86 },
  { id: 'goret', name: 'Goret', games: 3, wins: 2, kills: 55, deaths: 44, winRate: 66.67, kd: 1.25, assists: 12, mvp: 10, avgAssist: 4.0, avgMvp: 3.33 },
  { id: 'toshi', name: 'Toshi', games: 3, wins: 2, kills: 48, deaths: 47, winRate: 66.67, kd: 1.02, assists: 14, mvp: 8, avgAssist: 4.67, avgMvp: 2.67 },
  { id: 'eron', name: 'Eron', games: 3, wins: 2, kills: 35, deaths: 47, winRate: 66.67, kd: 0.74, assists: 15, mvp: 5, avgAssist: 5.0, avgMvp: 1.67 },
  { id: 'capi', name: 'Capi', games: 17, wins: 11, kills: 302, deaths: 231, winRate: 64.71, kd: 1.31, assists: 72, mvp: 44, avgAssist: 4.24, avgMvp: 2.59 },
  { id: 'lipe2k', name: 'Lipe2k', games: 15, wins: 9, kills: 325, deaths: 220, winRate: 60.0, kd: 1.48, assists: 93, mvp: 51, avgAssist: 6.2, avgMvp: 3.4 },
  { id: 'luizao', name: 'Luizao', games: 10, wins: 6, kills: 127, deaths: 152, winRate: 60.0, kd: 0.84, assists: 52, mvp: 23, avgAssist: 5.2, avgMvp: 2.3 },
  { id: 'mathouso', name: 'mathouso', games: 19, wins: 11, kills: 217, deaths: 286, winRate: 57.89, kd: 0.76, assists: 100, mvp: 20, avgAssist: 5.26, avgMvp: 1.05 },
  { id: 'ph', name: 'PH', games: 15, wins: 8, kills: 277, deaths: 242, winRate: 53.33, kd: 1.14, assists: 81, mvp: 42, avgAssist: 5.4, avgMvp: 2.8 },
  { id: 'pimenta', name: 'Pimenta', games: 12, wins: 6, kills: 130, deaths: 195, winRate: 50.0, kd: 0.67, assists: 71, mvp: 10, avgAssist: 5.92, avgMvp: 0.83 },
  { id: 'panda', name: 'Panda', games: 6, wins: 3, kills: 64, deaths: 84, winRate: 50.0, kd: 0.76, assists: 25, mvp: 11, avgAssist: 4.17, avgMvp: 1.83 },
  { id: 'berti', name: 'BERTI', games: 2, wins: 1, kills: 30, deaths: 33, winRate: 50.0, kd: 0.91, assists: 9, mvp: 6, avgAssist: 4.5, avgMvp: 3.0 },
  { id: 'rutt', name: 'Rutt', games: 2, wins: 1, kills: 18, deaths: 28, winRate: 50.0, kd: 0.64, assists: 5, mvp: 4, avgAssist: 2.5, avgMvp: 2.0 },
  { id: 'david', name: 'David', games: 15, wins: 7, kills: 173, deaths: 244, winRate: 46.67, kd: 0.71, assists: 78, mvp: 19, avgAssist: 5.2, avgMvp: 1.27 },
  { id: 'smoow', name: 'Smoow', games: 15, wins: 6, kills: 271, deaths: 239, winRate: 40.0, kd: 1.13, assists: 72, mvp: 32, avgAssist: 4.8, avgMvp: 2.13 },
  { id: 'pazzini', name: 'Pazzini', games: 6, wins: 2, kills: 99, deaths: 83, winRate: 33.33, kd: 1.19, assists: 27, mvp: 20, avgAssist: 4.5, avgMvp: 3.33 },
  { id: 'psy', name: 'PSY', games: 14, wins: 4, kills: 204, deaths: 224, winRate: 28.57, kd: 0.91, assists: 88, mvp: 29, avgAssist: 6.29, avgMvp: 2.07 },
  { id: 'malanga', name: 'Malanga', games: 8, wins: 2, kills: 100, deaths: 129, winRate: 25.0, kd: 0.78, assists: 46, mvp: 16, avgAssist: 5.75, avgMvp: 2.0 },
  { id: 'tense_bullet', name: 'Tense_Bullet', games: 11, wins: 2, kills: 153, deaths: 177, winRate: 18.18, kd: 0.86, assists: 36, mvp: 19, avgAssist: 3.27, avgMvp: 1.73 },
  { id: 'jota', name: 'Jota', games: 2, wins: 0, kills: 29, deaths: 34, winRate: 0.0, kd: 0.85, assists: 12, mvp: 3, avgAssist: 6.0, avgMvp: 1.5 },
  { id: 'hey', name: 'Hey', games: 2, wins: 0, kills: 28, deaths: 33, winRate: 0.0, kd: 0.85, assists: 13, mvp: 0, avgAssist: 6.5, avgMvp: 0.0 },
];

export function useAppStore() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(() => {
    try {
      const saved = localStorage.getItem('mixstats_leaderboard_v2');
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('mixstats_players');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem('mixstats_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mixstats_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('mixstats_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('mixstats_leaderboard_v2', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const addPlayer = (name: string, steamId?: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      steamId,
      elo: 1000, // Starting Elo
      wins: 0,
      losses: 0,
      matchesPlayed: 0
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const recordMatch = (teamAIds: string[], teamBIds: string[], scoreA: number, scoreB: number) => {
    const teamAPlayers = players.filter(p => teamAIds.includes(p.id));
    const teamBPlayers = players.filter(p => teamBIds.includes(p.id));

    const { ratingChangeA, ratingChangeB } = calculateElo(
      teamAPlayers.map(p => p.elo),
      teamBPlayers.map(p => p.elo),
      scoreA,
      scoreB
    );

    const newMatch: Match = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      teamA: teamAIds,
      teamB: teamBIds,
      scoreA,
      scoreB,
      eloChangeA: ratingChangeA,
      eloChangeB: ratingChangeB
    };

    setMatches(prev => [newMatch, ...prev]);

    setPlayers(prev => prev.map(player => {
      if (teamAIds.includes(player.id)) {
        return {
          ...player,
          elo: Math.max(0, player.elo + ratingChangeA),
          wins: scoreA > scoreB ? player.wins + 1 : player.wins,
          losses: scoreA < scoreB ? player.losses + 1 : player.losses,
          matchesPlayed: player.matchesPlayed + 1
        };
      }
      if (teamBIds.includes(player.id)) {
        return {
          ...player,
          elo: Math.max(0, player.elo + ratingChangeB),
          wins: scoreB > scoreA ? player.wins + 1 : player.wins,
          losses: scoreB < scoreA ? player.losses + 1 : player.losses,
          matchesPlayed: player.matchesPlayed + 1
        };
      }
      return player;
    }));
  };

  const updateLeaderboard = (newStats: Partial<LeaderboardPlayer>[]) => {
    setLeaderboard(prev => {
      const updated = [...prev];
      for (const stat of newStats) {
        if (!stat.name) continue;
        const index = updated.findIndex(p => p.name.toLowerCase() === stat.name!.toLowerCase());
        
        const games = stat.games || 0;
        const wins = stat.wins || 0;
        const kills = stat.kills || 0;
        const deaths = stat.deaths || 0;
        const assists = stat.assists || 0;
        const mvp = stat.mvp || 0;

        if (index >= 0) {
          // Update existing
          const p = updated[index];
          p.games += games;
          p.wins += wins;
          p.kills += kills;
          p.deaths += deaths;
          p.assists += assists;
          p.mvp += mvp;
          p.winRate = (p.wins / p.games) * 100;
          p.kd = p.deaths === 0 ? p.kills : p.kills / p.deaths;
          p.avgAssist = p.assists / p.games;
          p.avgMvp = p.mvp / p.games;
          p.avgKill = p.kills / p.games;
          p.avgDeath = p.deaths / p.games;
        } else {
          // Add new
          updated.push({
            id: crypto.randomUUID(),
            name: stat.name,
            games,
            wins,
            kills,
            deaths,
            assists,
            mvp,
            winRate: games > 0 ? (wins / games) * 100 : 0,
            kd: deaths === 0 ? kills : kills / deaths,
            avgAssist: games > 0 ? assists / games : 0,
            avgMvp: games > 0 ? mvp / games : 0,
            avgKill: games > 0 ? kills / games : 0,
            avgDeath: games > 0 ? deaths / games : 0,
          });
        }
      }
      
      // Sort by some criteria (e.g., K/D or wins)
      updated.sort((a, b) => b.winRate - a.winRate || b.kd - a.kd);
      return updated;
    });
  };

  const resetData = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
      setPlayers([]);
      setMatches([]);
      setLeaderboard([]);
    }
  }

  return {
    players,
    matches,
    leaderboard,
    addPlayer,
    deletePlayer,
    recordMatch,
    updateLeaderboard,
    resetData
  };
}

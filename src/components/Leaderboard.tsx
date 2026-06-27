import React from 'react';
import { Player } from '../types';
import { Users } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);

  if (players.length === 0) {
    return (
      <div className="gc-panel p-8 text-center text-gc-text-muted flex flex-col items-center">
        <Users className="w-8 h-8 mb-4 opacity-50" />
        <p className="font-display font-semibold uppercase tracking-wider text-sm">Nenhum jogador no seu mix</p>
        <p className="text-sm mt-2">Adicione jogadores para iniciar o ranking Elo.</p>
      </div>
    );
  }

  return (
    <div className="gc-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-[#0b1016] border-b border-gc-border text-xs font-display font-bold text-gc-text-muted tracking-wider uppercase">
              <th className="px-5 py-4 w-12 text-center">Pos</th>
              <th className="px-5 py-4">Jogador</th>
              <th className="px-5 py-4 text-center">Rating (Elo)</th>
              <th className="px-5 py-4 text-center">Jogos</th>
              <th className="px-5 py-4 text-center">Vitórias</th>
              <th className="px-5 py-4 text-center">Derrotas</th>
              <th className="px-5 py-4 text-center">% Win</th>
              <th className="px-5 py-4 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gc-border/50">
            {sortedPlayers.map((player, index) => {
              const winRate = player.matchesPlayed > 0 
                ? (player.wins / player.matchesPlayed) * 100 
                : 0;

              // Mock form for Elo display purposes
              const formString = Array.from({ length: 5 }).map((_, i) => {
                if (player.matchesPlayed < i + 1) return '.';
                return (player.wins > player.losses && i % 2 === 0) || (player.wins > 0 && i < 3) ? '+' : '-';
              }).join('');

              return (
                <tr key={player.id} className="hover:bg-gc-panel-hover transition-colors group">
                  <td className="px-5 py-4 text-center">
                    <span className={`font-display font-black text-lg ${
                      index === 0 ? 'text-gc-yellow' :
                      index === 1 ? 'text-zinc-300' :
                      index === 2 ? 'text-orange-400' : 'text-gc-text-muted'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <span className="font-semibold text-white group-hover:text-gc-green transition-colors">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-display font-black text-gc-yellow text-lg">
                    {player.elo}
                  </td>
                  <td className="px-5 py-4 text-center font-medium text-white">{player.matchesPlayed}</td>
                  <td className="px-5 py-4 text-center font-medium text-white">{player.wins}</td>
                  <td className="px-5 py-4 text-center font-medium text-gc-text-muted">{player.losses}</td>
                  <td className="px-5 py-4 text-center font-semibold text-gc-green">{winRate.toFixed(1)}%</td>
                  <td className="px-5 py-4 text-center font-mono font-bold tracking-widest text-gc-text-muted text-xs">
                    [{formString}]
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

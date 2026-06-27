import React from 'react';
import { Match, Player } from '../types';

interface MatchHistoryProps {
  matches: Match[];
  players: Player[];
}

export default function MatchHistory({ matches, players }: MatchHistoryProps) {
  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

  if (matches.length === 0) {
    return (
      <div className="gc-panel p-12 text-center text-gc-text-muted">
        <p className="font-display font-semibold uppercase tracking-wider text-sm">Nenhuma partida registrada</p>
        <p className="text-sm mt-2">Os confrontos finalizados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const date = new Date(match.date).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const teamAWon = match.scoreA > match.scoreB;
        const isTie = match.scoreA === match.scoreB;

        return (
          <div 
            key={match.id} 
            className="gc-panel overflow-hidden"
          >
            <div className="bg-[#0b1016] px-6 py-3 border-b border-gc-border flex justify-between items-center text-xs font-semibold text-gc-text-muted uppercase tracking-wider">
              <span>ID: {match.id.substring(0, 8)}</span>
              <span>{date}</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Team A */}
              <div className={`space-y-3 ${teamAWon ? '' : 'opacity-70 grayscale-[30%]'}`}>
                <div className="flex justify-between items-center">
                  <h4 className={`font-display font-black text-xl uppercase ${teamAWon ? 'text-white' : 'text-zinc-400'}`}>Time A</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-[#0b1016] border border-gc-border ${match.eloChangeA > 0 ? 'text-gc-green' : 'text-gc-red'}`}>
                    {match.eloChangeA > 0 ? '+' : ''}{match.eloChangeA} Elo
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.teamA.map(id => (
                    <span key={id} className="bg-[#0b1016] border border-gc-border rounded-sm px-2 py-1 text-xs font-semibold text-zinc-300">
                      {getPlayerName(id)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center justify-center py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-gc-border border-dashed my-4 lg:my-0">
                <div className="flex items-center gap-6 font-display font-black text-5xl">
                  <span className={teamAWon ? 'text-white' : 'text-zinc-500'}>{match.scoreA}</span>
                  <span className="text-gc-border text-3xl">-</span>
                  <span className={!teamAWon && !isTie ? 'text-white' : 'text-zinc-500'}>{match.scoreB}</span>
                </div>
                <div className="text-xs text-gc-text-muted mt-3 font-bold uppercase tracking-widest bg-[#0b1016] px-3 py-1 rounded-full border border-gc-border">
                  {teamAWon ? 'Vitória Time A' : (!teamAWon && !isTie ? 'Vitória Time B' : 'Empate')}
                </div>
              </div>

              {/* Team B */}
              <div className={`space-y-3 ${!teamAWon && !isTie ? '' : 'opacity-70 grayscale-[30%]'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-[#0b1016] border border-gc-border ${match.eloChangeB > 0 ? 'text-gc-green' : 'text-gc-red'}`}>
                    {match.eloChangeB > 0 ? '+' : ''}{match.eloChangeB} Elo
                  </span>
                  <h4 className={`font-display font-black text-xl uppercase ${!teamAWon && !isTie ? 'text-white' : 'text-zinc-400'}`}>Time B</h4>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {match.teamB.map(id => (
                    <span key={id} className="bg-[#0b1016] border border-gc-border rounded-sm px-2 py-1 text-xs font-semibold text-zinc-300">
                      {getPlayerName(id)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

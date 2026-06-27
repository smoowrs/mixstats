import React, { useState } from 'react';
import { Player } from '../types';
import { Swords } from 'lucide-react';

interface RecordMatchProps {
  players: Player[];
  onRecordMatch: (teamAIds: string[], teamBIds: string[], scoreA: number, scoreB: number) => void;
  onCancel: () => void;
}

export default function RecordMatch({ players, onRecordMatch, onCancel }: RecordMatchProps) {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState<number | ''>('');
  const [scoreB, setScoreB] = useState<number | ''>('');

  const availablePlayers = players.filter(p => !teamA.includes(p.id) && !teamB.includes(p.id));

  const togglePlayer = (playerId: string, targetTeam: 'A' | 'B') => {
    if (targetTeam === 'A') {
      if (teamA.includes(playerId)) {
        setTeamA(teamA.filter(id => id !== playerId));
      } else {
        setTeamA([...teamA, playerId]);
        setTeamB(teamB.filter(id => id !== playerId));
      }
    } else {
      if (teamB.includes(playerId)) {
        setTeamB(teamB.filter(id => id !== playerId));
      } else {
        setTeamB([...teamB, playerId]);
        setTeamA(teamA.filter(id => id !== playerId));
      }
    }
  };

  const handleSave = () => {
    if (teamA.length === 0 || teamB.length === 0) return;
    if (scoreA === '' || scoreB === '') return;
    
    onRecordMatch(teamA, teamB, Number(scoreA), Number(scoreB));
    onCancel();
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getPlayerElo = (id: string) => players.find(p => p.id === id)?.elo || 1000;

  const getTeamAvg = (teamIds: string[]) => {
    if (teamIds.length === 0) return 0;
    const sum = teamIds.reduce((acc, id) => acc + getPlayerElo(id), 0);
    return Math.round(sum / teamIds.length);
  };

  return (
    <div className="gc-panel overflow-hidden">
      <div className="p-6 bg-[#0b1016] border-b border-gc-border flex justify-between items-center">
        <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
          <Swords className="w-5 h-5 text-gc-green" />
          Configuração da Partida
        </h2>
        <button onClick={onCancel} className="text-gc-text-muted hover:text-white text-xs font-bold uppercase tracking-wider transition-colors">
          Cancelar
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TEAM A */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gc-border pb-2">
            <h3 className="font-display font-bold text-lg text-white">Time A</h3>
            <span className="text-xs text-gc-text-muted font-semibold uppercase tracking-wider">Média Elo: {getTeamAvg(teamA)}</span>
          </div>
          
          <div className="min-h-[200px] bg-[#0b1016] rounded border border-gc-border p-3 flex flex-col gap-2">
            {teamA.length === 0 && <div className="text-center text-gc-text-muted text-xs py-6 uppercase tracking-wider font-semibold">Vazio</div>}
            {teamA.map(id => (
              <div key={id} onClick={() => togglePlayer(id, 'A')} className="cursor-pointer bg-gc-panel hover:bg-gc-panel-hover border border-gc-border rounded p-2 text-sm flex justify-between items-center transition-colors">
                <span className="font-semibold">{getPlayerName(id)}</span>
                <span className="text-xs text-gc-text-muted font-bold">{getPlayerElo(id)}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gc-text-muted font-semibold uppercase tracking-wider mb-2 text-center">Placar Time A</label>
            <input 
              type="number" 
              value={scoreA}
              onChange={e => setScoreA(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full text-center font-display font-black text-4xl py-3 bg-[#0b1016] border border-gc-border rounded text-white focus:outline-none focus:border-gc-green transition-colors" 
              placeholder="0"
            />
          </div>
        </div>

        {/* AVAILABLE PLAYERS */}
        <div className="space-y-4 border-y lg:border-y-0 lg:border-x border-gc-border py-6 lg:py-0 lg:px-4">
          <h3 className="text-center font-bold text-gc-text-muted text-xs uppercase tracking-widest">Jogadores Disponíveis</h3>
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
            {availablePlayers.length === 0 && (
              <div className="text-center text-gc-text-muted text-xs py-8 font-semibold uppercase tracking-wider">
                {players.length === 0 ? "Adicione jogadores no menu Ranking" : "Todos os jogadores alocados."}
              </div>
            )}
            {availablePlayers.map(p => (
              <div key={p.id} className="flex gap-2">
                <button onClick={() => togglePlayer(p.id, 'A')} className="flex-1 bg-[#0b1016] border border-gc-border hover:border-white rounded p-2 text-xs font-semibold text-left transition-colors">
                   &larr; {p.name}
                </button>
                <button onClick={() => togglePlayer(p.id, 'B')} className="flex-1 bg-[#0b1016] border border-gc-border hover:border-white rounded p-2 text-xs font-semibold text-right transition-colors">
                   {p.name} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TEAM B */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gc-border pb-2">
            <h3 className="font-display font-bold text-lg text-white">Time B</h3>
            <span className="text-xs text-gc-text-muted font-semibold uppercase tracking-wider">Média Elo: {getTeamAvg(teamB)}</span>
          </div>
          
          <div className="min-h-[200px] bg-[#0b1016] rounded border border-gc-border p-3 flex flex-col gap-2">
            {teamB.length === 0 && <div className="text-center text-gc-text-muted text-xs py-6 uppercase tracking-wider font-semibold">Vazio</div>}
            {teamB.map(id => (
              <div key={id} onClick={() => togglePlayer(id, 'B')} className="cursor-pointer bg-gc-panel hover:bg-gc-panel-hover border border-gc-border rounded p-2 text-sm flex justify-between items-center transition-colors">
                <span className="font-semibold">{getPlayerName(id)}</span>
                <span className="text-xs text-gc-text-muted font-bold">{getPlayerElo(id)}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-gc-text-muted font-semibold uppercase tracking-wider mb-2 text-center">Placar Time B</label>
            <input 
              type="number" 
              value={scoreB}
              onChange={e => setScoreB(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full text-center font-display font-black text-4xl py-3 bg-[#0b1016] border border-gc-border rounded text-white focus:outline-none focus:border-gc-green transition-colors" 
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gc-border bg-[#0b1016] flex justify-end gap-4">
        <button 
          onClick={handleSave}
          disabled={teamA.length === 0 || teamB.length === 0 || scoreA === '' || scoreB === ''}
          className="w-full md:w-auto px-12 py-3 bg-gc-green hover:bg-gc-green-hover text-black font-display font-bold uppercase tracking-widest text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Resultado
        </button>
      </div>
    </div>
  );
}

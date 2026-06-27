import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerManagerProps {
  players: Player[];
  onAddPlayer: (name: string, steamId?: string) => void;
  onDeletePlayer: (id: string) => void;
}

export default function PlayerManager({ players, onAddPlayer, onDeletePlayer }: PlayerManagerProps) {
  const [name, setName] = useState('');
  const [steamId, setSteamId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer(name.trim(), steamId.trim());
      setName('');
      setSteamId('');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 space-y-6">
        <div className="gc-panel p-6">
          <h3 className="text-white font-display font-bold mb-4 border-b border-gc-border pb-2 uppercase tracking-wider text-sm">
            Adicionar Jogador
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gc-text-muted font-semibold uppercase tracking-wider mb-2">Nickname (Obrigatório)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: FalleN"
                className="w-full bg-[#0b1016] border border-gc-border rounded px-4 py-2 text-white focus:outline-none focus:border-gc-green transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gc-text-muted font-semibold uppercase tracking-wider mb-2">
                Steam ID64 (Opcional)
              </label>
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="7656119..."
                className="w-full bg-[#0b1016] border border-gc-border rounded px-4 py-2 text-white focus:outline-none focus:border-gc-green transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-gc-green hover:bg-gc-green-hover text-black font-display font-bold py-3 rounded text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>

      <div className="xl:col-span-2">
        <div className="gc-panel p-6 h-full">
          <h3 className="text-white font-display font-bold mb-4 border-b border-gc-border pb-2 uppercase tracking-wider text-sm flex justify-between">
            <span>Roster</span>
            <span className="text-gc-text-muted">Total: {players.length}</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map(player => (
              <div
                key={player.id}
                className="border border-gc-border bg-[#0b1016] rounded p-4 flex justify-between items-center group hover:border-gc-green/50 transition-colors"
              >
                <div>
                  <div className="font-bold text-white font-display">{player.name}</div>
                  <div className="text-xs text-gc-text-muted mt-1 font-semibold uppercase tracking-wider flex gap-2">
                    <span>ELO: <span className="text-gc-green">{player.elo}</span></span>
                    <span>|</span>
                    <span>Jogos: {player.matchesPlayed}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remover ${player.name} permanentemente?`)) {
                      onDeletePlayer(player.id);
                    }
                  }}
                  className="text-gc-red/70 hover:text-white hover:bg-gc-red border border-transparent rounded px-2 py-1 text-xs font-bold transition-all uppercase tracking-wider"
                >
                  Remover
                </button>
              </div>
            ))}
            
            {players.length === 0 && (
              <div className="col-span-full py-12 text-center text-gc-text-muted text-sm font-semibold uppercase tracking-wider border border-dashed border-gc-border rounded">
                Nenhum jogador registrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

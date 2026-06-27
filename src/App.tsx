import React, { useState, useRef, useMemo } from 'react';
import { useAppStore } from './lib/store';
import Leaderboard from './components/Leaderboard';
import PlayerManager from './components/PlayerManager';
import RecordMatch from './components/RecordMatch';
import MatchHistory from './components/MatchHistory';
import { Bell, Trophy, UploadCloud, Users, CheckCircle2, ChevronDown, Gamepad2, Image as ImageIcon, Loader2, AlertCircle, ArrowDown, ArrowUp, Search } from 'lucide-react';

type SortField = 'name' | 'games' | 'wins' | 'kills' | 'deaths' | 'winRate' | 'kd' | 'assists' | 'mvp' | 'avgAssist' | 'avgMvp' | 'avgKill' | 'avgDeath';

export default function App() {
  const { players, matches, leaderboard, addPlayer, deletePlayer, recordMatch, updateLeaderboard, resetData } = useAppStore();
  const [activeTab, setActiveTab] = useState<'estatisticas' | 'ranking' | 'campeonatos' | 'historico'>('estatisticas');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('winRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Fake logs for UI
  const [uploadLogs, setUploadLogs] = useState<{id: number, user: string, date: string, type: string}[]>([
    { id: 1, user: 'Lipe2k', date: 'Há 2 horas', type: 'Print de Partida (5v5)' },
    { id: 2, user: 'Smoow', date: 'Ontem', type: 'Print de Partida (5v5)' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const sortedLeaderboard = useMemo(() => {
    let filtered = leaderboard;
    
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a];
      let valB: any = b[sortField as keyof typeof b];
      
      if (sortField === 'avgKill') {
        valA = a.avgKill ?? (a.games > 0 ? a.kills / a.games : 0);
        valB = b.avgKill ?? (b.games > 0 ? b.kills / b.games : 0);
      } else if (sortField === 'avgDeath') {
        valA = a.avgDeath ?? (a.games > 0 ? a.deaths / a.games : 0);
        valB = b.avgDeath ?? (b.games > 0 ? b.deaths / b.games : 0);
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leaderboard, sortField, sortOrder, searchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g. "data:image/png;base64,")
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/extract-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: file.type })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao processar a imagem. Tente novamente.');
      }

      const data = await response.json();
      updateLeaderboard(data);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error(error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadLogs(prev => [{
        id: Date.now(),
        user: 'Smoow',
        date: 'Agora mesmo',
        type: 'Print de Partida (5v5)'
      }, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-gc-bg text-white font-sans selection:bg-gc-green selection:text-black pb-20">
      {/* Header */}
      <header className="bg-gc-panel border-b border-gc-border h-16 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Esquerda: Logo e Nav */}
          <div className="flex items-center h-full overflow-x-auto">
            <div className="flex items-center mr-8 flex-shrink-0 cursor-pointer" onClick={() => setActiveTab('estatisticas')}>
              <span className="font-display font-black text-2xl tracking-tighter text-white">MIX</span>
              <span className="font-display font-black text-2xl tracking-tighter text-gc-yellow ml-1">STATS</span>
            </div>
            
            <nav className="flex items-center h-full">
              <button 
                onClick={() => setActiveTab('estatisticas')}
                className={`h-full flex items-center px-6 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === 'estatisticas' ? 'bg-gc-green text-black' : 'text-gc-text-muted hover:text-white'}`}
              >
                Estatísticas
              </button>
              <button 
                onClick={() => setActiveTab('ranking')}
                className={`h-full flex items-center px-6 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === 'ranking' ? 'bg-gc-green text-black' : 'text-gc-text-muted hover:text-white'}`}
              >
                Ranking
              </button>
              <button 
                onClick={() => setActiveTab('campeonatos')}
                className={`h-full flex items-center px-6 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === 'campeonatos' ? 'bg-gc-green text-black' : 'text-gc-text-muted hover:text-white'}`}
              >
                Campeonatos
              </button>
              <button 
                onClick={() => setActiveTab('historico')}
                className={`h-full flex items-center px-6 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${activeTab === 'historico' ? 'bg-gc-green text-black' : 'text-gc-text-muted hover:text-white'}`}
              >
                Histórico
              </button>
            </nav>
          </div>

          {/* Direita: Perfil */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                className={`relative transition-colors ${isNotifOpen ? 'text-white' : 'text-gc-text-muted hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gc-red rounded-full border-2 border-gc-panel"></span>
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-[#0b1016] border border-gc-border rounded shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gc-border text-sm font-bold uppercase tracking-wider">Notificações</div>
                  <div className="p-4 text-xs text-gc-text-muted text-center">Nenhuma notificação no momento.</div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              >
                <span className={`font-semibold text-sm transition-colors ${isProfileOpen ? 'text-gc-green' : 'group-hover:text-gc-green'}`}>Smoow</span>
                <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-gc-border overflow-hidden flex items-center justify-center">
                  <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Smoow&backgroundColor=151f2b" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180 text-gc-green' : 'text-gc-text-muted'}`} />
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-[#0b1016] border border-gc-border rounded shadow-xl z-50 overflow-hidden text-sm">
                  <a href="#" className="block px-4 py-3 hover:bg-gc-panel-hover transition-colors">Meu Perfil</a>
                  <a href="#" className="block px-4 py-3 hover:bg-gc-panel-hover transition-colors">Configurações</a>
                  <div className="border-t border-gc-border"></div>
                  <a href="#" className="block px-4 py-3 hover:bg-gc-red hover:text-white text-gc-red transition-colors">Sair</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-[1600px] mx-auto px-4 pt-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Coluna Central Principal */}
        <section className="col-span-1 xl:col-span-12 space-y-8">
          
          {activeTab === 'estatisticas' && (
            <>
              {/* Título da Seção */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">TABELA GERAL DE LÍDERES (5V5)</h1>
                  <p className="text-gc-text-muted font-display font-semibold text-sm mt-1 uppercase tracking-wider">CLASSIFICAÇÃO E DESEMPENHO EXTRAÍDO DIRETAMENTE DA PLANILHA DE JOGOS</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gc-text-muted" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0b1016] border border-gc-border rounded pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gc-green transition-colors"
                  />
                </div>
              </div>

              {/* Tabela de Liderança Estática */}
              <div className="gc-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#0b1016] border-b border-gc-border font-display font-bold text-gc-text-muted tracking-wider uppercase select-none">
                        <th className="px-3 py-3 w-10 text-center">#</th>
                        <th className="px-3 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">Jogador {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Jogos" onClick={() => handleSort('games')}>
                          <div className="flex items-center justify-center gap-1">Jogos {sortField === 'games' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Vitórias" onClick={() => handleSort('wins')}>
                          <div className="flex items-center justify-center gap-1">Vitórias {sortField === 'wins' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Kills" onClick={() => handleSort('kills')}>
                          <div className="flex items-center justify-center gap-1">Kills {sortField === 'kills' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Mortes" onClick={() => handleSort('deaths')}>
                          <div className="flex items-center justify-center gap-1">Mortes {sortField === 'deaths' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('winRate')}>
                          <div className="flex items-center justify-center gap-1">% Win {sortField === 'winRate' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('kd')}>
                          <div className="flex items-center justify-center gap-1">K/D {sortField === 'kd' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Assistências" onClick={() => handleSort('assists')}>
                          <div className="flex items-center justify-center gap-1">A {sortField === 'assists' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('mvp')}>
                          <div className="flex items-center justify-center gap-1">MVP {sortField === 'mvp' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Média de Assistências" onClick={() => handleSort('avgAssist')}>
                          <div className="flex items-center justify-center gap-1">Med. A {sortField === 'avgAssist' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Média de MVPs" onClick={() => handleSort('avgMvp')}>
                          <div className="flex items-center justify-center gap-1">Med. MVP {sortField === 'avgMvp' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Média de Kills" onClick={() => handleSort('avgKill')}>
                          <div className="flex items-center justify-center gap-1">Med. K {sortField === 'avgKill' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                        <th className="px-3 py-3 text-center cursor-pointer hover:text-white transition-colors" title="Média de Mortes" onClick={() => handleSort('avgDeath')}>
                          <div className="flex items-center justify-center gap-1">Med. D {sortField === 'avgDeath' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-gc-green" /> : <ArrowDown className="w-3 h-3 text-gc-green" />)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gc-border/50 text-sm">
                      {sortedLeaderboard.map((player, index) => (
                        <tr key={player.id || index} className="hover:bg-gc-panel-hover transition-colors group">
                          <td className="px-3 py-3 text-center">
                            <span className={`font-display font-black text-base ${
                              index === 0 ? 'text-gc-yellow' :
                              index === 1 ? 'text-zinc-300' :
                              index === 2 ? 'text-orange-400' : 'text-gc-text-muted'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                <Users className="w-3 h-3 text-zinc-500" />
                              </div>
                              <span className="font-semibold text-white group-hover:text-gc-green transition-colors truncate max-w-[120px]">{player.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-white">{player.games}</td>
                          <td className="px-3 py-3 text-center font-medium text-white">{player.wins}</td>
                          <td className="px-3 py-3 text-center font-medium text-white">{player.kills}</td>
                          <td className="px-3 py-3 text-center font-medium text-gc-text-muted">{player.deaths}</td>
                          <td className="px-3 py-3 text-center font-semibold text-gc-green">{player.winRate?.toFixed(1) || 0}%</td>
                          <td className="px-3 py-3 text-center font-semibold text-gc-green">{player.kd?.toFixed(2) || 0}</td>
                          <td className="px-3 py-3 text-center font-medium text-white">{player.assists}</td>
                          <td className="px-3 py-3 text-center font-medium text-white">{player.mvp}</td>
                          <td className="px-3 py-3 text-center font-medium text-gc-text-muted">{player.avgAssist?.toFixed(1) || 0}</td>
                          <td className="px-3 py-3 text-center font-medium text-gc-text-muted">{player.avgMvp?.toFixed(1) || 0}</td>
                          <td className="px-3 py-3 text-center font-medium text-gc-text-muted">{player.avgKill?.toFixed(1) || (player.games > 0 ? (player.kills / player.games).toFixed(1) : 0)}</td>
                          <td className="px-3 py-3 text-center font-medium text-gc-text-muted">{player.avgDeath?.toFixed(1) || (player.games > 0 ? (player.deaths / player.games).toFixed(1) : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Seção de OCR / Envio de Prints */}
                <div className="gc-panel p-6 h-full flex flex-col">
                  <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-gc-green" />
                    Atualizar Kills via Print
                  </h3>
                  <p className="text-gc-text-muted text-sm mb-6 flex-1">
                    Envie um screenshot da tabela final do jogo (Scoreboard). A IA extrairá Kills, Mortes, Assists e MVPs automaticamente para o banco de dados.
                  </p>
                  
                  {uploadError && (
                    <div className="mb-6 p-3 bg-gc-red/10 border border-gc-red/30 rounded text-gc-red text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {uploadError}
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all min-h-[140px] ${
                      isUploading ? 'border-gc-green bg-gc-green/5' : 
                      uploadSuccess ? 'border-gc-green bg-gc-green/10' :
                      'border-gc-border hover:border-gc-green hover:bg-gc-panel-hover cursor-pointer'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-gc-green animate-spin mb-3" />
                        <span className="text-gc-green font-semibold text-sm">Processando imagem...</span>
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-gc-green mb-3" />
                        <span className="text-gc-green font-semibold text-sm">Estatísticas sincronizadas!</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gc-text-muted mb-3" />
                        <span className="text-white font-semibold text-sm">Clique ou arraste a print aqui</span>
                        <span className="text-gc-text-muted text-xs mt-1">PNG, JPG até 5MB</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Histórico de Uploads */}
                <div className="gc-panel p-6 h-full flex flex-col">
                  <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight mb-6 border-b border-gc-border pb-4">
                    Últimas Sincronizações
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {uploadLogs.length === 0 ? (
                      <div className="text-center text-gc-text-muted text-sm py-8">Nenhum log de envio recente.</div>
                    ) : (
                      uploadLogs.map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded bg-[#0b1016] border border-gc-border">
                          <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${log.user}&backgroundColor=151f2b`} alt={log.user} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {log.user} <span className="text-gc-text-muted font-normal ml-1">enviou estatísticas</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gc-green font-mono">{log.type}</span>
                              <span className="text-xs text-gc-text-muted">•</span>
                              <span className="text-xs text-gc-text-muted">{log.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">RANKING ELO DINÂMICO</h1>
                <p className="text-gc-text-muted font-display font-semibold text-sm mt-1 uppercase tracking-wider">PONTUAÇÃO BASEADA NAS PARTIDAS CADASTRADAS</p>
              </div>
              <Leaderboard players={players} />
              
              <div className="mt-8">
                <h2 className="font-display font-bold text-xl text-white uppercase mb-4">Gerenciar Jogadores do Mix</h2>
                <PlayerManager players={players} onAddPlayer={addPlayer} onDeletePlayer={deletePlayer} />
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">HISTÓRICO DE PARTIDAS</h1>
                  <p className="text-gc-text-muted font-display font-semibold text-sm mt-1 uppercase tracking-wider">TODOS OS CONFRONTOS REGISTRADOS</p>
                </div>
                <button 
                  onClick={() => setActiveTab('campeonatos')} // re-using campeonatos tab for record match for now
                  className="bg-gc-green hover:bg-gc-green-hover text-black font-display font-bold px-6 py-3 rounded text-sm uppercase tracking-wider transition-colors"
                >
                  Registrar Partida
                </button>
              </div>
              <MatchHistory matches={matches} players={players} />
            </div>
          )}

          {activeTab === 'campeonatos' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight">NOVA PARTIDA 5V5</h1>
                <p className="text-gc-text-muted font-display font-semibold text-sm mt-1 uppercase tracking-wider">REGISTRE OS RESULTADOS PARA ATUALIZAR O ELO</p>
              </div>
              <RecordMatch 
                players={players} 
                onRecordMatch={(teamA, teamB, scoreA, scoreB) => {
                  recordMatch(teamA, teamB, scoreA, scoreB);
                  setActiveTab('historico');
                }} 
                onCancel={() => setActiveTab('historico')}
              />
            </div>
          )}

        </section>

      </main>
    </div>
  );
}



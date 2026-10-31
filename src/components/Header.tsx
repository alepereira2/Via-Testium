import React from 'react';
import { useGame, GameView } from '../context/GameContext';
import { 
  Flame, 
  ShieldAlert, 
  Scroll, 
  MapPin, 
  Cross, 
  Home, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, playerStats, isMuted, toggleMute, resetProgress } = useGame();

  const handleNav = (view: GameView) => {
    soundEngine.playParchmentClick();
    setCurrentView(view);
  };

  return (
    <header className="sticky top-0 z-50 bg-stonebg-950/95 border-b border-amber-900/40 backdrop-blur px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title and Roman Subtitle */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('map')}>
          <div className="w-10 h-10 rounded-full border border-amber-500/60 flex items-center justify-center bg-gradient-to-br from-amber-950 to-stone-900 shadow-inner">
            <Cross className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-serif font-black text-xl tracking-widest text-amber-200 uppercase drop-shadow">
              VIA TESTIUM
            </h1>
            <p className="text-xs font-serif italic text-amber-500/80 tracking-wider">
              The Apostles' Trail • O Caminho do Testemunho
            </p>
          </div>
        </div>

        {/* Global Resource Meters (Pneuma & Alert) */}
        <div className="flex flex-wrap items-center gap-4 bg-stone-900/80 border border-stone-800 rounded-lg px-4 py-2 text-xs">
          {/* Pneuma / Grace */}
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-stone-400 font-serif uppercase tracking-wider text-[10px]">
                Pneuma (Fé/Graça)
              </span>
              <div className="w-24 bg-stone-950 rounded-full h-2 overflow-hidden border border-amber-900/50">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-300 h-full transition-all duration-500"
                  style={{ width: `${playerStats.pneuma}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-amber-300 font-bold">{playerStats.pneuma}</span>
          </div>

          {/* Sanhedrin Alert (Zelos) */}
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-stone-400 font-serif uppercase tracking-wider text-[10px]">
                Sinédrio (Zelos)
              </span>
              <div className="w-20 bg-stone-950 rounded-full h-2 overflow-hidden border border-purple-900/50">
                <div
                  className="bg-purple-600 h-full transition-all duration-500"
                  style={{ width: `${playerStats.alertZelos}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-purple-300">{playerStats.alertZelos}%</span>
          </div>

          {/* Roman Alert (Maiestas) */}
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-stone-400 font-serif uppercase tracking-wider text-[10px]">
                Roma (Maiestas)
              </span>
              <div className="w-20 bg-stone-950 rounded-full h-2 overflow-hidden border border-red-900/50">
                <div
                  className="bg-red-600 h-full transition-all duration-500"
                  style={{ width: `${playerStats.alertMaiestas}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-red-300">{playerStats.alertMaiestas}%</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => handleNav('map')}
            className={`px-3 py-1.5 rounded-md font-serif text-xs transition flex items-center gap-1.5 ${
              currentView === 'map'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Campanha</span>
          </button>

          <button
            onClick={() => handleNav('canon')}
            className={`px-3 py-1.5 rounded-md font-serif text-xs transition flex items-center gap-1.5 ${
              currentView === 'canon'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Canon Romano</span>
          </button>

          <button
            onClick={() => handleNav('house_church')}
            className={`px-3 py-1.5 rounded-md font-serif text-xs transition flex items-center gap-1.5 ${
              currentView === 'house_church'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-stone-300" />
            <span>Casa-Igreja</span>
          </button>

          <button
            onClick={() => handleNav('phase1')}
            className={`px-3 py-1.5 rounded-md font-serif text-xs transition flex items-center gap-1.5 ${
              currentView === 'phase1'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span>Fase 1 (Pedro)</span>
          </button>

          <button
            onClick={() => handleNav('phase13')}
            className={`px-3 py-1.5 rounded-md font-serif text-xs transition flex items-center gap-1.5 ${
              currentView === 'phase13'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Scroll className="w-3.5 h-3.5 text-purple-400" />
            <span>Fase 13 (Paulo)</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 text-stone-400 hover:text-amber-300 rounded-md hover:bg-stone-900 transition ml-1"
            title={isMuted ? 'Desmutar Som' : 'Mutar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Reset progress */}
          <button
            onClick={() => {
              if (window.confirm('Deseja reiniciar todo o progresso do jogo?')) {
                resetProgress();
              }
            }}
            className="p-1.5 text-stone-500 hover:text-red-400 rounded-md hover:bg-stone-900 transition"
            title="Reiniciar Progresso"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </nav>
      </div>
    </header>
  );
};

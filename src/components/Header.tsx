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
  Sparkles,
  Zap
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, playerStats, isMuted, toggleMute, resetProgress } = useGame();

  const handleNav = (view: GameView) => {
    soundEngine.playParchmentClick();
    setCurrentView(view);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-stone-950/95 border-b border-amber-900/40 backdrop-blur px-3 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Roman Subtitle */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => handleNav('map')}>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-amber-500/70 flex items-center justify-center bg-gradient-to-br from-amber-950 to-stone-900 shadow-inner">
              <Cross className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="font-serif font-black text-sm md:text-xl tracking-wider text-amber-200 uppercase drop-shadow">
                VIA TESTIUM
              </h1>
              <p className="hidden sm:block text-[10px] md:text-xs font-serif italic text-amber-500/80">
                The Apostles' Trail • O Caminho do Testemunho
              </p>
            </div>
          </div>

          {/* Compact Resource Badges */}
          <div className="flex items-center gap-2">
            
            {/* Pneuma / Grace Badge */}
            <div className="flex items-center gap-1.5 bg-stone-900/90 border border-amber-700/60 rounded-lg px-2.5 py-1 text-xs shadow-inner">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-amber-300 font-bold text-xs">
                {playerStats.pneuma}
              </span>
              <span className="hidden sm:inline text-[10px] font-serif text-stone-400 uppercase">
                Pneuma
              </span>
            </div>

            {/* Sanhedrin & Rome Alert (Merged for mobile compactness) */}
            <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 rounded-lg px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1" title="Alerta do Sinédrio (Zelos)">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="font-mono text-[11px] text-purple-300">{playerStats.alertZelos}%</span>
              </div>
              <div className="flex items-center gap-1" title="Alerta Romano (Maiestas)">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-mono text-[11px] text-red-300">{playerStats.alertMaiestas}%</span>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-stone-900 transition border border-stone-800"
              title={isMuted ? 'Desmutar Som' : 'Mutar Som'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Reset Game button */}
            <button
              onClick={() => {
                if (window.confirm('Deseja reiniciar todo o progresso do jogo?')) {
                  resetProgress();
                }
              }}
              className="hidden sm:block p-1.5 text-stone-500 hover:text-red-400 rounded-lg hover:bg-stone-900 transition"
              title="Reiniciar Progresso"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Navigation (Hidden on mobile, uses bottom nav bar instead!) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => handleNav('map')}
              className={`px-3 py-1.5 rounded-lg font-serif text-xs transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-serif text-xs transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-serif text-xs transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-serif text-xs transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-serif text-xs transition flex items-center gap-1.5 ${
                currentView === 'phase13'
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50 shadow'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-purple-400" />
              <span>Fase 13 (Paulo)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Sticky Bottom Navigation Bar for Mobile Phones (Thumb-friendly UX) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 border-t border-amber-900/60 backdrop-blur pb-safe px-2 py-1 shadow-2xl flex items-center justify-around select-none">
        
        <button
          onClick={() => handleNav('map')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            currentView === 'map'
              ? 'text-amber-300 font-bold bg-amber-950/50 border border-amber-600/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-serif">Mapa</span>
        </button>

        <button
          onClick={() => handleNav('phase1')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            currentView === 'phase1'
              ? 'text-amber-300 font-bold bg-amber-950/50 border border-amber-600/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scroll className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-serif">Fase 1</span>
        </button>

        <button
          onClick={() => handleNav('phase13')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            currentView === 'phase13'
              ? 'text-purple-300 font-bold bg-purple-950/50 border border-purple-600/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scroll className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-serif">Fase 13</span>
        </button>

        <button
          onClick={() => handleNav('canon')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            currentView === 'canon'
              ? 'text-yellow-300 font-bold bg-amber-950/50 border border-yellow-600/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-yellow-400" />
          <span className="text-[10px] font-serif">Canon</span>
        </button>

        <button
          onClick={() => handleNav('house_church')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            currentView === 'house_church'
              ? 'text-amber-300 font-bold bg-amber-950/50 border border-amber-600/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-serif">Igreja</span>
        </button>

      </nav>
    </>
  );
};

import React from 'react';
import { useGame } from './context/GameContext';
import { Header } from './components/Header';
import { CampaignMap } from './components/CampaignMap';
import { CanonRomanoView } from './components/CanonRomanoView';
import { PhaseOneGameplay } from './components/PhaseOneGameplay';
import { PhaseThirteenGameplay } from './components/PhaseThirteenGameplay';
import { DomusEcclesiaeView } from './components/DomusEcclesiaeView';
import { Cross, Github } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { currentView } = useGame();

  return (
    <div className="min-h-screen bg-stonebg-950 flex flex-col font-body selection:bg-amber-900 selection:text-amber-100">
      <Header />

      <main className="flex-1 pb-24 lg:pb-16 px-2 sm:px-4">
        {currentView === 'map' && <CampaignMap />}
        {currentView === 'canon' && <CanonRomanoView />}
        {currentView === 'phase1' && <PhaseOneGameplay />}
        {currentView === 'phase13' && <PhaseThirteenGameplay />}
        {currentView === 'house_church' && <DomusEcclesiaeView />}
      </main>

      {/* Solemn Roman Liturgical Footer */}
      <footer className="border-t border-amber-950/60 bg-stonebg-950/90 py-8 px-4 text-center text-xs text-stone-500 font-serif space-y-2">
        <div className="flex items-center justify-center gap-2 text-amber-500/70">
          <Cross className="w-4 h-4" />
          <span className="tracking-widest uppercase text-[11px]">
            Et ideo cum Angelis et Archangelis, cum Thronis et Dominationibus
          </span>
          <Cross className="w-4 h-4" />
        </div>
        <p className="italic text-stone-400">
          Via Testium: The Apostles' Trail — O Caminho do Testemunho (28 d.C. – 100 d.C.)
        </p>
        <div className="pt-2 flex items-center justify-center gap-4 text-stone-400 text-xs">
          <a
            href="https://github.com/alepereira2/Via-Testium"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition flex items-center gap-1.5"
          >
            <Github className="w-4 h-4" />
            <span>alepereira2/Via-Testium</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AppContent;

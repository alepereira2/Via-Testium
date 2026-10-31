import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PhaseData } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Scroll, 
  Shield, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Award 
} from 'lucide-react';

export const CampaignMap: React.FC = () => {
  const { phases, selectedPhaseId, setSelectedPhaseId, setCurrentView, completePhase } = useGame();
  const [activePhase, setActivePhase] = useState<PhaseData>(
    phases.find((p) => p.id === selectedPhaseId) || phases[0]
  );

  const handleSelectPhase = (phase: PhaseData) => {
    soundEngine.playParchmentClick();
    setActivePhase(phase);
    setSelectedPhaseId(phase.id);
  };

  const handleLaunchPhase = (phase: PhaseData) => {
    soundEngine.playBellToll();
    if (phase.id === 1) {
      setCurrentView('phase1');
    } else if (phase.id === 13) {
      setCurrentView('phase13');
    } else {
      // Allow marking as completed in prototype
      completePhase(phase.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-900/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-amber-500 font-serif tracking-widest text-xs uppercase font-semibold">
            Mapa da Igreja Primitiva (28 d.C. – 100 d.C.)
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-1">
            As Rotas do Testemunho Apostólico
          </h2>
          <p className="text-stone-300 text-sm max-w-3xl mt-2 leading-relaxed">
            Selecione uma das 14 fases canônicas para inspecionar o cenário geográfico, o conflito doutrinário e a entrega suprema do apóstolo. A cada martírio selado, o retábulo sagrado do <strong>Canon Romano</strong> recebe novos santos da fé.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map Visual & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Stylized Antiquity Map */}
        <div className="lg:col-span-2 bg-stonebg-900/90 border border-amber-900/40 rounded-xl p-4 shadow-2xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
          
          {/* Map Title & Legend */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="font-serif text-xs text-amber-200/90 tracking-wider uppercase font-semibold">
                Bacia do Mediterrâneo, Cáucaso, Pérsia & Índia
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Concluída
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Disponível
              </span>
              <span className="flex items-center gap-1 text-stone-500">
                <span className="w-2 h-2 rounded-full bg-stone-600"></span> Selada
              </span>
            </div>
          </div>

          {/* SVG Map Canvas with Simulated Sea and Historical Regions */}
          <div className="relative w-full h-[380px] bg-gradient-to-b from-[#101924] via-[#141e2b] to-[#1a1714] rounded-lg border border-stone-800 p-2 overflow-hidden select-none">
            
            {/* Watermark Compass Rose */}
            <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
              <svg className="w-36 h-36 text-amber-400" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z" />
              </svg>
            </div>

            {/* Ancient Province Labels */}
            <span className="absolute top-16 left-12 text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Roma / Itália
            </span>
            <span className="absolute top-24 left-[35%] text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Acaia / Grécia
            </span>
            <span className="absolute top-20 left-[52%] text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Ásia Menor
            </span>
            <span className="absolute top-12 left-[66%] text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Ponto / Cítia
            </span>
            <span className="absolute top-44 left-[56%] text-[10px] font-serif uppercase tracking-widest text-amber-500/40 pointer-events-none font-bold">
              Jerusalém / Judeia
            </span>
            <span className="absolute top-36 left-[72%] text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Mesopotâmia / Pérsia
            </span>
            <span className="absolute bottom-6 left-[56%] text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Axum (Etiópia)
            </span>
            <span className="absolute bottom-8 right-6 text-[10px] font-serif uppercase tracking-widest text-stone-600 pointer-events-none">
              Malabar (Índia)
            </span>

            {/* Connecting Trade Routes / Apostles' Journey Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <path
                d="M 58% 64% L 57% 61% L 56% 66% L 49% 44% L 52% 50% L 67% 46% L 88% 78% L 62% 88% L 57% 64% L 72% 60% L 65% 55% L 64% 41% L 38% 46% L 50% 53%"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Phase Map Nodes */}
            {phases.map((phase) => {
              const isSelected = activePhase.id === phase.id;
              const isCompleted = phase.status === 'completed';
              const isUnlocked = phase.status === 'unlocked';

              return (
                <button
                  key={phase.id}
                  onClick={() => handleSelectPhase(phase)}
                  style={{
                    left: `${phase.coordinates.x}%`,
                    top: `${phase.coordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  title={`${phase.title} (${phase.protagonist})`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold shadow-lg border transition-all ${
                      isSelected
                        ? 'ring-4 ring-amber-400/50 bg-amber-500 text-stone-950 border-amber-300'
                        : isCompleted
                        ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                        : isUnlocked
                        ? 'bg-amber-950 border-amber-500 text-amber-200'
                        : 'bg-stone-900 border-stone-700 text-stone-500 opacity-60'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : isUnlocked ? (
                      phase.id
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </div>
                  
                  {/* Tooltip on Hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap bg-stone-950 text-amber-200 text-[10px] font-serif py-1 px-2 rounded border border-amber-900/60 shadow-xl pointer-events-none">
                    {phase.protagonist}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-stone-400 mt-2 italic flex items-center justify-between">
            <span>Clique nos círculos numerados para inspecionar cada testemunho.</span>
            <span className="text-amber-500 font-serif">14 Capítulos Históricos Canônicos</span>
          </div>
        </div>

        {/* Selected Phase Details Drawer */}
        <div className="bg-stonebg-900 border border-amber-900/40 rounded-xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-3">
            {/* Phase Tag & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold tracking-widest text-amber-400 uppercase bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/50">
                Capítulo {activePhase.id} de 14
              </span>
              <span
                className={`text-xs font-serif font-semibold px-2 py-0.5 rounded border ${
                  activePhase.status === 'completed'
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : activePhase.status === 'unlocked'
                    ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                    : 'bg-stone-900 border-stone-700 text-stone-500'
                }`}
              >
                {activePhase.status === 'completed'
                  ? 'Martírio Consagrado'
                  : activePhase.status === 'unlocked'
                  ? 'Pronto para Missão'
                  : 'Fase Futura'}
              </span>
            </div>

            {/* Title & Protagonist */}
            <div>
              <h3 className="text-xl font-serif font-bold text-amber-100">
                {activePhase.title}
              </h3>
              <p className="text-xs text-amber-500/90 font-serif italic mt-0.5">
                {activePhase.subtitle}
              </p>
            </div>

            {/* Info Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-stone-300 bg-stone-950/60 p-2 rounded border border-stone-800">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{activePhase.period}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-300 bg-stone-950/60 p-2 rounded border border-stone-800">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{activePhase.region}</span>
              </div>
            </div>

            {/* Setting & Conflict */}
            <div className="space-y-2 text-xs text-stone-300">
              <div className="bg-stone-950/40 p-2.5 rounded border border-stone-800/80">
                <strong className="text-amber-300 block font-serif mb-0.5">Cenário Histórico:</strong>
                <p className="text-stone-400 leading-relaxed">{activePhase.visualSetting}</p>
              </div>

              <div className="bg-stone-950/40 p-2.5 rounded border border-stone-800/80">
                <strong className="text-amber-300 block font-serif mb-0.5">Conflito Doutrinário:</strong>
                <p className="text-stone-400 leading-relaxed">{activePhase.narrativeConflict}</p>
              </div>

              <div className="bg-stone-950/40 p-2.5 rounded border border-stone-800/80">
                <strong className="text-amber-300 block font-serif mb-0.5">Objetivo de Gameplay:</strong>
                <p className="text-stone-400 leading-relaxed">{activePhase.coreObjective}</p>
              </div>
            </div>

            {/* Biblical Verse */}
            <div className="border-l-2 border-amber-600 pl-3 py-1 italic text-xs text-amber-200/90 font-serif bg-amber-950/20">
              "{activePhase.scriptureQuote}"
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {activePhase.id === 1 ? (
              <button
                onClick={() => handleLaunchPhase(activePhase)}
                className="w-full bg-gradient-to-r from-amber-700 hover:from-amber-600 to-amber-900 text-amber-100 font-serif font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition border border-amber-500/60 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Jogar Fase 1 (Pátio de Caifás)</span>
              </button>
            ) : activePhase.id === 13 ? (
              <button
                onClick={() => handleLaunchPhase(activePhase)}
                className="w-full bg-gradient-to-r from-purple-800 hover:from-purple-700 to-purple-950 text-purple-100 font-serif font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition border border-purple-500/60 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Jogar Fase 13 (Estrada de Damasco)</span>
              </button>
            ) : (
              <button
                onClick={() => handleLaunchPhase(activePhase)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow transition border border-stone-700"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Consagrar Martírio no Canon Romano</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Horizontal Phase Cards Carousel */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4">
        <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
          <Scroll className="w-4 h-4" />
          <span>Índice Completo da Campanha Apostólica</span>
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-900">
          {phases.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPhase(p)}
              className={`flex-shrink-0 w-56 text-left p-3 rounded-lg border transition ${
                activePhase.id === p.id
                  ? 'bg-amber-950/60 border-amber-500/70 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-serif mb-1">
                <span>Capítulo {p.id}</span>
                {p.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <h5 className="font-serif font-bold text-xs text-amber-100 line-clamp-1">
                {p.protagonist}
              </h5>
              <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                {p.region}
              </p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

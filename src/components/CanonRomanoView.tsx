import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Saint } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { 
  Sparkles, 
  Lock, 
  Cross, 
  Shield, 
  BookOpen, 
  Flame, 
  Key, 
  Sword, 
  Crown, 
  Award, 
  Feather, 
  Anchor,
  X
} from 'lucide-react';

export const CanonRomanoView: React.FC = () => {
  const { saints, unlockSaint } = useGame();
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);

  const apostles = saints.filter((s) => s.isApostle);
  const contemporarySaints = saints.filter((s) => !s.isApostle);

  const unlockedCount = saints.filter((s) => s.unlocked).length;

  const handleOpenSaint = (saint: Saint) => {
    soundEngine.playBellToll();
    setSelectedSaint(saint);
  };

  const getIcon = (name: string, unlocked: boolean) => {
    const className = `w-6 h-6 ${unlocked ? 'text-amber-400' : 'text-stone-600'}`;
    switch (name) {
      case 'Key': return <Key className={className} />;
      case 'Sword': return <Sword className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Feather': return <Feather className={className} />;
      case 'Anchor': return <Anchor className={className} />;
      default: return <Cross className={className} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-6 md:space-y-8">
      
      {/* Altar Banner Header */}
      <div className="text-center relative py-8 px-4 bg-gradient-to-b from-stone-900 via-amber-950/50 to-stone-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Subtle Cross background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Cross className="w-96 h-96 text-amber-300" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-300 text-xs font-serif tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Memorial Mosaico Eucarístico</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-black tracking-widest text-amber-100 uppercase drop-shadow-md">
            CANON ROMANO
          </h2>

          <p className="font-serif italic text-amber-400 text-sm md:text-base">
            "Sanguis martyrum semen christianorum" — O sangue dos mártires é a semente de novos cristãos
          </p>

          <p className="text-xs text-stone-300 max-w-2xl mx-auto leading-relaxed pt-2">
            A cada fase completada e martírio consumado, o rosto do Apóstolo central é consagrado neste retábulo sagrado. Conforme a perseguição romana e pagã se alastra, novos santos contemporâneos canonizados pela Igreja Católica acendem-se ao redor deles, comprovando o crescimento invencível da Igreja.
          </p>

          {/* Counter Badge */}
          <div className="pt-3 inline-block">
            <div className="bg-stone-950/80 border border-amber-600/50 rounded-lg px-4 py-2 font-serif text-xs text-amber-200">
              Testemunhas Consagradas no Retábulo: <strong className="text-amber-400 text-sm">{unlockedCount}</strong> / {saints.length}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: OS DOZE APÓSTOLOS E SÃO PAULO (ALTA PRIORIDADE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg md:text-xl font-serif font-bold text-amber-200 uppercase tracking-wider">
              O Colégio Apostólico (Os Doze & São Paulo)
            </h3>
          </div>
          <span className="text-xs font-serif text-stone-400 italic">
            Colunas Fundamentais da Igreja
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {apostles.map((apostle) => {
            return (
              <div
                key={apostle.id}
                onClick={() => handleOpenSaint(apostle)}
                className={`relative rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-300 border ${
                  apostle.unlocked
                    ? 'bg-gradient-to-b from-stone-900 via-amber-950/30 to-stone-950 border-amber-500/60 hover:scale-105 hover:border-amber-300 shadow-xl'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-50 hover:opacity-75'
                }`}
              >
                {/* Portrait Halo Frame */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 transition-all ${
                    apostle.unlocked
                      ? 'bg-gradient-to-br from-amber-600 to-amber-950 border-2 border-amber-300 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-stone-900 border border-stone-700'
                  }`}
                >
                  {apostle.unlocked ? (
                    getIcon(apostle.iconName, true)
                  ) : (
                    <Lock className="w-5 h-5 text-stone-500" />
                  )}
                </div>

                <h4 className="font-serif font-bold text-xs text-amber-100 line-clamp-1">
                  {apostle.name}
                </h4>

                <span className="text-[10px] text-amber-500/80 font-serif italic line-clamp-1 mt-0.5">
                  {apostle.title.split('&')[0]}
                </span>

                <div className="mt-2 text-[10px] font-mono">
                  {apostle.unlocked ? (
                    <span className="text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      Consagrado
                    </span>
                  ) : (
                    <span className="text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                      Aguardando
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SANTOS CONTEMPORÂNEOS DA ERA APOSTÓLICA (CANONIZADOS) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg md:text-xl font-serif font-bold text-amber-200 uppercase tracking-wider">
              Mártires Contemporâneos & Padres Apostólicos
            </h3>
          </div>
          <span className="text-xs font-serif text-stone-400 italic">
            Santos Canonizados que Floresceram sob a Perseguição
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {contemporarySaints.map((saint) => {
            return (
              <div
                key={saint.id}
                onClick={() => handleOpenSaint(saint)}
                className={`relative rounded-xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-300 border ${
                  saint.unlocked
                    ? 'bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/20 border-amber-600/40 hover:scale-105 hover:border-amber-400 shadow-lg'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-50 hover:opacity-75'
                }`}
              >
                {/* Saint Icon Frame */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    saint.unlocked
                      ? 'bg-stone-900 border border-amber-400/80 shadow'
                      : 'bg-stone-950 border border-stone-800'
                  }`}
                >
                  {saint.unlocked ? (
                    getIcon(saint.iconName, true)
                  ) : (
                    <Lock className="w-4 h-4 text-stone-600" />
                  )}
                </div>

                <h4 className="font-serif font-bold text-xs text-amber-200 line-clamp-1">
                  {saint.name}
                </h4>

                <span className="text-[10px] text-stone-400 font-serif line-clamp-1 mt-0.5">
                  {saint.location}
                </span>

                <div className="mt-2 text-[10px]">
                  {saint.unlocked ? (
                    <span className="text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">
                      {saint.charismaName.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="text-stone-500">Bloqueado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SAINT DETAIL MODAL */}
      {selectedSaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stonebg-950/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-stonebg-900 border-2 border-amber-500/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedSaint(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-amber-200 rounded-full hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-950 border-2 border-amber-300 flex items-center justify-center shadow-lg flex-shrink-0">
                {getIcon(selectedSaint.iconName, selectedSaint.unlocked)}
              </div>
              <div>
                <span className="text-amber-500 font-serif text-xs font-semibold uppercase tracking-wider">
                  {selectedSaint.isApostle ? 'Apóstolo do Senhor' : 'Santo Mártir Contemporâneo'}
                </span>
                <h3 className="text-2xl font-serif font-bold text-amber-100">
                  {selectedSaint.name}
                </h3>
                <p className="text-xs text-amber-300/80 font-serif italic">
                  {selectedSaint.title}
                </p>
              </div>
            </div>

            {/* Historical Details */}
            <div className="space-y-2.5 text-xs text-stone-300 pt-2 border-t border-stone-800">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px] uppercase font-serif">Período Histórico</span>
                  <strong className="text-amber-200">{selectedSaint.historicalPeriod}</strong>
                </div>
                <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px] uppercase font-serif">Local do Ministério</span>
                  <strong className="text-amber-200">{selectedSaint.location}</strong>
                </div>
              </div>

              <div className="bg-stone-950 p-3 rounded border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-serif mb-1">Martírio Canônico</span>
                <p className="text-red-300/90 leading-relaxed font-serif">
                  {selectedSaint.martyrdom}
                </p>
              </div>

              <div className="bg-amber-950/30 p-3 rounded border border-amber-900/50">
                <span className="text-amber-400 block text-[10px] uppercase font-serif mb-1">Citação Litúrgica / Bíblica (Latim)</span>
                <p className="font-serif italic text-amber-200/90 text-sm">
                  "{selectedSaint.canonCitation}"
                </p>
              </div>

              {/* Charisma / Relic Buff */}
              <div className="bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 p-3 rounded-lg border border-amber-600/50">
                <div className="flex items-center gap-1.5 text-amber-400 font-serif font-bold text-xs mb-1">
                  <Award className="w-4 h-4" />
                  <span>Carisma Espiritual Concedido: {selectedSaint.charismaName}</span>
                </div>
                <p className="text-stone-300 text-xs">
                  {selectedSaint.charismaDescription}
                </p>
              </div>
            </div>

            {/* Action / Unlock test */}
            <div className="pt-2 flex justify-end gap-3">
              {!selectedSaint.unlocked && (
                <button
                  onClick={() => {
                    unlockSaint(selectedSaint.id);
                    setSelectedSaint({ ...selectedSaint, unlocked: true });
                  }}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif text-xs py-2 px-4 rounded-lg border border-amber-500/60 shadow transition"
                >
                  Desbloquear Manualmente no Retábulo
                </button>
              )}
              <button
                onClick={() => setSelectedSaint(null)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif text-xs py-2 px-4 rounded-lg border border-stone-700 transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

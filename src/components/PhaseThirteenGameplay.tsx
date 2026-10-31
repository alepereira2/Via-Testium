import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { DAMASCUS_ROAD_MAP } from '../game/damascusMapData';
import { ThirdPersonCanvas } from './ThirdPersonCanvas';
import { 
  Sparkles, 
  Sun, 
  CheckCircle2, 
  Gamepad2, 
  EyeOff, 
  ArrowRight, 
  MapPin,
  ListTodo
} from 'lucide-react';

type PlayStage = 'third_person_damascus' | 'mission_complete';

export const PhaseThirteenGameplay: React.FC = () => {
  const { completePhase, setCurrentView } = useGame();
  
  const [stage, setStage] = useState<PlayStage>('third_person_damascus');
  const [tensionBpm, setTensionBpm] = useState<number>(80);
  const [shekinahTriggered, setShekinahTriggered] = useState<boolean>(false);
  const [ananiasEncountered, setAnaniasEncountered] = useState<boolean>(false);

  const handleEscapeEvent = () => {
    soundEngine.playBellToll();
    completePhase(13);
    setStage('mission_complete');
  };

  const handleDenialEvent = (eventNum: number) => {
    // Used in Damascus for Shekinah and Ananias triggers
    if (eventNum === 1) {
      soundEngine.playShekinahGlory();
      setShekinahTriggered(true);
    } else if (eventNum === 2) {
      soundEngine.playBellToll();
      setAnaniasEncountered(true);
      completePhase(13);
      setStage('mission_complete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-purple-950/40 to-stone-950 border border-purple-900/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-serif text-xs uppercase tracking-widest font-semibold">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Fase 13 • Exploração em Terceira Pessoa</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-100">
            Paulo: O Prisioneiro de Cristo
          </h2>
          <p className="text-xs text-stone-300 font-serif italic mt-0.5">
            Mova Saulo pela estrada em direção a Damasco. Encontre a Luz da Shekinah e siga à Rua Direita.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Objective tracker */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-lg px-3 py-1.5 text-xs font-serif flex items-center gap-2">
            <ListTodo className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {shekinahTriggered ? 'Shekinah Revelada!' : 'Avançar na Estrada'}
            </span>
          </div>

          <button
            onClick={() => setCurrentView('map')}
            className="text-xs font-serif text-stone-400 hover:text-purple-300 px-3 py-1.5 rounded border border-stone-800 hover:bg-stone-900 transition"
          >
            Mapa da Campanha
          </button>
        </div>
      </div>

      {/* STAGE 1: THIRD PERSON DAMASCUS CANVAS */}
      {stage === 'third_person_damascus' && (
        <div className="space-y-4">
          <ThirdPersonCanvas
            worldData={DAMASCUS_ROAD_MAP}
            playerName="Saulo"
            playerRole="Fariseu de Tarso"
            playerColor="#d4a373"
            playerRobeColor="#334155"
            playerCloakColor="#1e293b"
            hasBeard={true}
            tensionBpm={tensionBpm}
            setTensionBpm={setTensionBpm}
            onDenialEvent={handleDenialEvent}
            onRoosterEvent={() => soundEngine.playShekinahGlory()}
            onEscapeEvent={handleEscapeEvent}
          />

          {/* Quick Objective Instructions */}
          <div className="bg-stonebg-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-stone-300">
              <strong className="text-purple-300 block font-serif">Objetivos na Terceira Pessoa:</strong>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-400">
                <span className="text-stone-300">
                  1. Mover-se para o leste pela estrada desértica de Damasco (WASD / Setas).
                </span>
                <span className="text-stone-300">
                  2. Aproximar-se do ponto da Teofania Celestial e interagir [E].
                </span>
                <span className="text-stone-300">
                  3. Atravessar os portões de Damasco até a Casa de Judas na Rua Direita.
                </span>
                <span className="text-stone-300">
                  4. Interagir com o discípulo Ananias para que as escamas caiam dos olhos!
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playShekinahGlory();
                setShekinahTriggered(true);
              }}
              className="flex-shrink-0 bg-purple-900 hover:bg-purple-800 text-purple-100 font-serif font-bold py-2 px-4 rounded-lg border border-purple-400 shadow transition"
            >
              Invocar Teofania da Luz
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: MISSION COMPLETE */}
      {stage === 'mission_complete' && (
        <div className="bg-stonebg-900 border-2 border-purple-500/80 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle2 className="w-10 h-10 text-purple-300" />
          </div>

          <div className="space-y-2">
            <span className="text-purple-400 font-serif tracking-widest text-xs uppercase font-bold">
              Fase 13 Concluída com Sucesso
            </span>
            <h3 className="text-3xl font-serif font-bold text-amber-100">
              O Vaso Escolhido das Nações
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Saulo recebeu o batismo e tornou-se <strong>Paulo de Tarso</strong>. Aquele que respirava ameaças e morte agora vive exclusivamente para o Cristo: <em>"Combati o bom combate, terminei a corrida, guardei a fé!"</em>. Seu testemunho e o de seus discípulos agora brilham no retábulo do <strong>Canon Romano</strong>!
            </p>
          </div>

          {/* Unlocked Saints Badges */}
          <div className="bg-stone-950/90 border border-purple-600/60 rounded-xl p-4 text-left space-y-2">
            <span className="text-xs font-serif text-purple-300 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Santos Adicionados ao Retábulo do Canon Romano:</span>
            </span>
            <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
              <li><strong className="text-amber-200">São Paulo de Tarso</strong> — O Doutor dos Gentios e Mártir das Três Fontes.</li>
              <li><strong className="text-amber-200">São Lino Papa</strong> — Segundo Bispo de Roma, sucessor de Pedro.</li>
              <li><strong className="text-amber-200">São Lucas Evangelista</strong> — O fiel médico amado e cronista sagrado.</li>
              <li><strong className="text-amber-200">São Timóteo e São Tito</strong> — Bispos primazes e filhos espirituais de Paulo.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setCurrentView('canon')}
              className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-purple-100 font-serif font-bold py-3 px-6 rounded-xl shadow-xl border border-purple-300 transition hover:scale-105"
            >
              Ver Mosaico no Canon Romano
            </button>
            <button
              onClick={() => setCurrentView('map')}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif py-3 px-6 rounded-xl border border-stone-700 transition"
            >
              Voltar ao Mapa da Campanha
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

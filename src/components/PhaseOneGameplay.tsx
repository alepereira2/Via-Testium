import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { CAIAPHAS_COURTYARD_MAP } from '../game/caiaphasMapData';
import { ThirdPersonCanvas } from './ThirdPersonCanvas';
import { 
  Flame, 
  Heart, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Sparkles,
  Gamepad2,
  ListTodo
} from 'lucide-react';

type PlayStage = 'third_person_courtyard' | 'empty_tomb' | 'tiberias_restoration' | 'mission_complete';

export const PhaseOneGameplay: React.FC = () => {
  const { completePhase, setCurrentView } = useGame();
  
  const [stage, setStage] = useState<PlayStage>('third_person_courtyard');
  const [tensionBpm, setTensionBpm] = useState<number>(75);
  const [denialsCount, setDenialsCount] = useState<number>(0);
  const [roosterCrowed, setRoosterCrowed] = useState<boolean>(false);
  const [tiberiasAnswersCount, setTiberiasAnswersCount] = useState<number>(0);

  const handleDenialEvent = (denialNumber: number) => {
    setDenialsCount(denialNumber);
  };

  const handleRoosterEvent = () => {
    setRoosterCrowed(true);
  };

  const handleEscapeEvent = () => {
    soundEngine.playBellToll();
    setStage('empty_tomb');
  };

  const handleTiberiasAnswer = () => {
    soundEngine.playBellToll();
    const next = tiberiasAnswersCount + 1;
    setTiberiasAnswersCount(next);

    if (next >= 3) {
      setStage('mission_complete');
      completePhase(1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border border-amber-900/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-serif text-xs uppercase tracking-widest font-semibold">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>Fase 1 • Exploração em Terceira Pessoa</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-100">
            Pedro: O Mestre e a Queda
          </h2>
          <p className="text-xs text-stone-300 font-serif italic mt-0.5">
            Mova Pedro pelo pátio com WASD ou Setas. Aqueça as mãos no braseiro [E] e enfrente as interrogações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mission Objective Tracker Pill */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-lg px-3 py-1.5 text-xs font-serif flex items-center gap-2">
            <ListTodo className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Negações: <strong className="text-red-400">{denialsCount} / 3</strong>
            </span>
            {roosterCrowed && (
              <span className="text-amber-400 font-bold ml-1">• Galo Cantou!</span>
            )}
          </div>

          <button
            onClick={() => setCurrentView('map')}
            className="text-xs font-serif text-stone-400 hover:text-amber-300 px-3 py-1.5 rounded border border-stone-800 hover:bg-stone-900 transition"
          >
            Mapa da Campanha
          </button>
        </div>
      </div>

      {/* STAGE 1: THIRD PERSON COURTYARD CANVAS */}
      {stage === 'third_person_courtyard' && (
        <div className="space-y-4">
          <ThirdPersonCanvas
            worldData={CAIAPHAS_COURTYARD_MAP}
            playerName="Pedro"
            playerRole="Pescador da Galileia"
            playerColor="#d4a373"
            playerRobeColor="#451a03"
            playerCloakColor="#78350f"
            hasBeard={true}
            tensionBpm={tensionBpm}
            setTensionBpm={setTensionBpm}
            onDenialEvent={handleDenialEvent}
            onRoosterEvent={handleRoosterEvent}
            onEscapeEvent={handleEscapeEvent}
          />

          {/* Quick Objective Instructions Box */}
          <div className="bg-stonebg-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-stone-300">
              <strong className="text-amber-300 block font-serif">Objetivos Ativos na Terceira Pessoa:</strong>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-400">
                <span className={denialsCount >= 1 ? 'text-emerald-400 line-through' : 'text-stone-300'}>
                  1. Aproximar-se do braseiro e responder à Criada do Portão.
                </span>
                <span className={denialsCount >= 2 ? 'text-emerald-400 line-through' : 'text-stone-300'}>
                  2. Conter as suspeitas do Parente de Malco perto das colunas.
                </span>
                <span className={roosterCrowed ? 'text-emerald-400 font-bold' : 'text-stone-300'}>
                  3. Testemunhar o canto do galo e o olhar de Cristo na galeria.
                </span>
                <span className="text-amber-400 font-semibold">
                  4. Fugir pelo portão inferior para o sepulcro vazio.
                </span>
              </div>
            </div>

            {/* Manual Skip/Advance button if needed */}
            {roosterCrowed && (
              <button
                onClick={handleEscapeEvent}
                className="flex-shrink-0 bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif font-bold py-2 px-4 rounded-lg border border-amber-400 shadow transition animate-pulse"
              >
                Sair do Pátio para o Sepulcro &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: O SEPULCRO VAZIO */}
      {stage === 'empty_tomb' && (
        <div className="bg-stonebg-900 border-2 border-stone-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <span className="text-amber-400 font-serif tracking-widest text-xs uppercase font-bold">
            Três Dias Depois • A Alvorada do Domingo de Páscoa
          </span>

          <h3 className="text-3xl font-serif font-bold text-amber-100">
            A Corrida ao Sepulcro Vazio
          </h3>

          <p className="text-stone-300 text-sm leading-relaxed">
            Pedro rompeu os portões do pátio e chorou amargamente nas trevas. Três dias depois, Maria Madalena chega ofegante: <em>"Tiraram o Senhor do sepulcro e não sabemos onde o puseram!"</em>. Pedro e João correm desesperados colina acima até adentrarem a câmara talhada em rocha.
          </p>

          <div className="bg-stone-950/80 border border-amber-600/40 p-4 rounded-xl text-amber-200 font-serif italic text-sm">
            "Pedro entrou no sepulcro e viu os lençóis postos no chão, e o lenço que estivera sobre a sua cabeça, não posto com os lençóis, mas enrolado num lugar à parte!"
          </div>

          <button
            onClick={() => {
              soundEngine.playParchmentClick();
              setStage('tiberias_restoration');
            }}
            className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif font-bold py-3 px-6 rounded-xl border border-amber-400/60 shadow-xl transition hover:scale-105"
          >
            Rumo ao Mar de Tiberíades (O Reencontro com o Ressuscitado)
          </button>
        </div>
      )}

      {/* STAGE 3: A RESTAURAÇÃO NO MAR DE TIBERÍADES */}
      {stage === 'tiberias_restoration' && (
        <div className="bg-stonebg-900 border-2 border-stone-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <span className="text-amber-400 font-serif tracking-widest text-xs uppercase font-bold">
            Mar da Galileia (Tiberíades) • A Fogueira na Praia
          </span>

          <h3 className="text-2xl font-serif font-bold text-amber-100">
            A Tríplice Pergunta do Amor
          </h3>

          <p className="text-stone-300 text-sm leading-relaxed">
            Após a pesca milagrosa dos 153 grandes peixes, Jesus reúne os apóstolos na praia ao amanhecer. Ele fita Simão Pedro e faz a pergunta que cicatriza as três feridas daquela madrugada sinistra:
          </p>

          <div className="bg-amber-950/40 border border-amber-600/60 p-5 rounded-xl space-y-2">
            <span className="text-xs text-amber-400 font-serif uppercase font-bold block">
              Jesus pergunta a Pedro ({tiberiasAnswersCount + 1}ª vez):
            </span>
            <p className="text-xl font-serif italic text-amber-200 font-bold">
              "Simão, filho de João, amas-me mais do que estes?"
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTiberiasAnswer}
              className="w-full bg-stone-950 hover:bg-amber-900/60 text-amber-200 border border-amber-500/60 font-serif py-3.5 px-6 rounded-xl transition hover:scale-102 shadow-lg"
            >
              "Senhor, Tu sabes todas as coisas; Tu bem sabes que eu Te amo!"
            </button>
            <span className="text-[11px] text-stone-400 italic block">
              Confissão de amor: {tiberiasAnswersCount} de 3
            </span>
          </div>
        </div>
      )}

      {/* STAGE 4: MISSION COMPLETE & CANON ROMANO UNLOCK */}
      {stage === 'mission_complete' && (
        <div className="bg-stonebg-900 border-2 border-emerald-500/80 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>

          <div className="space-y-2">
            <span className="text-emerald-400 font-serif tracking-widest text-xs uppercase font-bold">
              Fase 1 Concluída com Sucesso
            </span>
            <h3 className="text-3xl font-serif font-bold text-amber-100">
              O Pescador Reabilitado e Consagrado
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              Pedro recebeu a investidura eterna: <em>"Apascenta as minhas ovelhas"</em>. Seu testemunho de arrependimento e fé foi selado e seu retrato brilha agora com louvor no retábulo sagrado do <strong>Canon Romano</strong>!
            </p>
          </div>

          {/* Unlocked Saints Badges */}
          <div className="bg-stone-950/90 border border-amber-600/60 rounded-xl p-4 text-left space-y-2">
            <span className="text-xs font-serif text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Santos Adicionados ao Retábulo do Canon Romano:</span>
            </span>
            <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
              <li><strong className="text-amber-200">São Pedro Apóstolo</strong> — Consagrado como Rocha e Pastor Supremo.</li>
              <li><strong className="text-amber-200">São Dimas (O Bom Ladrão)</strong> — Mártir no Gólgota, primeiro habitante do Paraíso.</li>
              <li><strong className="text-amber-200">São Longino</strong> — O centurião que confessou o Filho de Deus ao pé da Cruz.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setCurrentView('canon')}
              className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-amber-100 font-serif font-bold py-3 px-6 rounded-xl shadow-xl border border-amber-300 transition hover:scale-105"
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

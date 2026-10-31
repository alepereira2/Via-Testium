import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { 
  Flame, 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  Eye, 
  Sparkles,
  Compass,
  RotateCcw
} from 'lucide-react';

type Step = 'courtyard_intro' | 'denial_1' | 'denial_2' | 'denial_3' | 'rooster_glance' | 'empty_tomb' | 'tiberias_restoration' | 'mission_complete';

export const PhaseOneGameplay: React.FC = () => {
  const { completePhase, setCurrentView, updateStats, playerStats } = useGame();
  
  const [step, setStep] = useState<Step>('courtyard_intro');
  const [heartbeatRate, setHeartbeatRate] = useState<number>(75);
  const [isBrazierCrackling, setIsBrazierCrackling] = useState<boolean>(true);
  const [peterResponse, setPeterResponse] = useState<string>('');
  const [tiberiasAnswersCount, setTiberiasAnswersCount] = useState<number>(0);

  // Heartbeat sound loop while in the courtyard
  useEffect(() => {
    if (['courtyard_intro', 'denial_1', 'denial_2', 'denial_3'].includes(step)) {
      const interval = setInterval(() => {
        soundEngine.playHeartbeat(heartbeatRate);
        if (Math.random() > 0.4) {
          soundEngine.playBrazierCrackle();
        }
      }, (60 / heartbeatRate) * 1000);
      return () => clearInterval(interval);
    }
  }, [step, heartbeatRate]);

  const handleStartDenials = () => {
    soundEngine.playParchmentClick();
    setStep('denial_1');
    setHeartbeatRate(90);
  };

  const handleDenialChoice = (choice: string, nextStep: Step, newHeartRate: number) => {
    soundEngine.playParchmentClick();
    setPeterResponse(choice);
    setHeartbeatRate(newHeartRate);
    setStep(nextStep);

    if (nextStep === 'rooster_glance') {
      soundEngine.playRoosterCrow();
    }
  };

  const handleTiberiasAnswer = () => {
    soundEngine.playBellToll();
    const next = tiberiasAnswersCount + 1;
    setTiberiasAnswersCount(next);

    if (next >= 3) {
      setStep('mission_complete');
      completePhase(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border border-amber-900/60 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-amber-500 font-serif text-xs uppercase tracking-widest font-semibold">
            Capítulo 1 • Campanha Canônica
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-100">
            Pedro: O Mestre e a Queda
          </h2>
        </div>
        <button
          onClick={() => setCurrentView('map')}
          className="text-xs font-serif text-stone-400 hover:text-amber-300 px-3 py-1.5 rounded border border-stone-800 hover:bg-stone-900 transition"
        >
          Retornar ao Mapa
        </button>
      </div>

      {/* Atmospheric Canvas / Playable Stage */}
      <div className="bg-stonebg-900 border-2 border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
        
        {/* SCENE 1: O PÁTIO DE CAIFÁS (INTRODUÇÃO) */}
        {step === 'courtyard_intro' && (
          <div className="space-y-6 my-auto text-center max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border-2 border-amber-500/80 flex items-center justify-center mx-auto shadow-inner">
              <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-amber-400/90 font-serif tracking-widest text-xs uppercase font-bold">
                Madrugada de Quinta para Sexta-feira Santa • Jerusalém
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100">
                O Pátio Interno do Palácio de Caifás
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Jesus foi preso no Getsêmani e conduzido às pressas ao tribunal do Sinédrio. Na madrugada gélida, Pedro segue de longe e entra no pátio, aquecendo as mãos trêmulas junto a uma fogueira de brasas de carvão.
              </p>
            </div>

            {/* Tension Indicator */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 inline-flex items-center gap-4 text-xs font-serif">
              <div className="flex items-center gap-2 text-red-400">
                <Heart className="w-5 h-5 fill-current animate-ping" />
                <span>Pulso de Tensão: <strong>{heartbeatRate} BPM</strong></span>
              </div>
              <div className="text-stone-400">
                Mantenha a compostura para não trair a confissão da fé.
              </div>
            </div>

            <div>
              <button
                onClick={handleStartDenials}
                className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif font-bold py-3 px-6 rounded-xl border border-amber-400/60 shadow-xl transition hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span>Aproximar-se do Braseiro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* DENIAL 1: A CRIADA */}
        {step === 'denial_1' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
              <span className="text-amber-400 font-serif">Primeira Interrogação</span>
              <span className="flex items-center gap-1 text-red-400 font-mono">
                <Heart className="w-3.5 h-3.5 fill-current" /> {heartbeatRate} BPM
              </span>
            </div>

            <div className="bg-stone-950/80 p-5 rounded-xl border border-amber-900/40 space-y-3">
              <span className="text-amber-500 font-serif text-xs font-bold uppercase">
                A Criada que guarda o portão (olhando fixamente para Pedro):
              </span>
              <p className="text-lg font-serif italic text-stone-200">
                "Tu também estavas com Jesus, o Nazareno! Tu és um deles!"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-stone-400 font-serif block">Como Pedro responde?</span>
              
              <button
                onClick={() => handleDenialChoice('Não o conheço, mulher; nem sei o que dizes.', 'denial_2', 110)}
                className="w-full text-left p-3.5 rounded-lg bg-stone-950 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-600/60 text-stone-200 text-sm font-serif transition"
              >
                <strong className="text-amber-400 block mb-0.5">Opção A (Esquiva Frágil):</strong>
                "Não o conheço, mulher; nem sei o que dizes..."
              </button>

              <button
                onClick={() => handleDenialChoice('Por que me interrogas no escuro com falsidades?', 'denial_2', 125)}
                className="w-full text-left p-3.5 rounded-lg bg-stone-950 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-600/60 text-stone-200 text-sm font-serif transition"
              >
                <strong className="text-amber-400 block mb-0.5">Opção B (Defesa Irritada):</strong>
                "Por que me interrogas no escuro? Deixa-me aquecer em paz!"
              </button>
            </div>
          </div>
        )}

        {/* DENIAL 2: O PARENTE DE MALCO */}
        {step === 'denial_2' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
              <span className="text-amber-400 font-serif">Segunda Interrogação • Tensão Elevada</span>
              <span className="flex items-center gap-1 text-red-400 font-mono">
                <Heart className="w-3.5 h-3.5 fill-current animate-ping" /> {heartbeatRate} BPM
              </span>
            </div>

            <div className="bg-stone-950/80 p-5 rounded-xl border border-red-900/50 space-y-3">
              <span className="text-red-400 font-serif text-xs font-bold uppercase">
                O Servo do Sumo Sacerdote (Parente de Malco):
              </span>
              <p className="text-lg font-serif italic text-stone-200">
                "Não te vi eu com ele no jardim das oliveiras? O teu próprio sotaque galileu te denuncia! Não há como ocultares a tua origem entre nós!"
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDenialChoice('Homem, eu não sou um deles! Nunca estive com ele no horto!', 'denial_3', 140)}
                className="w-full text-left p-3.5 rounded-lg bg-stone-950 hover:bg-red-950/60 border border-stone-800 hover:border-red-600/60 text-stone-200 text-sm font-serif transition"
              >
                <strong className="text-red-400 block mb-0.5">Negativa Enfática com Juramento:</strong>
                "Homem, eu não sou um deles! Nunca estive com esse homem no horto!"
              </button>
            </div>
          </div>
        )}

        {/* DENIAL 3: A ACUSAÇÃO GERAL DOS GUARDAS */}
        {step === 'denial_3' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
              <span className="text-amber-400 font-serif">Terceira Interrogação • Clímax da Queda</span>
              <span className="flex items-center gap-1 text-red-500 font-mono font-bold animate-pulse">
                <Heart className="w-4 h-4 fill-current animate-ping" /> {heartbeatRate} BPM
              </span>
            </div>

            <div className="bg-stone-950/90 p-5 rounded-xl border-2 border-red-600/80 space-y-3">
              <span className="text-red-500 font-serif text-xs font-bold uppercase">
                Os Soldados do Templo (cercando Pedro com as mãos nas espadas):
              </span>
              <p className="text-xl font-serif italic text-stone-100">
                "Certamente tu és um dos seguidores daquele blasfemador! Tu estavas empunhando uma lâmina no olival! Confessa agora!"
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDenialChoice('Praguejando e jurando: "Não conheço este homem de quem falais!"', 'rooster_glance', 160)}
                className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-red-950/80 to-stone-950 border-2 border-red-500 text-amber-100 font-serif shadow-xl hover:scale-[1.01] transition"
              >
                <strong className="text-red-300 block mb-1">A Tríplice Negação (Praguejando):</strong>
                "Que o Céu me amaldiçoe se estou mentindo! Eu não conheço nem sei quem é esse homem!"
              </button>
            </div>
          </div>
        )}

        {/* O CANTO DO GALO E O OLHAR DE CRISTO */}
        {step === 'rooster_glance' && (
          <div className="space-y-6 my-auto text-center max-w-2xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 font-serif text-xs uppercase tracking-widest font-bold">
              <span>* COCORICÓ! * O Canto do Galo Rompe a Madrugada</span>
            </div>

            {/* Christ's Glance Card */}
            <div className="bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-400 flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-amber-300" />
              </div>

              <h4 className="text-2xl font-serif font-bold text-amber-100">
                O Olhar Silencioso do Senhor
              </h4>

              <p className="text-stone-300 text-sm leading-relaxed italic font-serif">
                "E, virando-se o Senhor, olhou para Pedro. E Pedro lembrou-se da palavra do Senhor, como lhe havia dito: Antes que o galo cante hoje, três vezes me negarás."
              </p>

              <div className="border-t border-stone-800 pt-3 text-xs text-stone-400 leading-relaxed">
                Não havia condenação nos olhos de Jesus; apenas um amor infinito, doloroso e restaurador. O coração de Pedro quebrou-se em pedaços. Saindo para fora da mansão, Pedro chorou amargamente sob as oliveiras de Jerusalém.
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  soundEngine.playBellToll();
                  setStep('empty_tomb');
                }}
                className="bg-stone-800 hover:bg-stone-700 text-amber-200 font-serif py-3 px-6 rounded-xl border border-amber-600/40 shadow transition hover:scale-105"
              >
                Avançar: A Manhã do Domingo e a Corrida ao Sepulcro
              </button>
            </div>
          </div>
        )}

        {/* SCENE 2: O SEPULCRO VAZIO */}
        {step === 'empty_tomb' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in text-center">
            <span className="text-amber-400 font-serif tracking-widest text-xs uppercase font-bold">
              Três Dias Depois • A Alvorada do Primeiro Dia
            </span>

            <h3 className="text-3xl font-serif font-bold text-amber-100">
              A Corrida ao Sepulcro Vazio
            </h3>

            <p className="text-stone-300 text-sm leading-relaxed">
              Maria Madalena corre aos discípulos anunciando: <em>"Tiraram o Senhor do sepulcro e não sabemos onde o puseram!"</em>. Pedro e João correm desesperados colina acima. Pedro entra primeiro no túmulo e contempla os lençóis de linho caídos no chão e o sudário dobrado num lugar à parte.
            </p>

            <div className="bg-stone-950/80 border border-amber-600/40 p-4 rounded-xl text-amber-200 font-serif italic text-sm">
              "Ele não está aqui; ressuscitou, como havia dito!"
            </div>

            <button
              onClick={() => {
                soundEngine.playParchmentClick();
                setStep('tiberias_restoration');
              }}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif font-bold py-3 px-6 rounded-xl border border-amber-400/60 shadow-xl transition hover:scale-105"
            >
              Rumo ao Mar de Tiberíades (O Reencontro com o Ressuscitado)
            </button>
          </div>
        )}

        {/* SCENE 3: A RESTAURAÇÃO NO LAGO DE TIBERÍADES */}
        {step === 'tiberias_restoration' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in text-center">
            <span className="text-amber-400 font-serif tracking-widest text-xs uppercase font-bold">
              Mar da Galileia (Tiberíades) • A Fogueira na Praia
            </span>

            <h3 className="text-2xl font-serif font-bold text-amber-100">
              A Tríplice Pergunta do Amor
            </h3>

            <p className="text-stone-300 text-sm leading-relaxed">
              Após a pesca milagrosa dos 153 grandes peixes, Jesus convida os discípulos a comer à beira do lago. Ele fixa o olhar em Simão Pedro e faz a pergunta que desfaz as três negações daquela noite sinistra.
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
                Resposta de confissão: {tiberiasAnswersCount} de 3
              </span>
            </div>
          </div>
        )}

        {/* MISSION COMPLETE & CANON ROMANO UNLOCK */}
        {step === 'mission_complete' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in text-center">
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
                Pedro recebeu o mandato eterno: <em>"Apascenta as minhas ovelhas"</em>. Seu testemunho de arrependimento e fé foi selado e seu retrato agora brilha com louvor no retábulo sagrado do <strong>Canon Romano</strong>!
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
    </div>
  );
};

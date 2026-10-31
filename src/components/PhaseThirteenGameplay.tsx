import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { 
  Sparkles, 
  Sun, 
  CheckCircle2, 
  EyeOff, 
  ArrowRight, 
  Volume2, 
  Scroll, 
  MapPin 
} from 'lucide-react';

type Step = 'damascus_march' | 'shekinah_flash' | 'divine_dialogue' | 'blind_walk' | 'ananias_scales' | 'mission_complete';

export const PhaseThirteenGameplay: React.FC = () => {
  const { completePhase, setCurrentView, unlockSaint } = useGame();
  
  const [step, setStep] = useState<Step>('damascus_march');
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);
  const [isBlinded, setIsBlinded] = useState<boolean>(false);

  const handleTriggerShekinah = () => {
    soundEngine.playShekinahGlory();
    setStep('shekinah_flash');
    setIsBlinded(true);

    setTimeout(() => {
      setStep('divine_dialogue');
    }, 2800);
  };

  const handleNextDialogue = () => {
    soundEngine.playParchmentClick();
    if (dialogueIndex < 2) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setStep('blind_walk');
    }
  };

  const handleAnaniasPrayer = () => {
    soundEngine.playBellToll();
    setStep('ananias_scales');
    setIsBlinded(false);

    setTimeout(() => {
      setStep('mission_complete');
      completePhase(13);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-purple-950/40 to-stone-950 border border-purple-900/60 rounded-xl p-4 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-purple-400 font-serif text-xs uppercase tracking-widest font-semibold">
            Capítulo 13 • O Vaso Escolhido
          </span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-100">
            Paulo: O Perseguidor que se Fez Prisioneiro de Cristo
          </h2>
        </div>
        <button
          onClick={() => setCurrentView('map')}
          className="text-xs font-serif text-stone-400 hover:text-purple-300 px-3 py-1.5 rounded border border-stone-800 hover:bg-stone-900 transition"
        >
          Retornar ao Mapa
        </button>
      </div>

      {/* Main Playable Stage */}
      <div
        className={`border-2 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between transition-all duration-700 ${
          step === 'shekinah_flash'
            ? 'bg-white border-yellow-200'
            : isBlinded
            ? 'bg-stone-950 border-purple-900/50'
            : 'bg-stonebg-900 border-stone-800'
        }`}
      >
        
        {/* STEP 1: A MARCHA EM DIREÇÃO A DAMASCO */}
        {step === 'damascus_march' && (
          <div className="space-y-6 my-auto text-center max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-purple-950/80 border-2 border-purple-500/80 flex items-center justify-center mx-auto shadow-inner">
              <Sun className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '30s' }} />
            </div>

            <div className="space-y-2">
              <span className="text-purple-400 font-serif tracking-widest text-xs uppercase font-bold">
                Meio-Dia Solar • Estrada de Damasco (Síria)
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100">
                Saulo, o Fiel Fariseu e Zelote da Lei
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Portando cartas lacradas pelo Sumo Sacerdote de Jerusalém, Saulo cavalga com soldados mercenários rumo a Damasco para prender todos os homens e mulheres fiéis ao "Caminho". O sangue de Estêvão ainda ecoa em sua mente.
              </p>
            </div>

            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 text-xs font-serif text-stone-300 text-left space-y-1">
              <div className="text-amber-400 font-bold">Ordens Sumárias do Sinédrio:</div>
              <p className="text-stone-400 italic">
                "Arrastai com correntes qualquer um que profira o nome do Nazareno em Damasco e trazei-os a Jerusalém para julgamento."
              </p>
            </div>

            <div>
              <button
                onClick={handleTriggerShekinah}
                className="bg-gradient-to-r from-purple-800 to-purple-950 hover:from-purple-700 hover:to-purple-900 text-purple-100 font-serif font-bold py-3 px-6 rounded-xl border border-purple-400/60 shadow-xl transition hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>Aproximar-se dos Muros de Damasco</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SHEKINAH FLASH (BLINDING LIGHT) */}
        {step === 'shekinah_flash' && (
          <div className="my-auto text-center space-y-4 animate-ping">
            <h2 className="text-4xl md:text-6xl font-serif font-black text-amber-600 tracking-widest uppercase">
              SHEKINAH
            </h2>
            <p className="text-stone-800 font-serif text-sm font-bold">
              Uma luz do céu, mais resplandecente que o sol do meio-dia, cerca Saulo e os seus companheiros!
            </p>
          </div>
        )}

        {/* STEP 3: O DIÁLOGO DA TEOFANIA */}
        {step === 'divine_dialogue' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between text-xs text-purple-400 border-b border-purple-900/60 pb-2">
              <span className="font-serif uppercase tracking-wider font-bold">A Teofania Celestial</span>
              <span className="flex items-center gap-1 text-yellow-400">
                <EyeOff className="w-4 h-4" /> Cegueira Espiritual & Física
              </span>
            </div>

            {dialogueIndex === 0 && (
              <div className="space-y-4 text-center">
                <div className="bg-stone-900/90 border-2 border-yellow-500/60 p-6 rounded-2xl shadow-2xl space-y-3">
                  <span className="text-yellow-400 font-serif text-xs uppercase tracking-widest font-bold block">
                    Voz em Língua Hebraica que Emana dos Céus:
                  </span>
                  <p className="text-2xl font-serif italic text-yellow-100 font-bold">
                    "Sha'ul, Sha'ul... Lamah tird'feni?"
                  </p>
                  <p className="text-stone-300 text-sm italic font-serif">
                    ("Saulo, Saulo... Por que me persegues?")
                  </p>
                </div>

                <button
                  onClick={handleNextDialogue}
                  className="bg-stone-950 hover:bg-stone-900 text-amber-200 border border-amber-600/60 font-serif py-3 px-6 rounded-xl transition hover:scale-105 shadow-lg"
                >
                  Saulo, caído no pó da terra, responde: <em>"Quem és Tu, Senhor?"</em>
                </button>
              </div>
            )}

            {dialogueIndex === 1 && (
              <div className="space-y-4 text-center">
                <div className="bg-stone-900/90 border-2 border-yellow-500/60 p-6 rounded-2xl shadow-2xl space-y-3">
                  <span className="text-yellow-400 font-serif text-xs uppercase tracking-widest font-bold block">
                    O Senhor Responde com Majestade Serena:
                  </span>
                  <p className="text-xl font-serif italic text-amber-100 font-bold">
                    "Eu sou Jesus, a quem tu persegues. Duro te é recalcitrar contra os aguilhões."
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed font-serif pt-2 border-t border-stone-800">
                    A imagem do apedrejamento de Estêvão e o rosto manso dos crentes atravessam a alma de Saulo como uma espada. O orgulho da carne é desfeito em cinzas.
                  </p>
                </div>

                <button
                  onClick={handleNextDialogue}
                  className="bg-stone-950 hover:bg-stone-900 text-amber-200 border border-amber-600/60 font-serif py-3 px-6 rounded-xl transition hover:scale-105 shadow-lg"
                >
                  Tremendo e atônito, Saulo clama: <em>"Senhor, que queres que eu faça?"</em>
                </button>
              </div>
            )}

            {dialogueIndex === 2 && (
              <div className="space-y-4 text-center">
                <div className="bg-stone-900/90 border-2 border-yellow-500/60 p-6 rounded-2xl shadow-2xl space-y-3">
                  <span className="text-yellow-400 font-serif text-xs uppercase tracking-widest font-bold block">
                    O Mandato do Senhor Jesus:
                  </span>
                  <p className="text-lg font-serif italic text-stone-200">
                    "Levanta-te, e entra na cidade de Damasco; e ali te será dito o que deves fazer. Pois Eu te escolhi como vaso para levar o meu Nome perante os gentios, e reis, e os filhos de Israel."
                  </p>
                </div>

                <button
                  onClick={handleNextDialogue}
                  className="bg-purple-800 hover:bg-purple-700 text-purple-100 font-serif font-bold py-3 px-6 rounded-xl border border-purple-400 transition hover:scale-105 shadow-xl"
                >
                  A Luz cessa. Levantar-se às cegas guiado pelas mãos dos soldados.
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: A CAMINHADA CEGA PELA RUA DIREITA */}
        {step === 'blind_walk' && (
          <div className="space-y-6 my-auto text-center max-w-2xl mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center mx-auto">
              <EyeOff className="w-8 h-8 text-stone-500" />
            </div>

            <div className="space-y-2">
              <span className="text-purple-400 font-serif tracking-widest text-xs uppercase font-bold">
                Três Dias em Damasco • Sem Ver, Sem Comer nem Beber
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100">
                A Casa de Judas na Rua Direita
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                O outrora terrível inquisidor de Jerusalém agora jaz prostrado no escuro, em jejum e oração ininterruptos. A perseguição acabou; a redenção começou. O discípulo Ananias é enviado pelo Espírito para impor as mãos sobre ele.
              </p>
            </div>

            <button
              onClick={handleAnaniasPrayer}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-serif font-bold py-3 px-6 rounded-xl border border-amber-400/60 shadow-xl transition hover:scale-105"
            >
              Acolher Ananias e a Imposição das Mãos
            </button>
          </div>
        )}

        {/* STEP 5: AS ESCAMAS CAEM DOS OLHOS */}
        {step === 'ananias_scales' && (
          <div className="my-auto text-center space-y-4 animate-fade-in max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-serif font-bold text-amber-200">
              "Irmão Saulo, o Senhor Jesus me enviou..."
            </h3>
            <p className="text-stone-300 text-sm font-serif italic">
              "E logo lhe caíram dos olhos como que umas escamas, e recuperou a vista; e, levantando-se, foi batizado!"
            </p>
          </div>
        )}

        {/* STEP 6: MISSION COMPLETE & CANON ROMANO UNLOCK */}
        {step === 'mission_complete' && (
          <div className="space-y-6 my-auto max-w-2xl mx-auto animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
            </div>

            <div className="space-y-2">
              <span className="text-emerald-400 font-serif tracking-widest text-xs uppercase font-bold">
                Fase 13 Concluída com Sucesso
              </span>
              <h3 className="text-3xl font-serif font-bold text-amber-100">
                O Vaso Escolhido das Nações
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Saulo torna-se <strong>Paulo</strong>, o Apóstolo dos Gentios. Das sinagogas de Damasco às Três Fontes de Roma, seu testemunho transformará para sempre o destino do Império Romano e do mundo!
              </p>
            </div>

            {/* Unlocked Saints Badges */}
            <div className="bg-stone-950/90 border border-purple-600/60 rounded-xl p-4 text-left space-y-2">
              <span className="text-xs font-serif text-purple-300 font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Santos Adicionados ao Retábulo do Canon Romano:</span>
              </span>
              <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                <li><strong className="text-amber-200">São Paulo de Tarso</strong> — O Doutor das Nações e Mártir da Via Laurentina.</li>
                <li><strong className="text-amber-200">São Lino Papa</strong> — Segundo Bispo de Roma, sucessor de Pedro.</li>
                <li><strong className="text-amber-200">São Lucas Evangelista</strong> — O fiel médico e autor de Atos dos Apóstolos.</li>
                <li><strong className="text-amber-200">São Timóteo e São Tito</strong> — Bispos pioneiros e filhos espirituais de Paulo.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setCurrentView('canon')}
                className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-purple-100 font-serif font-bold py-3 px-6 rounded-xl shadow-xl border border-purple-300 transition hover:scale-105"
              >
                Ver Novos Santos no Canon Romano
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-serif py-3 px-6 rounded-xl border border-stone-700 transition"
              >
                Retornar ao Mapa da Campanha
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../audio/soundEngine';
import { 
  Home, 
  Users, 
  Flame, 
  ShieldAlert, 
  Heart, 
  Sparkles, 
  Scroll, 
  Utensils, 
  Bell, 
  CheckCircle 
} from 'lucide-react';

export const DomusEcclesiaeView: React.FC = () => {
  const { playerStats, updateStats } = useGame();
  const [log, setLog] = useState<string[]>([
    'A assembleia reuniu-se ao pôr do sol na casa de Maria, mãe de Marcos.',
    'Os irmãos compartilharam o pão e as preces em memória do Senhor.',
  ]);

  const addLog = (msg: string) => {
    setLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  // Action 1: Diakonia (Distribute Bread)
  const handleDistributeBread = () => {
    if (playerStats.breadRations < 20) {
      alert('Rações insuficientes! É necessário recolher donativos dos irmãos.');
      return;
    }
    soundEngine.playParchmentClick();
    updateStats({
      breadRations: playerStats.breadRations - 20,
      communitySpes: Math.min(100, playerStats.communitySpes + 15),
      kerygmaCaritas: playerStats.kerygmaCaritas + 5,
    });
    addLog('Diakonia: 20 rações de pão distribuídas para viúvas e órfãos. A moral do rebanho cresceu (+15 Spes).');
  };

  // Action 2: Fasting & Vigilia (Restore Pneuma)
  const handleVigiliaPrayer = () => {
    soundEngine.playBellToll();
    updateStats({
      pneuma: Math.min(100, playerStats.pneuma + 25),
      alertZelos: Math.max(0, playerStats.alertZelos - 5),
    });
    addLog('Vigília Noturna: A congregação jejuou e orou com lágrimas. O Pneuma foi renovado (+25 Fé).');
  };

  // Action 3: Catacomb Stealth (Reduce Roman Alert)
  const handleCatacombStealth = () => {
    soundEngine.playParchmentClick();
    updateStats({
      alertMaiestas: Math.max(0, playerStats.alertMaiestas - 20),
      alertZelos: Math.max(0, playerStats.alertZelos - 15),
    });
    addLog('Ocultação Clandestina: O sinal do Ichthys (peixe) foi marcado em segredo. As patrulhas romanas foram despistadas.');
  };

  // Action 4: Instruct Catechumens
  const handleInstructCatechumens = () => {
    soundEngine.playParchmentClick();
    updateStats({
      kerygmaLogos: playerStats.kerygmaLogos + 10,
      breadRations: playerStats.breadRations + 30, // new converts bring donations
    });
    addLog('Catequese Apostólica: Novos discípulos batizados no rio. A comunidade recebeu doações fraternas (+30 Pães).');
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-amber-950/40 border border-amber-900/40 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-serif text-xs font-semibold uppercase tracking-widest">
            <Home className="w-4 h-4" />
            <span>Gestão Comunitária Primitiva (Koinonia & Diakonia)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-100 mt-1">
            A Casa-Igreja (*Domus Ecclesiae*)
          </h2>
          <p className="text-stone-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            Antes de basílicas e catedrais de pedra, a Igreja do Senhor reunia-se clandestinamente nas casas dos crentes. Administre a partilha de pão, acolha fugitivos e mantenha o fogo do Espírito aceso sem atrair a fúria das legiões.
          </p>
        </div>

        <div className="flex-shrink-0 bg-stone-950/80 border border-stone-800 p-3 rounded-lg text-xs font-serif text-stone-300 space-y-1">
          <div className="text-amber-400 font-bold">Local Atual:</div>
          <div>Cenáculo de Jerusalém</div>
          <div className="text-[11px] text-stone-500">Sob jurisdição do Bispo Tiago</div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-stonebg-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-serif">
            <span>Rações de Pão</span>
            <Utensils className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-200">
            {playerStats.breadRations}
          </div>
          <span className="text-[10px] text-stone-500">Para viúvas e necessitados</span>
        </div>

        <div className="bg-stonebg-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-serif">
            <span>Moral da Igreja (Spes)</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-200">
            {playerStats.communitySpes}%
          </div>
          <span className="text-[10px] text-stone-500">Resistência contra a apostasia</span>
        </div>

        <div className="bg-stonebg-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-serif">
            <span>Graça Espiritual</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {playerStats.pneuma}/100
          </div>
          <span className="text-[10px] text-stone-500">Poder de oração e milagres</span>
        </div>

        <div className="bg-stonebg-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-serif">
            <span>Alerta de Perseguição</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-300">
            {playerStats.alertMaiestas}%
          </div>
          <span className="text-[10px] text-stone-500">Vigilância de legionários</span>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="bg-stonebg-900 border border-amber-900/40 rounded-xl p-5 shadow-2xl space-y-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
          <Scroll className="w-4 h-4" />
          <span>Decisões Pastorais e Comunitárias</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <button
            onClick={handleDistributeBread}
            className="p-4 rounded-lg bg-stone-950 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-amber-200 text-sm font-serif group-hover:text-amber-300">
                1. Partilha do Pão (Diakonia)
              </strong>
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                -20 Pães
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Socorrer viúvas, órfãos e leprosos da cidade. Fortalece a comunhão fraterna (+15 Spes).
            </p>
          </button>

          <button
            onClick={handleVigiliaPrayer}
            className="p-4 rounded-lg bg-stone-950 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-amber-200 text-sm font-serif group-hover:text-amber-300">
                2. Vigília de Oração e Jejum
              </strong>
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                +25 Pneuma
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Prostrar-se em oração comunitária até o raiar do dia. Renova o Espírito Santo e purifica os temores.
            </p>
          </button>

          <button
            onClick={handleCatacombStealth}
            className="p-4 rounded-lg bg-stone-950 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-amber-200 text-sm font-serif group-hover:text-amber-300">
                3. Ocultação nas Catacumbas (Ichthys)
              </strong>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                -20% Alerta
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Mudar o ponto de encontro para as galerias subterrâneas. Despista espiões e soldados de Roma.
            </p>
          </button>

          <button
            onClick={handleInstructCatechumens}
            className="p-4 rounded-lg bg-stone-950 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 text-left transition space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-amber-200 text-sm font-serif group-hover:text-amber-300">
                4. Batismo de Novos Neófitos
              </strong>
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                +30 Pães
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Instruir convertidos na doutrina apostólica. Aumenta a sabedoria da fé (*Logos*) e traz donativos.
            </p>
          </button>

        </div>
      </div>

      {/* Chronicle Log */}
      <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-serif uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Crônica da Comunidade</span>
        </h4>
        <div className="space-y-1.5">
          {log.map((entry, idx) => (
            <div key={idx} className="text-xs text-stone-300 flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>{entry}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

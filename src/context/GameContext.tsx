import React, { createContext, useContext, useState, useEffect } from 'react';
import { PhaseId, PlayerStats, Saint, PhaseData } from '../types/game';
import { PHASES_DATA } from '../data/phasesData';
import { INITIAL_SAINTS } from '../data/saintsData';
import { soundEngine } from '../audio/soundEngine';

export type GameView = 'map' | 'phase1' | 'phase13' | 'canon' | 'house_church' | 'about';

interface GameContextType {
  currentView: GameView;
  setCurrentView: (view: GameView) => void;
  selectedPhaseId: PhaseId;
  setSelectedPhaseId: (id: PhaseId) => void;
  phases: PhaseData[];
  saints: Saint[];
  playerStats: PlayerStats;
  isMuted: boolean;
  toggleMute: () => void;
  unlockSaint: (saintId: string) => void;
  completePhase: (phaseId: PhaseId) => void;
  updateStats: (partial: Partial<PlayerStats>) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'via_testium_save_v1';

const defaultStats: PlayerStats = {
  pneuma: 85,
  kerygmaLogos: 40,
  kerygmaApologia: 35,
  kerygmaCaritas: 50,
  alertZelos: 25,
  alertMaiestas: 30,
  communitySpes: 75,
  breadRations: 120,
  completedPhases: [],
  activeCharismata: ['Confessio Fidei (Rocha Inabalável)'],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<GameView>('map');
  const [selectedPhaseId, setSelectedPhaseId] = useState<PhaseId>(1);
  const [phases, setPhases] = useState<PhaseData[]>(PHASES_DATA);
  const [saints, setSaints] = useState<Saint[]>(INITIAL_SAINTS);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(defaultStats);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.playerStats) setPlayerStats(parsed.playerStats);
        if (parsed.saints) setSaints(parsed.saints);
        if (parsed.phases) setPhases(parsed.phases);
      }
    } catch (e) {
      console.warn('Could not read savegame from localStorage', e);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          playerStats,
          saints,
          phases,
        })
      );
    } catch (e) {
      console.warn('Could not persist savegame', e);
    }
  }, [playerStats, saints, phases]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const unlockSaint = (saintId: string) => {
    setSaints((prev) =>
      prev.map((s) => (s.id === saintId ? { ...s, unlocked: true } : s))
    );
    soundEngine.playBellToll();
  };

  const completePhase = (phaseId: PhaseId) => {
    // Mark phase completed
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) return { ...p, status: 'completed' };
        if (p.id === phaseId + 1) return { ...p, status: 'unlocked' };
        return p;
      })
    );

    // Unlock corresponding saints for that phase
    const phase = phases.find((p) => p.id === phaseId);
    if (phase) {
      setSaints((prev) =>
        prev.map((s) =>
          phase.unlockedSaints.includes(s.id) ? { ...s, unlocked: true } : s
        )
      );
    }

    setPlayerStats((prev) => ({
      ...prev,
      completedPhases: Array.from(new Set([...prev.completedPhases, phaseId])),
      pneuma: Math.min(100, prev.pneuma + 20),
      communitySpes: Math.min(100, prev.communitySpes + 15),
    }));

    soundEngine.playBellToll();
  };

  const updateStats = (partial: Partial<PlayerStats>) => {
    setPlayerStats((prev) => ({ ...prev, ...partial }));
  };

  const resetProgress = () => {
    setPhases(PHASES_DATA);
    setSaints(INITIAL_SAINTS);
    setPlayerStats(defaultStats);
    setCurrentView('map');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <GameContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedPhaseId,
        setSelectedPhaseId,
        phases,
        saints,
        playerStats,
        isMuted,
        toggleMute,
        unlockSaint,
        completePhase,
        updateStats,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

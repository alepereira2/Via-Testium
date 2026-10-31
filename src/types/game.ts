export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface PhaseObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Saint {
  id: string;
  name: string;
  title: string;
  historicalPeriod: string;
  location: string;
  martyrdom: string;
  canonCitation: string;
  charismaName: string;
  charismaDescription: string;
  isApostle: boolean;
  unlocked: boolean;
  iconName: string;
}

export interface PhaseData {
  id: PhaseId;
  title: string;
  subtitle: string;
  protagonist: string;
  period: string;
  region: string;
  coordinates: { x: number; y: number }; // Percentage on map (0-100)
  visualSetting: string;
  narrativeConflict: string;
  coreObjective: string;
  scriptureQuote: string;
  unlockedSaints: string[]; // Saint IDs
  status: 'locked' | 'unlocked' | 'completed';
}

export interface PlayerStats {
  pneuma: number; // 0 to 100 (Faith / Grace points)
  kerygmaLogos: number; // Scriptural knowledge
  kerygmaApologia: number; // Rational argumentation
  kerygmaCaritas: number; // Works of mercy
  alertZelos: number; // Sanhedrin alert level (0 to 100)
  alertMaiestas: number; // Roman alert level (0 to 100)
  communitySpes: number; // House-church morale (0 to 100)
  breadRations: number; // Sustenance for widows and orphans
  completedPhases: PhaseId[];
  activeCharismata: string[]; // Active Saint relics
}

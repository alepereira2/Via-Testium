// Types for the 3rd-Person Exploration Engine

export interface Vector2D {
  x: number;
  y: number;
}

export interface RectCollider {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export interface CharacterEntity {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  radius: number;
  facing: FacingDirection;
  color: string;
  robeColor: string;
  cloakColor?: string;
  hasBeard?: boolean;
  hasTorch?: boolean;
  hasSpear?: boolean;
  isPatrolling?: boolean;
  patrolPoints?: Vector2D[];
  currentPatrolIndex?: number;
  speed: number;
  detectionRadius?: number; // Alert cone / radius
  detectionAngle?: number;
  interactionRadius: number;
  dialogueId?: string;
  barkText?: string;
  barkTimer?: number;
}

export interface MapProp {
  id: string;
  type: 'brazier' | 'column' | 'wall' | 'bench' | 'archway' | 'stairs' | 'amphora' | 'gate' | 'tree';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  lightRadius?: number;
  lightColor?: string;
  interactive?: boolean;
  interactPrompt?: string;
  solid: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole: string;
  speakerColor: string;
  text: string;
  options: {
    label: string;
    description?: string;
    nextDialogueId?: string;
    triggerAction?: string;
  }[];
}

export interface MapWorldData {
  id: string;
  name: string;
  region: string;
  year: string;
  ambientLight: string; // e.g. '#070b14' for night, '#fff4d6' for midday
  width: number;
  height: number;
  spawnPoint: Vector2D;
  cameraBounds: { minX: number; maxX: number; minY: number; maxY: number };
  walls: RectCollider[];
  props: MapProp[];
  npcs: CharacterEntity[];
  dialogues: Record<string, DialogueNode>;
}

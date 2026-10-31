import { MapWorldData } from './types';

export const DAMASCUS_ROAD_MAP: MapWorldData = {
  id: 'damascus_road',
  name: 'Estrada e Portões de Damasco',
  region: 'Província da Síria',
  year: '34 d.C. (Meio-Dia Solar)',
  ambientLight: 'rgba(255, 250, 235, 0.05)', // Bright desert sunlight
  brightnessFactor: 1.2,
  width: 1500,
  height: 900,
  spawnPoint: { x: 200, y: 450 }, // On the desert highway approaching the city
  cameraBounds: { minX: 0, maxX: 1500, minY: 0, maxY: 900 },

  walls: [
    // Damascus City Outer Walls (East side)
    { x: 1050, y: 50, width: 35, height: 350 }, // North section of city wall
    { x: 1050, y: 520, width: 35, height: 350 }, // South section of city wall
    // Straight Street (Via Recta) buildings inside Damascus
    { x: 1150, y: 150, width: 280, height: 220 },
    { x: 1150, y: 530, width: 280, height: 220 },
  ],

  props: [
    // Roman Milestone (Milliarium)
    {
      id: 'roman_milestone',
      type: 'column',
      x: 350,
      y: 380,
      width: 28,
      height: 44,
      solid: true,
      interactive: true,
      interactPrompt: 'Inspecionar Marco de Milha Romano [E]',
    },

    // Desert Oasis & Palms
    {
      id: 'oasis_palms_1',
      type: 'tree',
      x: 650,
      y: 200,
      width: 50,
      height: 50,
      solid: false,
      lightRadius: 120,
      lightColor: '#fbbf24',
    },
    {
      id: 'oasis_palms_2',
      type: 'tree',
      x: 720,
      y: 240,
      width: 50,
      height: 50,
      solid: false,
    },

    // Damascus Gate Entrance
    {
      id: 'damascus_gate',
      type: 'gate',
      x: 1040,
      y: 400,
      width: 50,
      height: 120,
      solid: false,
      interactive: true,
      interactPrompt: 'Atravessar o Portão de Damasco (Rua Direita) [E]',
    },

    // House of Judas on Straight Street
    {
      id: 'house_of_judas',
      type: 'bench',
      x: 1250,
      y: 440,
      width: 60,
      height: 40,
      solid: true,
      interactive: true,
      interactPrompt: 'Casa de Judas na Rua Direita (Orar com Ananias) [E]',
    }
  ],

  npcs: [
    // 1. Temple Scribe Assistant
    {
      id: 'escriba_saulo',
      name: 'Escriba do Templo',
      role: 'Auxiliar de Saulo',
      x: 280,
      y: 420,
      radius: 18,
      facing: 'right',
      color: '#d4a373',
      robeColor: '#475569',
      cloakColor: '#1e293b',
      iconographyType: 'generic',
      speed: 0,
      interactionRadius: 70,
      dialogueId: 'escriba_dialogue',
      barkText: 'As cartas do Sumo Sacerdote estão seladas.',
    },

    // 2. Escort Soldier
    {
      id: 'escolta_soldado',
      name: 'Guarda da Escolta',
      role: 'Mercenário da Guarda',
      x: 420,
      y: 480,
      radius: 20,
      facing: 'left',
      color: '#c2410c',
      robeColor: '#7c2d12',
      iconographyType: 'temple_guard',
      hasSpear: true,
      speed: 1.2,
      interactionRadius: 70,
      detectionRadius: 90,
      dialogueId: 'escolta_dialogue',
      barkText: 'Damasco já desponta além daquelas palmeiras.',
      isPatrolling: true,
      patrolPoints: [
        { x: 420, y: 480 },
        { x: 550, y: 480 },
        { x: 450, y: 520 }
      ],
      currentPatrolIndex: 0
    },

    // 3. The Divine Light Location Trigger
    {
      id: 'shekinah_trigger',
      name: 'Ponto da Teofania Celestial',
      role: 'O Encontro com a Luz',
      x: 750,
      y: 450,
      radius: 24,
      facing: 'down',
      color: '#fef08a',
      robeColor: '#fef08a',
      iconographyType: 'christ',
      speed: 0,
      interactionRadius: 80,
      dialogueId: 'shekinah_dialogue',
      barkText: 'Uma luz mais alva que o sol cintila no ar...',
    },

    // 4. Ananias inside Damascus
    {
      id: 'ananias_disciple',
      name: 'Ananias',
      role: 'Discípulo em Damasco',
      x: 1320,
      y: 450,
      radius: 20,
      facing: 'left',
      color: '#d4a373',
      robeColor: '#065f46',
      cloakColor: '#047857',
      iconographyType: 'ananias',
      hasBeard: true,
      speed: 0,
      interactionRadius: 80,
      dialogueId: 'ananias_dialogue',
      barkText: 'O Senhor me ordenou vir impor as mãos...',
    }
  ],

  dialogues: {
    escriba_dialogue: {
      id: 'escriba_dialogue',
      speaker: 'Escriba do Templo',
      speakerRole: 'Auxiliar de Saulo',
      speakerColor: '#94a3b8',
      text: 'Rabi Saulo, com estas cartas prenderemos todos os traidores da Lei que seguem o carpinteiro de Nazaré.',
      options: [
        {
          label: '"Avançai em direção ao meio-dia da estrada."',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    escolta_dialogue: {
      id: 'escolta_dialogue',
      speaker: 'Guarda da Escolta',
      speakerRole: 'Mercenário da Guarda',
      speakerColor: '#ea580c',
      text: 'O sol está no zênite, mas logo entraremos pelas portas fortificadas da Síria.',
      options: [
        {
          label: '"Continuemos sem descanso."',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    shekinah_dialogue: {
      id: 'shekinah_dialogue',
      speaker: 'Voz Celestial do Senhor Jesus',
      speakerRole: 'A Glória da Shekinah',
      speakerColor: '#facc15',
      text: 'Sha\'ul, Sha\'ul... Lamah tird\'feni? (Saulo, Saulo... Por que me persegues? Eu sou Jesus, a quem tu persegues!)',
      options: [
        {
          label: '[Caído no pó, com cegueira nos olhos]: "Senhor, que queres que eu faça?"',
          nextDialogueId: 'shekinah_command',
          triggerAction: 'shekinah_sound_and_blind'
        }
      ]
    },

    shekinah_command: {
      id: 'shekinah_command',
      speaker: 'Jesus Cristo',
      speakerRole: 'O Senhor',
      speakerColor: '#facc15',
      text: 'Levanta-te, e entra na cidade pela Rua Direita. Eu te escolhi como vaso para levar o meu Nome perante gentios, reis e filhos de Israel.',
      options: [
        {
          label: '[Ser guiado pela mão até a Casa de Judas para encontrar Ananias]',
          nextDialogueId: undefined,
          triggerAction: 'advance_to_ananias'
        }
      ]
    },

    ananias_dialogue: {
      id: 'ananias_dialogue',
      speaker: 'Ananias',
      speakerRole: 'Discípulo do Senhor',
      speakerColor: '#34d399',
      text: '"Irmão Saulo, o Senhor Jesus, que te apareceu no caminho, me enviou para que tornes a ver e sejas cheio do Espírito Santo!"',
      options: [
        {
          label: '[Receber a imposição de mãos: as escamas caem dos olhos!]',
          nextDialogueId: undefined,
          triggerAction: 'complete_damascus_mission'
        }
      ]
    }
  }
};

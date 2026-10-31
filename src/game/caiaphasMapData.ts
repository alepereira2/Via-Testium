import { MapWorldData } from './types';

export const CAIAPHAS_COURTYARD_MAP: MapWorldData = {
  id: 'caiaphas_courtyard',
  name: 'Pátio da Mansão de Caifás',
  region: 'Cidade Alta, Jerusalém',
  year: 'Nisan de 33 d.C. (Madrugada)',
  ambientLight: 'rgba(5, 8, 16, 0.88)', // Cold deep blue night
  width: 1400,
  height: 950,
  spawnPoint: { x: 220, y: 780 }, // Near lower entry arch
  cameraBounds: { minX: 0, maxX: 1400, minY: 0, maxY: 950 },

  // Solid Walls and Barriers
  walls: [
    // Outer perimeter walls (thick limestone)
    { x: 50, y: 50, width: 1300, height: 30 }, // North wall
    { x: 50, y: 50, width: 30, height: 850 }, // West wall
    { x: 1320, y: 50, width: 30, height: 850 }, // East wall
    { x: 50, y: 870, width: 500, height: 30 }, // South wall (left of gate)
    { x: 650, y: 870, width: 700, height: 30 }, // South wall (right of gate)

    // Upper Balcony / Loggia (Where Jesus is kept before the Sanhedrin)
    { x: 450, y: 80, width: 500, height: 40 }, // Balcony railing
    { x: 450, y: 80, width: 25, height: 120 }, // West stairs divider
    { x: 925, y: 80, width: 25, height: 120 }, // East stairs divider

    // Colonnade barriers
    { x: 250, y: 320, width: 30, height: 30 },
    { x: 450, y: 320, width: 30, height: 30 },
    { x: 850, y: 320, width: 30, height: 30 },
    { x: 1050, y: 320, width: 30, height: 30 },

    { x: 250, y: 620, width: 30, height: 30 },
    { x: 450, y: 620, width: 30, height: 30 },
    { x: 850, y: 620, width: 30, height: 30 },
    { x: 1050, y: 620, width: 30, height: 30 },
  ],

  // Visual Props with Light Radii and Collision
  props: [
    // The central charcoal brazier (warming fire)
    {
      id: 'brazier_central',
      type: 'brazier',
      x: 650,
      y: 480,
      width: 44,
      height: 44,
      solid: true,
      lightRadius: 240,
      lightColor: '#ff7722',
      interactive: true,
      interactPrompt: 'Aquecer as mãos no braseiro [E]',
    },

    // Torch on west wall
    {
      id: 'torch_west',
      type: 'brazier',
      x: 90,
      y: 450,
      width: 20,
      height: 20,
      solid: false,
      lightRadius: 130,
      lightColor: '#ff9933',
    },

    // Torch on east wall
    {
      id: 'torch_east',
      type: 'brazier',
      x: 1280,
      y: 450,
      width: 20,
      height: 20,
      solid: false,
      lightRadius: 130,
      lightColor: '#ff9933',
    },

    // Torches on upper balcony
    {
      id: 'torch_balcony_1',
      type: 'brazier',
      x: 480,
      y: 110,
      width: 20,
      height: 20,
      solid: false,
      lightRadius: 150,
      lightColor: '#ffaa33',
    },
    {
      id: 'torch_balcony_2',
      type: 'brazier',
      x: 880,
      y: 110,
      width: 20,
      height: 20,
      solid: false,
      lightRadius: 150,
      lightColor: '#ffaa33',
    },

    // Stone benches
    {
      id: 'bench_1',
      type: 'bench',
      x: 140,
      y: 280,
      width: 80,
      height: 30,
      solid: true,
    },
    {
      id: 'bench_2',
      type: 'bench',
      x: 1160,
      y: 280,
      width: 80,
      height: 30,
      solid: true,
    },
    {
      id: 'bench_3',
      type: 'bench',
      x: 750,
      y: 530,
      width: 90,
      height: 26,
      solid: true,
    },

    // Wine amphorae and jars
    {
      id: 'amphora_1',
      type: 'amphora',
      x: 800,
      y: 510,
      width: 24,
      height: 24,
      solid: true,
    },

    // The Entry Arch / Gate
    {
      id: 'entry_gate',
      type: 'gate',
      x: 550,
      y: 860,
      width: 100,
      height: 40,
      solid: false,
      interactive: true,
      interactPrompt: 'Portão do Pátio (Saída para a Cidade)',
    },

    // Upper Loggia Platform
    {
      id: 'loggia_stairs',
      type: 'stairs',
      x: 580,
      y: 130,
      width: 240,
      height: 50,
      solid: false,
    }
  ],

  // NPCs in the Courtyard
  npcs: [
    // 1. The Servant Girl who keeps the door
    {
      id: 'servant_girl',
      name: 'Criada do Portão',
      role: 'Serva do Sumo Sacerdote',
      x: 480,
      y: 540,
      radius: 16,
      facing: 'right',
      color: '#d4a373',
      robeColor: '#9c6644',
      cloakColor: '#ddb892',
      speed: 1.2,
      interactionRadius: 65,
      detectionRadius: 90,
      dialogueId: 'criada_dialogue_1',
      barkText: '...essa noite está fria demais...',
      isPatrolling: true,
      patrolPoints: [
        { x: 480, y: 540 },
        { x: 540, y: 500 },
        { x: 460, y: 600 }
      ],
      currentPatrolIndex: 0
    },

    // 2. Kinsman of Malchus (Whose ear Peter cut off in Gethsemane)
    {
      id: 'malchus_kinsman',
      name: 'Parente de Malco',
      role: 'Servo de Caifás',
      x: 780,
      y: 440,
      radius: 18,
      facing: 'left',
      color: '#b08968',
      robeColor: '#6f4e37',
      hasBeard: true,
      speed: 0,
      interactionRadius: 70,
      detectionRadius: 100,
      dialogueId: 'malco_kinsman_dialogue',
      barkText: 'Aquele golpe no olival não ficará impune...',
    },

    // 3. Temple Guards near the fire
    {
      id: 'temple_guard_1',
      name: 'Soldado do Templo',
      role: 'Guarda do Sinédrio',
      x: 620,
      y: 400,
      radius: 18,
      facing: 'down',
      color: '#8d99ae',
      robeColor: '#2b2d42',
      hasSpear: true,
      speed: 1.0,
      interactionRadius: 60,
      detectionRadius: 110,
      detectionAngle: 60,
      dialogueId: 'guards_dialogue',
      barkText: 'O rabi de Nazaré logo será entregue a Pilatos.',
      isPatrolling: true,
      patrolPoints: [
        { x: 620, y: 400 },
        { x: 740, y: 400 },
        { x: 680, y: 350 }
      ],
      currentPatrolIndex: 0
    },

    // 4. Roman Auxiliary Soldier
    {
      id: 'roman_soldier',
      name: 'Soldado Romano',
      role: 'Guarda da Coorte',
      x: 950,
      y: 480,
      radius: 18,
      facing: 'left',
      color: '#c1121f',
      robeColor: '#780000',
      hasSpear: true,
      speed: 0,
      interactionRadius: 60,
      detectionRadius: 80,
      dialogueId: 'roman_dialogue',
      barkText: 'Bebam esse vinho e fiquem de olhos abertos.',
    },

    // 5. Jesus on the Upper Loggia
    {
      id: 'christ_suffering',
      name: 'Jesus de Nazaré',
      role: 'O Messias Preso e Ferido',
      x: 690,
      y: 70,
      radius: 16,
      facing: 'down',
      color: '#fdf0d5',
      robeColor: '#ffffff',
      cloakColor: '#e0e1dd',
      hasBeard: true,
      speed: 0,
      interactionRadius: 90,
      dialogueId: 'christ_glance',
      barkText: '...Pai, perdoa-lhes...',
    },

    // 6. The Rooster on the East Wall Rampart
    {
      id: 'rooster_prop',
      name: 'O Galo no Muro',
      role: 'Testemunha da Madrugada',
      x: 1080,
      y: 75,
      radius: 12,
      facing: 'left',
      color: '#d00000',
      robeColor: '#d00000',
      speed: 0,
      interactionRadius: 60,
      dialogueId: 'rooster_bark',
      barkText: 'O poleiro na muralha alta do Templo...',
    }
  ],

  // Interactive Dialogue Tree
  dialogues: {
    // 1st Confrontation: The Servant Girl
    criada_dialogue_1: {
      id: 'criada_dialogue_1',
      speaker: 'Criada do Portão',
      speakerRole: 'Serva de Caifás',
      speakerColor: '#d4a373',
      text: 'Tu também estavas com Jesus, o Nazareno! Teu rosto não me engana, homem da Galileia!',
      options: [
        {
          label: '1. "Mulher, eu não o conheço, nem sei o que estás a dizer."',
          description: 'Primeira Negação (Esquiva sob medo)',
          nextDialogueId: 'criada_result_1',
          triggerAction: 'denial_one_committed'
        },
        {
          label: '2. "Por que me interrogas no escuro? Sou apenas um peregrino."',
          description: 'Tenta se misturar aos viajantes',
          nextDialogueId: 'criada_result_1',
          triggerAction: 'denial_one_committed'
        }
      ]
    },

    criada_result_1: {
      id: 'criada_result_1',
      speaker: 'Criada do Portão',
      speakerRole: 'Serva de Caifás',
      speakerColor: '#d4a373',
      text: 'Humph... teus olhos estão inquietos. Vai para junto do fogo se queres, mas não tiro os olhos de ti.',
      options: [
        {
          label: '[Afastar-se em direção ao fogo do braseiro]',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    // 2nd Confrontation: Kinsman of Malchus
    malco_kinsman_dialogue: {
      id: 'malco_kinsman_dialogue',
      speaker: 'Parente de Malco',
      speakerRole: 'Servo do Sumo Sacerdote',
      speakerColor: '#b08968',
      text: 'Não te vi eu com ele no horto das oliveiras?! Tu és galileu! O teu próprio modo de falar te condena diante de todos nós!',
      options: [
        {
          label: '1. "Homem, eu não sou um deles! Nunca estive com ele no horto!"',
          description: 'Segunda Negação (Negação enfática)',
          nextDialogueId: 'malco_result',
          triggerAction: 'denial_two_committed'
        },
        {
          label: '2. "Estás enganado! Tenho negócios de pesca em Cafarnaum, nada mais!"',
          description: 'Falsa justificativa comercial',
          nextDialogueId: 'malco_result',
          triggerAction: 'denial_two_committed'
        }
      ]
    },

    malco_result: {
      id: 'malco_result',
      speaker: 'Parente de Malco',
      speakerRole: 'Servo do Sumo Sacerdote',
      speakerColor: '#b08968',
      text: 'Mentes! Eu reconheço essa barba e o manto dos homens que o cercavam no Getsêmani! Soldados, venham ver!',
      options: [
        {
          label: '[O cerco se fecha. O coração de Pedro dispara!]',
          nextDialogueId: undefined,
          triggerAction: 'trigger_guards_confrontation'
        }
      ]
    },

    // 3rd Confrontation: The Temple Guards & The Rooster Crow
    guards_dialogue: {
      id: 'guards_dialogue',
      speaker: 'Soldado do Templo',
      speakerRole: 'Guarda Armado',
      speakerColor: '#8d99ae',
      text: 'Verdadeiramente tu és um deles! Estavas pronto a empunhar ferro contra nós nas trevas! Confessa quem és!',
      options: [
        {
          label: '1. [Praguejando e jurando com desespero]: "Eu não conheço esse homem de quem falais!"',
          description: 'A Terceira Negação e o canto do galo',
          nextDialogueId: 'rooster_climax',
          triggerAction: 'denial_three_and_rooster'
        }
      ]
    },

    rooster_climax: {
      id: 'rooster_climax',
      speaker: 'A Madrugada de Jerusalém',
      speakerRole: 'O Canto do Galo',
      speakerColor: '#e63946',
      text: '* COCORICÓ! * O galo canta no topo da muralha. No mesmo instante, na galeria superior, Jesus volta-se e olha nos olhos de Pedro...',
      options: [
        {
          label: '[Olhar para o alto e contemplar o Senhor Jesus]',
          nextDialogueId: 'christ_look_dialogue',
          triggerAction: 'play_christ_glance'
        }
      ]
    },

    christ_look_dialogue: {
      id: 'christ_look_dialogue',
      speaker: 'Jesus de Nazaré',
      speakerRole: 'O Salvador Olhando de Cima',
      speakerColor: '#ffd166',
      text: 'O olhar de Cristo através da balaustrada não traz ira nem vingança, mas uma tristeza compassiva e infinita. Pedro lembra-se: "Antes que o galo cante hoje, três vezes me negarás".',
      options: [
        {
          label: '[Chorar amargamente e correr em direção ao portão de saída]',
          nextDialogueId: undefined,
          triggerAction: 'escape_to_empty_tomb'
        }
      ]
    },

    roman_dialogue: {
      id: 'roman_dialogue',
      speaker: 'Soldado Romano',
      speakerRole: 'Guarda da Coorte',
      speakerColor: '#c1121f',
      text: 'Afasta-te, judeu. O julgamento do vosso Conselho já está quase encerrado. Ao amanhecer o réu irá ao Pretório de Pilatos.',
      options: [
        {
          label: 'Afastar-se em silêncio',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    rooster_bark: {
      id: 'rooster_bark',
      speaker: 'O Galo no Muro',
      speakerRole: 'Sinal da Profecia',
      speakerColor: '#e63946',
      text: 'O galo aguarda a aurora sobre as pedras cinzentas da muralha.',
      options: [
        {
          label: 'Voltar ao pátio',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    christ_glance: {
      id: 'christ_glance',
      speaker: 'Jesus de Nazaré',
      speakerRole: 'O Senhor',
      speakerColor: '#ffd166',
      text: 'O Senhor está com as mãos atadas por cordas, silencioso e manso como um cordeiro levado ao matadouro.',
      options: [
        {
          label: 'Baixar a cabeça em reverência e dor',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    }
  }
};

import { MapWorldData } from './types';

export const CAIAPHAS_COURTYARD_MAP: MapWorldData = {
  id: 'caiaphas_courtyard',
  name: 'Pátio da Mansão de Caifás',
  region: 'Cidade Alta, Jerusalém',
  year: 'Nisan de 33 d.C. (Madrugada)',
  // Brightened atmospheric night: cool moonlit stone with warm torchlight, not pitch black!
  ambientLight: 'rgba(15, 22, 38, 0.42)',
  brightnessFactor: 1.0,
  width: 1400,
  height: 950,
  spawnPoint: { x: 220, y: 780 }, // Near lower entry arch
  cameraBounds: { minX: 0, maxX: 1400, minY: 0, maxY: 950 },

  // Solid Walls and Barriers
  walls: [
    // Outer perimeter walls (dressed Jerusalem limestone)
    { x: 50, y: 50, width: 1300, height: 35 }, // North wall
    { x: 50, y: 50, width: 35, height: 850 }, // West wall
    { x: 1315, y: 50, width: 35, height: 850 }, // East wall
    { x: 50, y: 865, width: 500, height: 35 }, // South wall (left of gate)
    { x: 650, y: 865, width: 700, height: 35 }, // South wall (right of gate)

    // Upper Balcony / Loggia (Where Jesus is kept before the Sanhedrin)
    { x: 450, y: 80, width: 500, height: 45 }, // Balcony railing
    { x: 450, y: 80, width: 30, height: 120 }, // West stairs divider
    { x: 920, y: 80, width: 30, height: 120 }, // East stairs divider

    // Colonnade pillars (Classical Corinthian/Herodian pillars)
    { x: 250, y: 320, width: 36, height: 36 },
    { x: 450, y: 320, width: 36, height: 36 },
    { x: 850, y: 320, width: 36, height: 36 },
    { x: 1050, y: 320, width: 36, height: 36 },

    { x: 250, y: 620, width: 36, height: 36 },
    { x: 450, y: 620, width: 36, height: 36 },
    { x: 850, y: 620, width: 36, height: 36 },
    { x: 1050, y: 620, width: 36, height: 36 },
  ],

  props: [
    // The central charcoal brazier (warming fire with rich radiant glow)
    {
      id: 'brazier_central',
      type: 'brazier',
      x: 650,
      y: 480,
      width: 52,
      height: 52,
      solid: true,
      lightRadius: 320,
      lightColor: '#ff8822',
      interactive: true,
      interactPrompt: 'Aquecer as mãos no braseiro [E]',
    },

    // Torch on west wall
    {
      id: 'torch_west',
      type: 'brazier',
      x: 95,
      y: 450,
      width: 24,
      height: 24,
      solid: false,
      lightRadius: 200,
      lightColor: '#ffaa33',
    },

    // Torch on east wall
    {
      id: 'torch_east',
      type: 'brazier',
      x: 1275,
      y: 450,
      width: 24,
      height: 24,
      solid: false,
      lightRadius: 200,
      lightColor: '#ffaa33',
    },

    // Torches on upper balcony (illuminating Christ)
    {
      id: 'torch_balcony_1',
      type: 'brazier',
      x: 480,
      y: 110,
      width: 24,
      height: 24,
      solid: false,
      lightRadius: 220,
      lightColor: '#ffd700',
    },
    {
      id: 'torch_balcony_2',
      type: 'brazier',
      x: 880,
      y: 110,
      width: 24,
      height: 24,
      solid: false,
      lightRadius: 220,
      lightColor: '#ffd700',
    },

    // Stone benches
    {
      id: 'bench_1',
      type: 'bench',
      x: 140,
      y: 280,
      width: 85,
      height: 32,
      solid: true,
    },
    {
      id: 'bench_2',
      type: 'bench',
      x: 1160,
      y: 280,
      width: 85,
      height: 32,
      solid: true,
    },
    {
      id: 'bench_3',
      type: 'bench',
      x: 760,
      y: 530,
      width: 95,
      height: 28,
      solid: true,
    },

    // Wine amphorae and oil jars
    {
      id: 'amphora_1',
      type: 'amphora',
      x: 810,
      y: 510,
      width: 26,
      height: 26,
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
      interactPrompt: 'Portão do Pátio (Saída para a Cidade) [E]',
    },

    // Upper Loggia Platform Stairs
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

  // NPCs with authentic Catholic Iconography
  npcs: [
    // 1. The Servant Girl who keeps the door
    {
      id: 'servant_girl',
      name: 'Criada do Portão',
      role: 'Serva de Caifás',
      x: 480,
      y: 540,
      radius: 20,
      facing: 'right',
      color: '#f0c8a0',
      robeColor: '#b45309', // Terracotta ochre Levantine gown
      cloakColor: '#fef3c7', // Flowing white modesty veil
      iconographyType: 'servant_girl',
      speed: 1.2,
      interactionRadius: 75,
      detectionRadius: 95,
      dialogueId: 'criada_dialogue_1',
      barkText: '...essa noite está fria demais...',
      isPatrolling: true,
      patrolPoints: [
        { x: 480, y: 540 },
        { x: 550, y: 490 },
        { x: 460, y: 600 }
      ],
      currentPatrolIndex: 0
    },

    // 2. Kinsman of Malchus (Whose ear Peter cut off in Gethsemane!)
    {
      id: 'malchus_kinsman',
      name: 'Parente de Malco',
      role: 'Servo de Caifás (Orelha Enfaixada)',
      x: 780,
      y: 440,
      radius: 22,
      facing: 'left',
      color: '#e5b887',
      robeColor: '#451a03',
      cloakColor: '#78350f',
      iconographyType: 'malchus_kin', // Has bandaged right ear!
      hasBeard: true,
      speed: 0,
      interactionRadius: 75,
      detectionRadius: 105,
      dialogueId: 'malco_kinsman_dialogue',
      barkText: 'Aquele golpe no olival não ficará impune...',
    },

    // 3. Temple Guards near the fire
    {
      id: 'temple_guard_1',
      name: 'Soldado do Templo',
      role: 'Guarda Levítico do Sinédrio',
      x: 620,
      y: 390,
      radius: 22,
      facing: 'down',
      color: '#e2b887',
      robeColor: '#1e3a8a', // Levitical blue & white sash
      cloakColor: '#ffffff', // White priestly linen turban
      iconographyType: 'temple_guard',
      hasSpear: true,
      speed: 1.0,
      interactionRadius: 70,
      detectionRadius: 115,
      detectionAngle: 60,
      dialogueId: 'guards_dialogue',
      barkText: 'O rabi de Nazaré logo será entregue a Pilatos.',
      isPatrolling: true,
      patrolPoints: [
        { x: 620, y: 390 },
        { x: 740, y: 390 },
        { x: 680, y: 340 }
      ],
      currentPatrolIndex: 0
    },

    // 4. Roman Auxiliary Soldier
    {
      id: 'roman_soldier',
      name: 'Centurião Romano',
      role: 'Legionário da Coorte',
      x: 950,
      y: 480,
      radius: 23,
      facing: 'left',
      color: '#d4a373',
      robeColor: '#991b1b', // Imperial Roman Crimson
      cloakColor: '#b91c1c',
      iconographyType: 'roman_soldier', // Crested helmet + lorica segmentata
      hasSpear: true,
      speed: 0,
      interactionRadius: 70,
      detectionRadius: 90,
      dialogueId: 'roman_dialogue',
      barkText: 'Bebam esse vinho e mantenham a ordem.',
    },

    // 5. Our Lord Jesus Christ on the Upper Loggia
    {
      id: 'christ_suffering',
      name: 'Jesus Cristo',
      role: 'O Messias Preso e Ferido (Nimbo Cruciforme)',
      x: 690,
      y: 70,
      radius: 22,
      facing: 'down',
      color: '#fde8cd',
      robeColor: '#ffffff', // Seamless holy white tunic
      cloakColor: '#7f1d1d', // Sacred crimson mantle
      iconographyType: 'christ', // Cruciform Golden Halo + parted chestnut hair & beard
      hasHalo: true,
      hasCruciformHalo: true,
      hasBeard: true,
      speed: 0,
      interactionRadius: 95,
      dialogueId: 'christ_glance',
      barkText: '...Pai, perdoa-lhes, pois não sabem o que fazem...',
    },

    // 6. The Rooster on the East Wall Rampart
    {
      id: 'rooster_prop',
      name: 'O Galo no Muro',
      role: 'O Sinal da Profecia',
      x: 1080,
      y: 75,
      radius: 14,
      facing: 'left',
      color: '#b91c1c',
      robeColor: '#ea580c',
      iconographyType: 'rooster',
      speed: 0,
      interactionRadius: 65,
      dialogueId: 'rooster_bark',
      barkText: 'O canto da madrugada que desperta a alma...',
    }
  ],

  // Interactive Dialogue Tree
  dialogues: {
    criada_dialogue_1: {
      id: 'criada_dialogue_1',
      speaker: 'Criada do Portão',
      speakerRole: 'Serva de Caifás',
      speakerColor: '#d97706',
      text: 'Tu também estavas com Jesus, o Nazareno! Teu rosto não me engana, homem da Galileia!',
      options: [
        {
          label: '1. "Mulher, eu não o conheço, nem sei o que estás a dizer."',
          description: 'Primeira Negação (Esquiva sob medo)',
          nextDialogueId: 'criada_result_1',
          triggerAction: 'denial_one_committed'
        },
        {
          label: '2. "Por que me interrogas no escuro? Sou apenas um peregrino da festa."',
          description: 'Tenta se misturar aos forasteiros',
          nextDialogueId: 'criada_result_1',
          triggerAction: 'denial_one_committed'
        }
      ]
    },

    criada_result_1: {
      id: 'criada_result_1',
      speaker: 'Criada do Portão',
      speakerRole: 'Serva de Caifás',
      speakerColor: '#d97706',
      text: 'Humph... teus olhos estão inquietos e tens as mãos trêmulas. Vai para junto do fogo se queres, mas não tiro os olhos de ti.',
      options: [
        {
          label: '[Afastar-se em direção às brasas do braseiro]',
          nextDialogueId: undefined,
          triggerAction: 'close_dialogue'
        }
      ]
    },

    malco_kinsman_dialogue: {
      id: 'malco_kinsman_dialogue',
      speaker: 'Parente de Malco',
      speakerRole: 'Servo do Sumo Sacerdote (Orelha Enfaixada)',
      speakerColor: '#92400e',
      text: 'Não te vi eu com ele no horto das oliveiras?! Olha para a minha orelha golpeada! Tu és galileu! O teu próprio modo de falar te condena diante de todos nós!',
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
      speakerColor: '#92400e',
      text: 'Mentes! Eu reconheço esse manto azul e as barbas dos homens que cercavam o Nazareno! Soldados, venham ver quem está aqui!',
      options: [
        {
          label: '[O cerco se fecha. O coração de Pedro dispara!]',
          nextDialogueId: undefined,
          triggerAction: 'trigger_guards_confrontation'
        }
      ]
    },

    guards_dialogue: {
      id: 'guards_dialogue',
      speaker: 'Soldado do Templo',
      speakerRole: 'Guarda Armado',
      speakerColor: '#3b82f6',
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
      speakerColor: '#ef4444',
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
      speaker: 'Jesus Cristo',
      speakerRole: 'O Olhar Misericordioso',
      speakerColor: '#fbbf24',
      text: 'O olhar de Cristo através da balaustrada não traz ira nem vingança, mas uma dor infinita e misericordiosa. Pedro lembra-se: "Antes que o galo cante hoje, três vezes me negarás".',
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
      speaker: 'Centurião Romano',
      speakerRole: 'Guarda da Coorte',
      speakerColor: '#dc2626',
      text: 'Afasta-te, peregrino. O tribunal do Conselho logo emitirá a sentença. Ao raiar do dia o réu irá ao Pretório de Pôncio Pilatos.',
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
      speakerColor: '#ef4444',
      text: 'O galo empoleirado nas ameias do Templo aguarda a hora predita.',
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
      speaker: 'Jesus Cristo',
      speakerRole: 'O Cordeiro de Deus',
      speakerColor: '#fbbf24',
      text: 'O Senhor está com as mãos atadas por cordas de cânhamo, silencioso e manso, suportando as bofetadas dos servos do Templo.',
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

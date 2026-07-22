import type { SettingsType } from '@/types/state'

export type CampaignChallengeMode =
  | 'training'
  | 'stone-race'
  | 'thin-wall'
  | 'rich-start'
  | 'short-hand'
  | 'tower-rush'
  | 'resource-race'
  | 'siege'

export type CampaignAiProfile =
  | 'balanced'
  | 'builder'
  | 'raider'
  | 'economist'
  | 'defender'
  | 'tempo'

export type CampaignLevel = {
  id: number
  tavernIndex: number
  tavernName: string
  opponentName: string
  challengePool: CampaignChallengeMode[]
  challengeMode: CampaignChallengeMode
  challengeLabel: string
  reward: string
  aiProfile: CampaignAiProfile
  aiLevel: number
  settings: SettingsType
}

export type CampaignResolvedLevel = CampaignLevel & {
  challengeDescription: string
  victoryConditions: string[]
}

export const campaignChallengeModes: CampaignChallengeMode[] = [
  'training',
  'stone-race',
  'thin-wall',
  'rich-start',
  'short-hand',
  'tower-rush',
  'resource-race',
  'siege',
]

type ChallengeModeMeta = {
  label: string
  description: string
  apply: (settings: SettingsType, levelId: number) => SettingsType
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(value), min), max)

const tune = (
  settings: SettingsType,
  patch: Partial<SettingsType>,
): SettingsType => ({
  ...settings,
  ...patch,
})

export const challengeModeMeta: Record<
  CampaignChallengeMode,
  ChallengeModeMeta
> = {
  training: {
    label: 'Duello di apprendistato',
    description: 'Regole standard, soglie basse e ritmo leggibile.',
    apply: (settings) => settings,
  },
  'stone-race': {
    label: 'Supremazia di pietra',
    description: 'Economia di mattoni piu rapida e torre obiettivo piu alta.',
    apply: (settings, levelId) =>
      tune(settings, {
        brickProd: clamp(settings.brickProd + 1, 1, 7),
        bricks: clamp(settings.bricks + 4 + levelId, 1, 80),
        winTower: clamp(settings.winTower * 1.08, 20, 300),
      }),
  },
  'thin-wall': {
    label: 'Mura fragili',
    description: 'Si parte con poche mura: ogni errore difensivo pesa subito.',
    apply: (settings) =>
      tune(settings, {
        wall: clamp(settings.wall * 0.45, 0, 25),
        winTower: clamp(settings.winTower * 0.95, 20, 300),
      }),
  },
  'rich-start': {
    label: 'Partenza ricca',
    description: 'Molte risorse iniziali, quindi le carte forti arrivano prima.',
    apply: (settings, levelId) =>
      tune(settings, {
        bricks: clamp(settings.bricks + 6 + levelId, 1, 100),
        gems: clamp(settings.gems + 6 + levelId, 1, 100),
        recruits: clamp(settings.recruits + 6 + levelId, 1, 100),
        winResource: clamp(settings.winResource * 1.12, 80, 800),
      }),
  },
  'short-hand': {
    label: 'Mano corta',
    description: 'Meno carte in mano: scartare male costa molto di piu.',
    apply: (settings) =>
      tune(settings, {
        cardsInHand: clamp(settings.cardsInHand - 1, 3, 6),
      }),
  },
  'tower-rush': {
    label: 'Corsa alla torre',
    description:
      'La vittoria di torre arriva prima, ma accumulare risorse e piu lento.',
    apply: (settings) =>
      tune(settings, {
        winTower: clamp(settings.winTower * 0.86, 20, 260),
        winResource: clamp(settings.winResource * 1.18, 100, 850),
      }),
  },
  'resource-race': {
    label: 'Corsa alle risorse',
    description: 'Le risorse vincono prima: produzione e denial contano di piu.',
    apply: (settings) =>
      tune(settings, {
        winResource: clamp(settings.winResource * 0.82, 80, 700),
        winTower: clamp(settings.winTower * 1.08, 25, 300),
      }),
  },
  siege: {
    label: 'Assedio controllato',
    description: 'Mura e torri piu alte: servono pressione costante e gestione tempo.',
    apply: (settings, levelId) =>
      tune(settings, {
        tower: clamp(settings.tower + 4 + levelId, 15, 90),
        wall: clamp(settings.wall + 8 + levelId, 8, 80),
        winTower: clamp(settings.winTower * 1.12, 40, 320),
      }),
  },
}

export const defaultCampaignSeed = 20260722

export const nextCampaignSeed = (seed: number, levelId: number) =>
  Math.abs((seed * 1664525 + 1013904223 + levelId * 97) % 2147483647)

const pickChallengeMode = (level: CampaignLevel, seed: number) => {
  const pool =
    level.challengePool.length > 0 ? level.challengePool : [level.challengeMode]
  return pool[Math.abs(seed + level.id * 31) % pool.length]
}

export const getVictoryConditions = (settings: SettingsType) => [
  `Porta la torre a ${settings.winTower}`,
  `Accumula ${settings.winResource} mattoni, gemme o reclute`,
  'Distruggi la torre avversaria',
]

export const resolveCampaignLevel = (
  levelId: number,
  seed = defaultCampaignSeed,
): CampaignResolvedLevel => {
  const level = getCampaignLevel(levelId)
  const challengeMode = pickChallengeMode(level, seed)
  const meta = challengeModeMeta[challengeMode]
  const settings = meta.apply(level.settings, level.id)

  return {
    ...level,
    challengeMode,
    challengeLabel: meta.label,
    challengeDescription: meta.description,
    settings,
    victoryConditions: getVictoryConditions(settings),
  }
}

export const campaignLevels: CampaignLevel[] = [
  {
    id: 1,
    tavernIndex: 0,
    tavernName: 'La Prima Brocca',
    opponentName: 'Bruno il Garzone',
    challengePool: ['training'],
    challengeMode: 'training',
    challengeLabel: 'Duello di apprendistato',
    reward: 'Sigillo del Novizio',
    aiProfile: 'balanced',
    aiLevel: 4,
    settings: {
      tower: 15,
      wall: 5,
      brickProd: 2,
      gemProd: 2,
      recruitProd: 2,
      bricks: 10,
      gems: 10,
      recruits: 10,
      winTower: 30,
      winResource: 100,
      cardsInHand: 5,
    },
  },
  {
    id: 2,
    tavernIndex: 1,
    tavernName: 'Il Boccale del Ponte',
    opponentName: 'Marta delle Mura',
    challengePool: ['thin-wall', 'tower-rush'],
    challengeMode: 'thin-wall',
    challengeLabel: 'Mura fragili',
    reward: 'Cintura del Muratore',
    aiProfile: 'defender',
    aiLevel: 3,
    settings: {
      tower: 18,
      wall: 4,
      brickProd: 2,
      gemProd: 2,
      recruitProd: 2,
      bricks: 7,
      gems: 7,
      recruits: 7,
      winTower: 45,
      winResource: 130,
      cardsInHand: 5,
    },
  },
  {
    id: 3,
    tavernIndex: 2,
    tavernName: 'La Gemma Verde',
    opponentName: 'Elia Occhiolungo',
    challengePool: ['resource-race', 'rich-start'],
    challengeMode: 'resource-race',
    challengeLabel: 'Corsa alle risorse',
    reward: 'Borsa delle Tre Risorse',
    aiProfile: 'economist',
    aiLevel: 3,
    settings: {
      tower: 20,
      wall: 6,
      brickProd: 2,
      gemProd: 3,
      recruitProd: 2,
      bricks: 6,
      gems: 8,
      recruits: 6,
      winTower: 55,
      winResource: 140,
      cardsInHand: 5,
    },
  },
  {
    id: 4,
    tavernIndex: 3,
    tavernName: 'La Fucina Storta',
    opponentName: 'Ruggero Piccamuro',
    challengePool: ['stone-race', 'siege'],
    challengeMode: 'stone-race',
    challengeLabel: 'Supremazia di pietra',
    reward: 'Martello del Capomastro',
    aiProfile: 'builder',
    aiLevel: 2,
    settings: {
      tower: 22,
      wall: 8,
      brickProd: 3,
      gemProd: 2,
      recruitProd: 2,
      bricks: 12,
      gems: 5,
      recruits: 5,
      winTower: 65,
      winResource: 170,
      cardsInHand: 5,
    },
  },
  {
    id: 5,
    tavernIndex: 4,
    tavernName: 'Il Calderone Blu',
    opponentName: 'Ser Lando dei Cristalli',
    challengePool: ['rich-start', 'resource-race', 'short-hand'],
    challengeMode: 'rich-start',
    challengeLabel: 'Partenza ricca',
    reward: 'Anello del Mana',
    aiProfile: 'tempo',
    aiLevel: 2,
    settings: {
      tower: 25,
      wall: 10,
      brickProd: 3,
      gemProd: 3,
      recruitProd: 3,
      bricks: 15,
      gems: 15,
      recruits: 15,
      winTower: 80,
      winResource: 220,
      cardsInHand: 5,
    },
  },
  {
    id: 6,
    tavernIndex: 5,
    tavernName: 'La Lanterna del Porto',
    opponentName: 'Viola Marefermo',
    challengePool: ['short-hand', 'thin-wall', 'tower-rush'],
    challengeMode: 'short-hand',
    challengeLabel: 'Mano corta',
    reward: 'Guanto del Tempismo',
    aiProfile: 'tempo',
    aiLevel: 2,
    settings: {
      tower: 25,
      wall: 12,
      brickProd: 3,
      gemProd: 3,
      recruitProd: 3,
      bricks: 10,
      gems: 10,
      recruits: 10,
      winTower: 90,
      winResource: 240,
      cardsInHand: 4,
    },
  },
  {
    id: 7,
    tavernIndex: 6,
    tavernName: 'Il Ferro Rosso',
    opponentName: 'Capitana Nerissa',
    challengePool: ['siege', 'stone-race', 'thin-wall'],
    challengeMode: 'siege',
    challengeLabel: 'Assedio controllato',
    reward: 'Stendardo della Guardia',
    aiProfile: 'raider',
    aiLevel: 1,
    settings: {
      tower: 30,
      wall: 18,
      brickProd: 4,
      gemProd: 3,
      recruitProd: 3,
      bricks: 16,
      gems: 10,
      recruits: 10,
      winTower: 110,
      winResource: 280,
      cardsInHand: 5,
    },
  },
  {
    id: 8,
    tavernIndex: 7,
    tavernName: 'La Moneta Spezzata',
    opponentName: 'Naldo Contamani',
    challengePool: ['resource-race', 'rich-start', 'short-hand'],
    challengeMode: 'resource-race',
    challengeLabel: 'Tesoro conteso',
    reward: 'Scrigno del Mercante',
    aiProfile: 'economist',
    aiLevel: 1,
    settings: {
      tower: 28,
      wall: 14,
      brickProd: 4,
      gemProd: 4,
      recruitProd: 3,
      bricks: 18,
      gems: 18,
      recruits: 12,
      winTower: 125,
      winResource: 320,
      cardsInHand: 5,
    },
  },
  {
    id: 9,
    tavernIndex: 8,
    tavernName: 'Il Bastione Cavo',
    opponentName: 'Dama Isotta Nera',
    challengePool: ['tower-rush', 'siege', 'stone-race'],
    challengeMode: 'tower-rush',
    challengeLabel: 'Corsa alla torre',
    reward: 'Corona di Calce',
    aiProfile: 'builder',
    aiLevel: 1,
    settings: {
      tower: 35,
      wall: 20,
      brickProd: 4,
      gemProd: 4,
      recruitProd: 4,
      bricks: 15,
      gems: 15,
      recruits: 15,
      winTower: 150,
      winResource: 360,
      cardsInHand: 5,
    },
  },
  {
    id: 10,
    tavernIndex: 9,
    tavernName: 'La Sala delle Ombre',
    opponentName: 'Vespro il Tattico',
    challengePool: ['thin-wall', 'tower-rush', 'resource-race'],
    challengeMode: 'thin-wall',
    challengeLabel: 'Difesa sotto pressione',
    reward: 'Mantello del Calcolo',
    aiProfile: 'defender',
    aiLevel: 0,
    settings: {
      tower: 35,
      wall: 8,
      brickProd: 4,
      gemProd: 5,
      recruitProd: 4,
      bricks: 18,
      gems: 22,
      recruits: 18,
      winTower: 170,
      winResource: 420,
      cardsInHand: 5,
    },
  },
  {
    id: 11,
    tavernIndex: 10,
    tavernName: 'Il Trono del Dado',
    opponentName: 'Maestra Corvina',
    challengePool: ['siege', 'short-hand', 'rich-start'],
    challengeMode: 'siege',
    challengeLabel: 'Assedio maggiore',
    reward: 'Chiave della Sala Alta',
    aiProfile: 'raider',
    aiLevel: 0,
    settings: {
      tower: 45,
      wall: 30,
      brickProd: 5,
      gemProd: 5,
      recruitProd: 4,
      bricks: 24,
      gems: 24,
      recruits: 18,
      winTower: 210,
      winResource: 520,
      cardsInHand: 6,
    },
  },
  {
    id: 12,
    tavernIndex: 11,
    tavernName: 'L Ultima Taverna',
    opponentName: 'Arconte Valerio',
    challengePool: ['tower-rush', 'resource-race', 'siege', 'short-hand'],
    challengeMode: 'tower-rush',
    challengeLabel: 'Ultima torre',
    reward: 'Sigillo dell Arcomago',
    aiProfile: 'balanced',
    aiLevel: 0,
    settings: {
      tower: 55,
      wall: 40,
      brickProd: 5,
      gemProd: 5,
      recruitProd: 5,
      bricks: 30,
      gems: 30,
      recruits: 30,
      winTower: 250,
      winResource: 650,
      cardsInHand: 6,
    },
  },
]

export const campaignLevelCount = campaignLevels.length

export const getCampaignLevel = (levelId: number) =>
  campaignLevels.find((level) => level.id === levelId) ?? campaignLevels[0]

export const getNextPlayableLevelId = (unlockedLevel: number) =>
  Math.min(Math.max(unlockedLevel, 1), campaignLevelCount)

import {
  campaignLevelCount,
  defaultCampaignSeed,
  resolveCampaignLevel,
} from '../src/campaign/levels'

type CampaignBalanceRow = {
  level: number
  tavern: string
  opponent: string
  mode: string
  aiLevel: number
  aiProfile: string
  towerGoal: number
  resourceGoal: number
  cardsInHand: number
  difficultyScore: number
  warnings: string[]
}

const round1 = (value: number) => Math.round(value * 10) / 10

export const evaluateCampaignBalance = (
  seed = defaultCampaignSeed,
): CampaignBalanceRow[] => {
  let previousScore = 0

  return Array.from({ length: campaignLevelCount }, (_, index) => {
    const level = resolveCampaignLevel(index + 1, seed)
    const settings = level.settings
    const economy =
      settings.brickProd + settings.gemProd * 1.15 + settings.recruitProd * 1.05
    const startingResources =
      settings.bricks + settings.gems * 1.15 + settings.recruits * 1.05
    const towerPressure = settings.winTower / Math.max(settings.tower, 1)
    const resourcePressure = settings.winResource / Math.max(economy, 1)
    const handPressure = settings.cardsInHand <= 4 ? 18 : 0
    const aiPressure = (5 - level.aiLevel) * 24
    const profilePressure =
      level.aiProfile === 'raider' || level.aiProfile === 'tempo'
        ? 12
        : level.aiProfile === 'economist' || level.aiProfile === 'builder'
          ? 8
          : 5
    const difficultyScore = round1(
      towerPressure * 5 +
        resourcePressure * 0.85 +
        aiPressure +
        profilePressure +
        handPressure -
        startingResources * 0.12,
    )
    const warnings: string[] = []

    if (index > 0 && difficultyScore < previousScore - 18) {
      warnings.push('calo difficolta rispetto al livello precedente')
    }
    if (settings.cardsInHand < 3 || settings.cardsInHand > 6) {
      warnings.push('mano fuori range campagna')
    }
    if (settings.winTower < settings.tower + 15) {
      warnings.push('obiettivo torre troppo vicino allo stato iniziale')
    }
    if (level.id > 2 && settings.winResource < economy * 18) {
      warnings.push('obiettivo risorse potenzialmente troppo rapido')
    }

    previousScore = difficultyScore

    return {
      level: level.id,
      tavern: level.tavernName,
      opponent: level.opponentName,
      mode: level.challengeMode,
      aiLevel: level.aiLevel,
      aiProfile: level.aiProfile,
      towerGoal: settings.winTower,
      resourceGoal: settings.winResource,
      cardsInHand: settings.cardsInHand,
      difficultyScore,
      warnings,
    }
  })
}

if (import.meta.main) {
  console.log(JSON.stringify(evaluateCampaignBalance(), null, 2))
}

import type {
  CampaignAiProfile,
  CampaignChallengeMode,
} from '@/campaign/levels'
import { allStatusNames, resNames } from '@/constants/resourceNames'
import cards from '@/data/cards'
import { AiCardListItemType, AiInstructionType, ScoreObjType } from '@/types/ai'
import { PersonStatusType, StatusType, WinSettingsType } from '@/types/state'
import { entries, fromEntries } from '@/utils/typeHelpers'
import { coefs } from './coefs'
import { getMaxScore } from './getMaxScore'

type AiBattleContext = {
  levelId: number
  challengeMode: CampaignChallengeMode
  profile: CampaignAiProfile
}

const statusCoefs = (() => {
  const { bricks, gems, recruits, prod, tower, wall } = coefs
  return {
    bricks,
    gems,
    recruits,
    brickProd: bricks * prod,
    gemProd: gems * prod,
    recruitProd: recruits * prod,
    tower,
    wall,
  }
})()

const victoryPressure = (
  player: PersonStatusType,
  opponent: PersonStatusType,
  winSettings: WinSettingsType,
) => {
  const towerGap = Math.max(winSettings.winTower - player.tower, 0)
  const resourceGap = Math.max(
    winSettings.winResource -
      Math.max(player.bricks, player.gems, player.recruits),
    0,
  )
  const lethalGap = Math.max(opponent.tower, 0)

  return towerGap * 1.5 + resourceGap + lethalGap * 2
}

const canPayCardCost = (
  person: PersonStatusType,
  cardType: 0 | 1 | 2,
  cost: number,
) => person[resNames[cardType]] >= cost

const hasImmediateWinningReply = (
  playerCardList: AiCardListItemType[],
  playerAfterAiMove: PersonStatusType,
  opponentAfterAiMove: PersonStatusType,
  winSettings: WinSettingsType,
) =>
  playerCardList.some((card) => {
    const dataCard = cards[card.n]

    if (!canPayCardCost(playerAfterAiMove, dataCard.type, dataCard.cost)) {
      return false
    }

    const playerAfterReply: PersonStatusType = { ...playerAfterAiMove }
    const opponentAfterReply: PersonStatusType = { ...opponentAfterAiMove }
    dataCard.effect(playerAfterReply, opponentAfterReply)

    return (
      playerAfterReply.tower >= winSettings.winTower ||
      playerAfterReply.bricks >= winSettings.winResource ||
      playerAfterReply.gems >= winSettings.winResource ||
      playerAfterReply.recruits >= winSettings.winResource ||
      opponentAfterReply.tower <= 0
    )
  })

const scoreStatusDelta = (
  before: PersonStatusType,
  after: PersonStatusType,
  attackWeight = 1,
) =>
  allStatusNames
    .map(
      (statusName) =>
        (after[statusName] - before[statusName]) *
        statusCoefs[statusName] *
        attackWeight,
    )
    .reduce((a, b) => a + b, 0)

const estimateBestPlayerReplyScore = (
  playerCardList: AiCardListItemType[],
  playerAfterAiMove: PersonStatusType,
  opponentAfterAiMove: PersonStatusType,
) =>
  playerCardList.reduce((bestScore, card) => {
    const dataCard = cards[card.n]

    if (!canPayCardCost(playerAfterAiMove, dataCard.type, dataCard.cost)) {
      return bestScore
    }

    const playerAfterReply: PersonStatusType = { ...playerAfterAiMove }
    const opponentAfterReply: PersonStatusType = { ...opponentAfterAiMove }
    dataCard.effect(playerAfterReply, opponentAfterReply)
    playerAfterReply[resNames[dataCard.type]] -= dataCard.cost

    const playerGain = scoreStatusDelta(playerAfterAiMove, playerAfterReply)
    const opponentDamage = -scoreStatusDelta(
      opponentAfterAiMove,
      opponentAfterReply,
      coefs.attack,
    )
    const replyScore = playerGain + opponentDamage

    return Math.max(bestScore, replyScore)
  }, 0)

const tacticalWeight = (aiLevel: number) =>
  aiLevel <= 0 ? 1 : aiLevel === 1 ? 0.75 : aiLevel === 2 ? 0.45 : 0.2

const discardScore = (card: AiCardListItemType, aiLevel: number) => {
  const weight = tacticalWeight(aiLevel)
  const deadCardBonus = card.canuse ? 0 : coefs.deadCardDiscardBonus * weight

  return card.score < 0
    ? Math.abs(card.score) * coefs.badCardDiscardRatio + deadCardBonus
    : card.score * -coefs.goodCardDiscardPenalty + deadCardBonus
}

const profileWeight = (context: AiBattleContext | undefined) => {
  const profile = context?.profile ?? 'balanced'
  const mode = context?.challengeMode

  return {
    tower:
      profile === 'builder' || mode === 'tower-rush'
        ? 1.35
        : profile === 'defender'
          ? 1.1
          : 1,
    wall:
      profile === 'defender' || mode === 'siege'
        ? 1.45
        : mode === 'thin-wall'
          ? 1.2
          : 1,
    economy:
      profile === 'economist' || mode === 'resource-race'
        ? 1.4
        : profile === 'tempo'
          ? 1.15
          : 1,
    attack:
      profile === 'raider' || mode === 'thin-wall'
        ? 1.38
        : mode === 'tower-rush'
          ? 1.2
          : 1,
    tempo: profile === 'tempo' || mode === 'short-hand' ? 1.35 : 1,
  }
}

const profileScore = (
  oDiff: PersonStatusType,
  pDiff: PersonStatusType,
  context: AiBattleContext | undefined,
) => {
  const weight = profileWeight(context)
  const economyGain =
    oDiff.bricks +
    oDiff.gems +
    oDiff.recruits +
    (oDiff.brickProd + oDiff.gemProd + oDiff.recruitProd) * coefs.prod
  const denial =
    -(pDiff.bricks + pDiff.gems + pDiff.recruits) -
    (pDiff.brickProd + pDiff.gemProd + pDiff.recruitProd) * coefs.prod

  return (
    oDiff.tower * coefs.profileTower * weight.tower +
    oDiff.wall * coefs.profileWall * weight.wall +
    economyGain * coefs.profileEconomy * weight.economy +
    (-pDiff.tower * coefs.profileAttack + denial * coefs.profileDenial) *
      weight.attack +
    (context?.levelId ?? 1) * coefs.profileLevelPressure * weight.tempo
  )
}

// cardList is a list of all opponent card state objects,
// each card state object includes two additional properties: canUse and canDiscard
// `null` return value is a 'surrender' instruction
export const aiDecision = (
  cardList: AiCardListItemType[],
  playerCardList: AiCardListItemType[],
  status: StatusType,
  winSettings: WinSettingsType,
  aiLevel: number,
  battleContext?: AiBattleContext,
): AiInstructionType | null => {
  // you can edit the elements inside cardList

  const { player: pBefore, opponent: oBefore } = status
  const threatBefore = victoryPressure(pBefore, oBefore, winSettings)
  // pBefore and oBefore are readonly

  for (const card of cardList) {
    card.score = 0

    const { index, n, canuse } = card
    const dataCard = cards[n]
    const { type, cost, special, effect } = dataCard
    const { winTower, winResource } = winSettings
    const pAfter: PersonStatusType = { ...pBefore }
    const oAfter: PersonStatusType = { ...oBefore }
    effect(oAfter, pAfter)

    /**
     * win immediately (but not tie)
     */
    const winImm =
      oAfter.tower >= winTower ||
      oAfter.bricks >= winResource ||
      oAfter.gems >= winResource ||
      oAfter.recruits >= winResource ||
      pAfter.tower <= 0

    const loseImm =
      pAfter.tower >= winTower ||
      pAfter.bricks >= winResource ||
      pAfter.gems >= winResource ||
      pAfter.recruits >= winResource ||
      oAfter.tower <= 0

    if (canuse && winImm && !loseImm) {
      return { index, use: true }
    }

    // =============================

    const oDiff = fromEntries<PersonStatusType>(
      entries(oBefore).map(([key, value]) => [key, oAfter[key] - value]),
    )
    const pDiff = fromEntries<PersonStatusType>(
      entries(pBefore).map(([key, value]) => [key, pAfter[key] - value]),
    )

    oDiff[resNames[type]] -= cost

    const oScore = allStatusNames
      .map((statusName) => oDiff[statusName] * statusCoefs[statusName])
      .reduce((a, b) => a + b, 0)

    // pScore here is positive
    const pScore = allStatusNames
      .map(
        (statusName) =>
          pDiff[statusName] * statusCoefs[statusName] * coefs.attack,
      )
      .reduce((a, b) => a + b, 0)

    card.score += oScore - pScore
    card.score += profileScore(oDiff, pDiff, battleContext)

    if (special?.playagain) {
      card.score += coefs.playagain * profileWeight(battleContext).tempo
    }

    if (special?.drawDiscardPlayagain) {
      card.score += coefs.drawDiscardPlayagain
    }

    if (special?.undiscardable) {
      card.score += coefs.undiscardable
    }

    if (winImm && loseImm) {
      card.score += coefs.tieBonus
    }

    if (!winImm && loseImm) {
      card.score -= coefs.losePenalty
    }

    const weight = tacticalWeight(aiLevel)
    if (weight > 0 && canuse) {
      const threatAfter = victoryPressure(pAfter, oAfter, winSettings)
      card.score += (threatBefore - threatAfter) * coefs.threatPressure * weight

      if (
        hasImmediateWinningReply(playerCardList, pAfter, oAfter, winSettings)
      ) {
        card.score -= coefs.playerImmediateWinPenalty * weight
      }

      card.score -=
        estimateBestPlayerReplyScore(playerCardList, pAfter, oAfter) *
        coefs.playerReplyPenalty *
        weight
    }
  }

  const scores = cardList.map((card) => ({
    card,
    use: true,
    scoreAll: card.score,
  }))

  const discardScores = cardList.map((card) => ({
    card,
    use: false,
    scoreAll: discardScore(card, aiLevel),
  }))

  const allScores: ScoreObjType[] = scores
    .concat(discardScores)
    .filter((c) => (c.use && c.card.canuse) || (!c.use && c.card.candiscard))

  if (allScores.length === 0) {
    // cannot find any usable or discardable card
    return null
  }

  const max = getMaxScore(allScores, aiLevel)

  return { index: max.card.index, use: max.use }
}

import { expect, test } from 'bun:test'
import { aiDecision } from '@/ai/main'
import {
  maxCampaignVisibleCardsInHand,
  maxCardsInHand,
} from '@/constants/ranges'
import { resNames } from '@/constants/resourceNames'
import cards from '@/data/cards'
import { AiCardListItemType } from '@/types/ai'
import { PersonStatusType, StatusType } from '@/types/state'

const basePerson = (): PersonStatusType => ({
  bricks: 120,
  gems: 120,
  recruits: 120,
  brickProd: 4,
  gemProd: 4,
  recruitProd: 4,
  tower: 45,
  wall: 25,
})

const makeStatus = (): StatusType => ({
  player: basePerson(),
  opponent: basePerson(),
})

const makeHand = (size: number, offset: number) =>
  Array.from(
    { length: size },
    (_, index) => (offset + index * 7) % cards.length,
  )

const toAiCards = (
  hand: number[],
  person: PersonStatusType,
): AiCardListItemType[] =>
  hand.map((n, index) => {
    const card = cards[n]

    return {
      index,
      n,
      score: 0,
      canuse: person[resNames[card.type]] >= card.cost,
      candiscard: true,
    }
  })

const applyAiInstruction = (
  hand: number[],
  instruction: { index: number; use: boolean },
  status: StatusType,
  nextCard: number,
) => {
  const cardNumber = hand[instruction.index]
  const card = cards[cardNumber]

  if (instruction.use) {
    card.effect(status.opponent, status.player)
    status.opponent[resNames[card.type]] -= card.cost
  }

  hand[instruction.index] = nextCard
}

const addProduction = (person: PersonStatusType) => {
  person.bricks += person.brickProd
  person.gems += person.gemProd
  person.recruits += person.recruitProd
}

const assertFiniteStatus = (status: StatusType) => {
  for (const person of [status.player, status.opponent]) {
    for (const value of Object.values(person)) {
      expect(Number.isFinite(value)).toBe(true)
    }
  }
}

test('AI multi-turn decisions remain stable with campaign and historical max hand sizes', () => {
  for (const cardsInHand of [
    5,
    maxCampaignVisibleCardsInHand,
    maxCardsInHand,
  ]) {
    for (const aiLevel of [0, 2, 4]) {
      const status = makeStatus()
      const opponentHand = makeHand(cardsInHand, aiLevel * 11)
      const playerHand = makeHand(cardsInHand, 97 + aiLevel * 13)

      for (let turn = 0; turn < 24; turn += 1) {
        const opponentCards = toAiCards(opponentHand, status.opponent)
        const playerCards = toAiCards(playerHand, status.player)
        const instruction = aiDecision(
          opponentCards,
          playerCards,
          status,
          { winTower: 250, winResource: 650 },
          aiLevel,
          {
            levelId: 12,
            challengeMode: turn % 2 === 0 ? 'tower-rush' : 'resource-race',
            profile: turn % 3 === 0 ? 'tempo' : 'balanced',
          },
        )

        if (instruction === null) {
          throw new Error(
            `AI returned no instruction for hand size ${cardsInHand}, level ${aiLevel}, turn ${turn}`,
          )
        }

        expect(instruction.index).toBeGreaterThanOrEqual(0)
        expect(instruction.index).toBeLessThan(opponentHand.length)

        applyAiInstruction(
          opponentHand,
          instruction,
          status,
          (turn * 17 + cardsInHand + aiLevel) % cards.length,
        )
        addProduction(status.player)
        addProduction(status.opponent)

        expect(opponentHand).toHaveLength(cardsInHand)
        expect(playerHand).toHaveLength(cardsInHand)
        assertFiniteStatus(status)
      }
    }
  }
})

import { maxCardsInHand } from '@/constants/ranges'
import type { CardListItemAllType } from '@/types/state'

export type OwnerHandLayoutCounts = {
  player: number
  opponent: number
}

export type OwnerHandLayout = {
  counts: OwnerHandLayoutCounts
  positionsByIndex: Record<number, number>
}

export const getOwnerHandLayout = (
  cards: Readonly<CardListItemAllType[]>,
): OwnerHandLayout => {
  const hands: Record<
    'player' | 'opponent',
    { index: number; position: number }[]
  > = {
    player: [],
    opponent: [],
  }

  cards.forEach((card, index) => {
    if (
      card &&
      card.position >= 0 &&
      (card.owner === 'player' || card.owner === 'opponent')
    ) {
      hands[card.owner].push({ index, position: card.position })
    }
  })

  const positionsByIndex: Record<number, number> = {}

  for (const owner of ['player', 'opponent'] as const) {
    hands[owner]
      .sort((a, b) => a.position - b.position || a.index - b.index)
      .forEach((card, layoutPosition) => {
        positionsByIndex[card.index] = layoutPosition
      })
  }

  return {
    counts: {
      player: hands.player.length,
      opponent: hands.opponent.length,
    },
    positionsByIndex,
  }
}

export const getOwnerHandLayoutCounts = (
  cards: Readonly<CardListItemAllType[]>,
): OwnerHandLayoutCounts => getOwnerHandLayout(cards).counts

export const getOwnerHandLayoutPosition = ({
  index,
  position,
  positionsByIndex,
}: {
  index: number
  position: number
  positionsByIndex: Record<number, number>
}): number => {
  if (position < 0) {
    return position
  }

  return positionsByIndex[index] ?? position
}

export const getVisibleHandCount = ({
  total,
  ownerHandCount,
}: {
  total: number
  ownerHandCount: number
}): number => Math.min(Math.max(total, ownerHandCount, 1), maxCardsInHand + 1)

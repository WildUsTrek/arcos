import { maxCardsInHand } from '@/constants/ranges'
import type { CardListItemAllType } from '@/types/state'

export type OwnerHandLayoutCounts = {
  player: number
  opponent: number
}

export const getOwnerHandLayoutCounts = (
  cards: Readonly<CardListItemAllType[]>,
): OwnerHandLayoutCounts =>
  cards.reduce<OwnerHandLayoutCounts>(
    (counts, card) => {
      if (
        card &&
        card.position >= 0 &&
        (card.owner === 'player' || card.owner === 'opponent')
      ) {
        counts[card.owner] = Math.max(counts[card.owner], card.position + 1)
      }
      return counts
    },
    { player: 0, opponent: 0 },
  )

export const getVisibleHandCount = ({
  total,
  ownerHandCount,
}: {
  total: number
  ownerHandCount: number
}): number => Math.min(Math.max(total, ownerHandCount, 1), maxCardsInHand + 1)

import { expect, test } from 'bun:test'
import {
  getOwnerHandLayout,
  getOwnerHandLayoutCounts,
  getOwnerHandLayoutPosition,
  getVisibleHandCount,
} from '@/components/zoneCards/CardHandLayout'
import { getCardLayoutMetrics } from '@/components/zoneCards/CardLayoutMetrics'
import { maxCardsInHand } from '@/constants/ranges'
import type { CardListItemAllType } from '@/types/state'

type Viewport = {
  width: number
  height: number
}

const viewports: Viewport[] = [
  { width: 852, height: 393 },
  { width: 740, height: 360 },
  { width: 667, height: 375 },
]

const getHandRects = ({
  cardsInHand,
  viewport,
}: {
  cardsInHand: number
  viewport: Viewport
}) => {
  const layout = getCardLayoutMetrics({
    cardsInHand,
    winHeight: viewport.height,
    winWidth: viewport.width,
    narrowMobile: true,
  })

  return Array.from({ length: layout.total }, (_, position) => {
    const index = position + 5
    return {
      left: layout.left[index],
      right: layout.left[index] + layout.width,
      top: layout.top[index],
      bottom: layout.top[index] + layout.height,
      width: layout.width,
      height: layout.height,
    }
  })
}

const expectNoHorizontalOverlap = (
  rects: { left: number; right: number }[],
) => {
  for (let i = 1; i < rects.length; i += 1) {
    expect(rects[i].left).toBeGreaterThanOrEqual(rects[i - 1].right)
  }
}

test('mobile hand layout fits every visible hand count including transient and max counts', () => {
  const visibleHandCounts = Array.from(
    { length: maxCardsInHand + 1 },
    (_, i) => i + 1,
  )

  for (const viewport of viewports) {
    for (const visibleHandCount of visibleHandCounts) {
      const cardsInHand = visibleHandCount - 1
      const rects = getHandRects({ cardsInHand, viewport })

      expect(rects.length).toBe(visibleHandCount)
      expect(rects[0].left).toBeGreaterThanOrEqual(0)
      expect(rects[rects.length - 1].right).toBeLessThanOrEqual(viewport.width)

      for (const rect of rects) {
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
        expect(rect.top).toBeGreaterThanOrEqual(0)
        expect(rect.bottom).toBeLessThanOrEqual(viewport.height)
      }

      expectNoHorizontalOverlap(rects)
    }
  }
})

test('rendered owner hand count protects the seventh card when totals are stale', () => {
  const cards: CardListItemAllType[] = Array.from({ length: 7 }, (_, i) => ({
    position: i,
    n: 0,
    owner: 'player',
    unusable: false,
    discarded: false,
    isFlipped: false,
    zeroOpacity: false,
  }))

  const counts = getOwnerHandLayoutCounts(cards)

  expect(counts.player).toBe(7)
  expect(getVisibleHandCount({ total: 6, ownerHandCount: counts.player })).toBe(
    7,
  )
})

test('rendered hand layout gives the seventh right-side card a unique slot', () => {
  const cards: CardListItemAllType[] = [0, 1, 2, 3, 4, 5, 5].map(
    (position) => ({
      position,
      n: 0,
      owner: 'player',
      unusable: false,
      discarded: false,
      isFlipped: false,
      zeroOpacity: false,
    }),
  )
  const handLayout = getOwnerHandLayout(cards)
  const layoutPositions = cards.map((card, index) =>
    card === null
      ? -1
      : getOwnerHandLayoutPosition({
          index,
          position: card.position,
          positionsByIndex: handLayout.positionsByIndex,
        }),
  )
  const rects = getHandRects({
    cardsInHand: handLayout.counts.player - 1,
    viewport: viewports[0],
  })

  expect(handLayout.counts.player).toBe(7)
  expect(layoutPositions).toEqual([0, 1, 2, 3, 4, 5, 6])
  expect(rects[layoutPositions[6]].left).toBeGreaterThanOrEqual(
    rects[layoutPositions[5]].right,
  )
})

test('transient duplicate hand positions are compacted without visible overlap on either side', () => {
  const transientHands = [
    {
      owner: 'player' as const,
      positions: [0, 1, 2, 3, 4, 5, 5],
    },
    {
      owner: 'player' as const,
      positions: [0, 0, 1, 2, 3, 4, 5],
    },
    {
      owner: 'opponent' as const,
      positions: [0, 1, 2, 3, 4, 5, 5],
    },
    {
      owner: 'opponent' as const,
      positions: [0, 0, 1, 2, 3, 4, 5],
    },
  ]

  for (const viewport of viewports) {
    for (const transientHand of transientHands) {
      const cards: CardListItemAllType[] = transientHand.positions.map(
        (position) => ({
          position,
          n: 0,
          owner: transientHand.owner,
          unusable: false,
          discarded: false,
          isFlipped: false,
          zeroOpacity: false,
        }),
      )
      const handLayout = getOwnerHandLayout(cards)
      const layoutPositions = cards.map((card, index) =>
        card === null
          ? -1
          : getOwnerHandLayoutPosition({
              index,
              position: card.position,
              positionsByIndex: handLayout.positionsByIndex,
            }),
      )
      const rects = getHandRects({
        cardsInHand: handLayout.counts[transientHand.owner] - 1,
        viewport,
      })
      const visibleRects = layoutPositions
        .map((layoutPosition) => rects[layoutPosition])
        .sort((a, b) => a.left - b.left)

      expect(layoutPositions).toEqual([0, 1, 2, 3, 4, 5, 6])
      expectNoHorizontalOverlap(visibleRects)
    }
  }
})

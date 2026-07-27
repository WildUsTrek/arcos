import { expect, test } from 'bun:test'
import { getCardLayoutMetrics } from '@/components/zoneCards/CardLayoutMetrics'
import { maxCardsInHand } from '@/constants/ranges'

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

test('mobile hand layout fits normal, transient, and historical max card counts', () => {
  for (const viewport of viewports) {
    for (const cardsInHand of [5, 6, 7, 8, maxCardsInHand]) {
      const rects = getHandRects({ cardsInHand, viewport })

      expect(rects.length).toBe(cardsInHand + 1)
      expect(rects[0].left).toBeGreaterThanOrEqual(0)
      expect(rects[rects.length - 1].right).toBeLessThanOrEqual(viewport.width)

      for (const rect of rects) {
        expect(rect.width).toBeGreaterThan(0)
        expect(rect.height).toBeGreaterThan(0)
        expect(rect.top).toBeGreaterThanOrEqual(0)
        expect(rect.bottom).toBeLessThanOrEqual(viewport.height)
      }

      for (let i = 1; i < rects.length; i += 1) {
        expect(rects[i].left).toBeGreaterThanOrEqual(rects[i - 1].right)
      }
    }
  }
})

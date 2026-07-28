import React, { useMemo, useContext } from 'react'
import { maxCardsInHand } from '@/constants/ranges'
import { GameSizeContext } from '@/utils/contexts/GameSizeContext'
import { getCardLayoutMetrics } from './CardLayoutMetrics'

// in px
// export type CardPosType = {
//   width: number
//   height: number
//   total: number
//   top: number[]
//   left: number[]
//   topM1: number[]
//   leftM1: number[]
// }

// const defaultCardPos: CardPosType = {
//   width: 0,
//   height: 0,
//   total: 0,
//   top: [],
//   left: [],
//   topM1: [],
//   leftM1: [],
// }

// export const CardPosContext = createContext<CardPosType | null>(null)

type PropType = {
  cardsInHand: number
  winHeight: number
  winWidth: number
}

const CardPosStyle = ({ cardsInHand, winHeight, winWidth }: PropType) => {
  const size = useContext(GameSizeContext)
  const { narrowMobile } = size

  const css = useMemo(() => {
    const defaultMetrics = getCardLayoutMetrics({
      cardsInHand,
      winHeight,
      winWidth,
      narrowMobile,
    })
    const { width, height, top, left } = defaultMetrics

    let _css = `
.endscreen-review-cards-btn {
  width: ${width}px;
  height: 3em;
  line-height: 1.1em;
  top: calc(${top[4]}px + (${height}px - 3em) / 2);
  left: ${left[4]}px;
}
.card {
  z-index: 10;
}`

    const posCsses: string[] = []

    for (let handCount = 1; handCount <= maxCardsInHand + 1; handCount += 1) {
      const metrics = getCardLayoutMetrics({
        cardsInHand: handCount - 1,
        winHeight,
        winWidth,
        narrowMobile,
      })
      const mode = `h${handCount}`

      posCsses.push(`
.card-pos-${mode} {
  --cardwidth: ${metrics.width}px;
  width: ${metrics.width}px;
  height: ${metrics.height}px;
  font-size: ${metrics.width * 0.094}px;
}`)

      for (const pos of [-5, -4, -3, -2, -1]) {
        posCsses.push(`
.card-pos-${mode}.card-pos-${pos} {
  top: ${metrics.top[pos + 5]}px;
  left: ${metrics.left[pos + 5]}px;
}`)
      }

      for (let i = 5, len = metrics.top.length; i < len; i += 1) {
        posCsses.push(`
.card-pos-${mode}.card-pos-${i - 5} {
  top: ${metrics.top[i]}px;
  left: ${metrics.left[i]}px;
  z-index: 20;
}`)
      }
    }

    _css += posCsses.join('')

    return _css
  }, [cardsInHand, winHeight, winWidth, narrowMobile])

  return <style>{css}</style>
}

export default CardPosStyle

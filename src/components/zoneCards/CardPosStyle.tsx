import React, { useMemo, useContext } from 'react'
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
    const { width, height, top, topM1, left, leftM1 } = getCardLayoutMetrics({
      cardsInHand,
      winHeight,
      winWidth,
      narrowMobile,
    })

    let _css = `
.endscreen-review-cards-btn {
  width: ${width}px;
  height: 3em;
  line-height: 1.1em;
  top: calc(${top[4]}px + (${height}px - 3em) / 2);
  left: ${left[4]}px;
}
.card {
  --cardwidth: ${width}px;
  width: ${width}px;
  height: ${height}px;
  font-size: ${width * 0.094}px;
  z-index: 10;
}`

    const posCsses = [-5, -4, -3, -2, -1].map(
      (pos) => `
.card-pos-${pos} {
  top: ${top[pos + 5]}px;
  left: ${left[pos + 5]}px;
}`,
    )

    for (let i = 5, len = top.length; i < len; i++) {
      posCsses.push(`
.card-pos-m0.card-pos-${i - 5} {
  top: ${top[i]}px;
  left: ${left[i]}px;
  z-index: 20;
}`)
    }

    for (let i = 5, len = topM1.length; i < len; i++) {
      posCsses.push(`
.card-pos-m1.card-pos-${i - 5} {
  top: ${topM1[i]}px;
  left: ${leftM1[i]}px;
  z-index: 20;
}`)
    }

    _css += posCsses.join('')

    return _css
  }, [cardsInHand, winHeight, winWidth, narrowMobile])

  return <style>{css}</style>
}

export default CardPosStyle

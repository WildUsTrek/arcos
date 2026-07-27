const heightPercToTable = 0.8
const whRatio = 188 / 252
const marginSpacingXRatio = 1.5
const minSpacingXPx = 5
const topCardSpacingPx = 10
const topCardMarginTop = 16 // '1rem' in px
const middleCardMarginBottom = 16 // '1rem' in px
const mobileSafeSideRatio = 0.04
const mobileHandVerticalShare = 0.48
const mobileHandTopShare = 1 - mobileHandVerticalShare
const mobileMinHandGapPx = 8

type CardLayoutMetricsInput = {
  cardsInHand: number
  winHeight: number
  winWidth: number
  narrowMobile: boolean
}

const shouldUseWidth = (
  tableHeight: number,
  tableWidth: number,
  total: number,
): boolean =>
  tableHeight * heightPercToTable * whRatio * total +
    (minSpacingXPx * (total - 1) + minSpacingXPx * marginSpacingXRatio * 2) <=
  tableWidth

const getHeight = (
  tableHeight: number,
  tableWidth: number,
  total: number,
): number => {
  if (shouldUseWidth(tableHeight, tableWidth, total)) {
    return tableHeight * heightPercToTable
  } else {
    return getWidth(tableHeight, tableWidth, total) / whRatio
  }
}

const getWidth = (
  tableHeight: number,
  tableWidth: number,
  total: number,
): number => {
  if (shouldUseWidth(tableHeight, tableWidth, total)) {
    return getHeight(tableHeight, tableWidth, total) * whRatio
  } else {
    return (
      (tableWidth -
        (minSpacingXPx * (total - 1) +
          minSpacingXPx * marginSpacingXRatio * 2)) /
      total
    )
  }
}

const getSpacingX = (
  winWidth: number,
  total: number,
  tableHeight: number,
): number => {
  if (shouldUseWidth(tableHeight, winWidth, total)) {
    return (
      (winWidth - getWidth(tableHeight, winWidth, total) * total) /
      (total - 1 + 2 * marginSpacingXRatio)
    )
  } else {
    return minSpacingXPx
  }
}

const getMarginX = (
  winWidth: number,
  total: number,
  tableHeight: number,
): number => getSpacingX(winWidth, total, tableHeight) * marginSpacingXRatio

const positionTopMapFunc =
  (total: number, winHeight: number, winWidth: number, narrowMobile: boolean) =>
  (position: number) => {
    const realPosition = position - 5
    const handTop = winHeight * (narrowMobile ? mobileHandTopShare : 2 / 3)
    const handHeight =
      winHeight * (narrowMobile ? mobileHandVerticalShare : 1 / 3)
    if (realPosition >= 0) {
      return (
        handTop +
        Math.max(
          mobileMinHandGapPx,
          (handHeight - getHeight(handHeight, winWidth, total)) / 2,
        )
      )
    } else if (realPosition === -5) {
      return (
        handTop -
        getHeight(handHeight, winWidth, total) +
        middleCardMarginBottom * (narrowMobile ? 1 : -1)
      )
    } else {
      return topCardMarginTop
    }
  }

const positionLeftMapFunc =
  (total: number, winHeight: number, winWidth: number, narrowMobile: boolean) =>
  (position: number) => {
    const realPosition = position - 5
    const handHeight =
      winHeight * (narrowMobile ? mobileHandVerticalShare : 1 / 3)
    if (realPosition >= 0) {
      return (
        getMarginX(winWidth, total, handHeight) +
        (getWidth(handHeight, winWidth, total) +
          getSpacingX(winWidth, total, handHeight)) *
          realPosition
      )
    } else if (realPosition === -5) {
      return winWidth / 2 - getWidth(handHeight, winWidth, total) / 2
    } else {
      return (
        winWidth / 2 -
        (getWidth(handHeight, winWidth, total) * (realPosition + 3) -
          (1 / 2 - 3 - realPosition) * topCardSpacingPx)
      )
    }
  }

export const getCardLayoutMetrics = ({
  cardsInHand,
  winHeight,
  winWidth,
  narrowMobile,
}: CardLayoutMetricsInput) => {
  const total = cardsInHand + 1
  const rangeArr = [...Array(total + 5).keys()]
  const layoutWidth = narrowMobile
    ? winWidth * (1 - mobileSafeSideRatio * 2)
    : winWidth
  const layoutOffsetX = narrowMobile ? winWidth * mobileSafeSideRatio : 0

  const zoneCardsHeight =
    winHeight * (narrowMobile ? mobileHandVerticalShare : 1 / 3)

  const width = getWidth(zoneCardsHeight, layoutWidth, total)

  const height = getHeight(zoneCardsHeight, layoutWidth, total)

  const top = rangeArr.map(
    positionTopMapFunc(total, winHeight, layoutWidth, narrowMobile),
  )
  const topM1 = rangeArr.map(
    positionTopMapFunc(total - 1, winHeight, layoutWidth, narrowMobile),
  )

  const left = rangeArr.map((position) =>
    Math.round(
      layoutOffsetX +
        positionLeftMapFunc(
          total,
          winHeight,
          layoutWidth,
          narrowMobile,
        )(position),
    ),
  )
  const leftM1 = rangeArr.map((position) =>
    Math.round(
      layoutOffsetX +
        positionLeftMapFunc(
          total - 1,
          winHeight,
          layoutWidth,
          narrowMobile,
        )(position),
    ),
  )

  return {
    total,
    rangeArr,
    layoutWidth,
    layoutOffsetX,
    zoneCardsHeight,
    width,
    height,
    top,
    topM1,
    left,
    leftM1,
  }
}

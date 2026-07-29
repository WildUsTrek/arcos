export type MobilePlayabilityInput = {
  width: number
  height: number
  coarsePointer: boolean
  hoverNone: boolean
  fullscreenEnabled?: boolean
}

export type MobilePlayabilityState = {
  touchLike: boolean
  mobileSizedViewport: boolean
  portraitViewport: boolean
  crampedLandscapeViewport: boolean
  needsLandscapeNotice: boolean
  needsFullscreenGate: boolean
}

const mobileViewportShortSideMax = 560
const mobileLandscapeMinWidth = 640
const mobileLandscapeMinHeight = 340

export const getMobilePlayability = ({
  width,
  height,
  coarsePointer,
  hoverNone,
  fullscreenEnabled = false,
}: MobilePlayabilityInput): MobilePlayabilityState => {
  const touchLike = coarsePointer || hoverNone
  const mobileSizedViewport =
    touchLike && Math.min(width, height) <= mobileViewportShortSideMax
  const portraitViewport = height > width
  const crampedLandscapeViewport =
    mobileSizedViewport &&
    !portraitViewport &&
    (width < mobileLandscapeMinWidth || height < mobileLandscapeMinHeight)
  const needsLandscapeNotice = portraitViewport

  return {
    touchLike,
    mobileSizedViewport,
    portraitViewport,
    crampedLandscapeViewport,
    needsLandscapeNotice,
    needsFullscreenGate:
      Boolean(fullscreenEnabled) &&
      mobileSizedViewport &&
      !needsLandscapeNotice,
  }
}

export const readMobilePointerState = () => ({
  coarsePointer:
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(any-pointer: coarse)').matches,
  hoverNone:
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(any-hover: none)').matches,
})

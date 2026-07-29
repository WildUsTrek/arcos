import { expect, test } from 'bun:test'
import { getMobilePlayability } from '@/utils/mobilePlayability'

test('mobile portrait always requires the rotate notice before fullscreen', () => {
  const state = getMobilePlayability({
    width: 393,
    height: 852,
    coarsePointer: true,
    hoverNone: true,
    fullscreenEnabled: true,
  })

  expect(state.mobileSizedViewport).toBe(true)
  expect(state.portraitViewport).toBe(true)
  expect(state.needsLandscapeNotice).toBe(true)
  expect(state.needsFullscreenGate).toBe(false)
})

test('valid mobile landscape can request fullscreen without rotate notice', () => {
  const state = getMobilePlayability({
    width: 852,
    height: 393,
    coarsePointer: true,
    hoverNone: true,
    fullscreenEnabled: true,
  })

  expect(state.mobileSizedViewport).toBe(true)
  expect(state.portraitViewport).toBe(false)
  expect(state.crampedLandscapeViewport).toBe(false)
  expect(state.needsLandscapeNotice).toBe(false)
  expect(state.needsFullscreenGate).toBe(true)
})

test('cramped mobile landscape does not deadlock behind the rotate notice', () => {
  const state = getMobilePlayability({
    width: 610,
    height: 330,
    coarsePointer: true,
    hoverNone: true,
    fullscreenEnabled: true,
  })

  expect(state.mobileSizedViewport).toBe(true)
  expect(state.crampedLandscapeViewport).toBe(true)
  expect(state.needsLandscapeNotice).toBe(false)
  expect(state.needsFullscreenGate).toBe(true)
})

test('desktop portrait keeps the historical rotate notice behavior', () => {
  const state = getMobilePlayability({
    width: 900,
    height: 1200,
    coarsePointer: false,
    hoverNone: false,
    fullscreenEnabled: false,
  })

  expect(state.mobileSizedViewport).toBe(false)
  expect(state.needsLandscapeNotice).toBe(true)
  expect(state.needsFullscreenGate).toBe(false)
})

import { expect, test } from 'bun:test'
import { INIT } from '../../src/constants/ActionTypes'
import reducers from '../../src/reducers'

test('initial store matches the offline campaign contract', () => {
  const state = reducers(undefined, { type: INIT })

  expect(state.lang.code).toBe('it')
  expect(state.campaign).toEqual({
    activeChallengeMode: null,
    activeLevel: null,
    challengeSeed: 20260722,
    completedLevels: [],
    lastCompletedLevel: null,
    unlockedLevel: 1,
  })
  expect('multiplayer' in state).toBe(false)
})

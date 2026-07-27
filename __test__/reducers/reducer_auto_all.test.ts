import { expect, test } from 'bun:test'
import {
  CAMPAIGN_COMPLETE_LEVEL_MAIN,
  INIT,
  SCREEN_END_MAIN,
  UPDATE_CAMPAIGN_PROGRESS_MAIN,
} from '../../src/constants/ActionTypes'
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

test('campaign completion unlocks the next challenger instead of replaying level one', () => {
  const state = reducers(undefined, {
    type: CAMPAIGN_COMPLETE_LEVEL_MAIN,
    levelId: 1,
    challengeSeed: 12345,
  })

  expect(state.campaign.completedLevels).toEqual([1])
  expect(state.campaign.lastCompletedLevel).toBe(1)
  expect(state.campaign.unlockedLevel).toBe(2)
})

test('cached campaign progress restores the next playable level', () => {
  const state = reducers(undefined, {
    type: UPDATE_CAMPAIGN_PROGRESS_MAIN,
    payload: {
      completedLevels: [1, 2],
      lastCompletedLevel: 2,
      unlockedLevel: 3,
      challengeSeed: 777,
    },
  })

  expect(state.campaign.completedLevels).toEqual([1, 2])
  expect(state.campaign.lastCompletedLevel).toBe(2)
  expect(state.campaign.unlockedLevel).toBe(3)
  expect(state.campaign.challengeSeed).toBe(777)
})

test('end screen stores campaign outcome details', () => {
  const state = reducers(undefined, {
    type: SCREEN_END_MAIN,
    payload: {
      type: 'lose',
      campaignOutcome: 'campaign-lost',
      campaignLevelId: 4,
    },
  })

  expect(state.screen.end.type).toBe('lose')
  expect(state.screen.end.campaignOutcome).toBe('campaign-lost')
  expect(state.screen.end.campaignLevelId).toBe(4)
})

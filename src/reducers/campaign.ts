import { produce } from 'immer'
import { campaignLevelCount, defaultCampaignSeed } from '@/campaign/levels'
import {
  CAMPAIGN_ACK_BATTLE_INTRO,
  CAMPAIGN_COMPLETE_LEVEL_MAIN,
  CAMPAIGN_START_LEVEL_MAIN,
  UPDATE_CAMPAIGN_PROGRESS_MAIN,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { CampaignStateType } from '@/types/state'

export const defaultCampaignState: CampaignStateType = {
  unlockedLevel: 1,
  activeLevel: null,
  activeChallengeMode: null,
  battleIntroAcknowledged: false,
  challengeSeed: defaultCampaignSeed,
  completedLevels: [],
  lastCompletedLevel: null,
}

const uniqueSortedLevels = (levels: number[]) =>
  [...new Set(levels)]
    .filter((level) => level >= 1 && level <= campaignLevelCount)
    .sort((a, b) => a - b)

export default produce((draft: CampaignStateType, action: RootActionType) => {
  switch (action.type) {
    case UPDATE_CAMPAIGN_PROGRESS_MAIN: {
      const payloadHasActiveLevel = Object.prototype.hasOwnProperty.call(
        action.payload,
        'activeLevel',
      )
      const payloadHasActiveChallengeMode =
        Object.prototype.hasOwnProperty.call(
          action.payload,
          'activeChallengeMode',
        )

      draft.completedLevels = uniqueSortedLevels(
        action.payload.completedLevels ?? draft.completedLevels,
      )
      draft.unlockedLevel = Math.min(
        Math.max(action.payload.unlockedLevel ?? draft.unlockedLevel, 1),
        campaignLevelCount,
      )
      draft.lastCompletedLevel =
        action.payload.lastCompletedLevel ?? draft.lastCompletedLevel
      draft.challengeSeed = action.payload.challengeSeed ?? draft.challengeSeed
      if (payloadHasActiveLevel) {
        draft.activeLevel = action.payload.activeLevel ?? null
        if (draft.activeLevel === null) {
          draft.battleIntroAcknowledged = false
        }
      }
      if (payloadHasActiveChallengeMode) {
        draft.activeChallengeMode = action.payload.activeChallengeMode ?? null
      }
      if (action.payload.battleIntroAcknowledged !== undefined) {
        draft.battleIntroAcknowledged = action.payload.battleIntroAcknowledged
      }
      break
    }
    case CAMPAIGN_START_LEVEL_MAIN: {
      draft.activeLevel = action.levelId
      draft.activeChallengeMode = action.challengeMode
      draft.battleIntroAcknowledged = false
      break
    }
    case CAMPAIGN_ACK_BATTLE_INTRO: {
      draft.battleIntroAcknowledged = true
      break
    }
    case CAMPAIGN_COMPLETE_LEVEL_MAIN: {
      draft.completedLevels = uniqueSortedLevels([
        ...draft.completedLevels,
        action.levelId,
      ])
      draft.unlockedLevel = Math.min(
        Math.max(draft.unlockedLevel, action.levelId + 1),
        campaignLevelCount,
      )
      draft.lastCompletedLevel = action.levelId
      draft.activeLevel = null
      draft.activeChallengeMode = null
      draft.battleIntroAcknowledged = false
      draft.challengeSeed = action.challengeSeed
      break
    }
  }
}, defaultCampaignState)

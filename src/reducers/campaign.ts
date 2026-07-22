import { produce } from 'immer'
import { campaignLevelCount, defaultCampaignSeed } from '@/campaign/levels'
import {
  CAMPAIGN_COMPLETE_LEVEL_MAIN,
  CAMPAIGN_START_LEVEL_MAIN,
  UPDATE_CAMPAIGN_PROGRESS_MAIN,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { CampaignStateType } from '@/types/state'

const defaultCampaignState: CampaignStateType = {
  unlockedLevel: 1,
  activeLevel: null,
  activeChallengeMode: null,
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
      draft.activeChallengeMode =
        action.payload.activeChallengeMode ?? draft.activeChallengeMode
      break
    }
    case CAMPAIGN_START_LEVEL_MAIN: {
      draft.activeLevel = action.levelId
      draft.activeChallengeMode = action.challengeMode
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
      draft.challengeSeed = action.challengeSeed
      break
    }
  }
}, defaultCampaignState)

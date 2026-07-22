import { ofType, StateObservable } from 'redux-observable'
import { Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { campaignLevelCount, nextCampaignSeed } from '@/campaign/levels'
import {
  CAMPAIGN_COMPLETE_LEVEL,
  CAMPAIGN_COMPLETE_LEVEL_MAIN,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'
import {
  campaignCacheClear,
  campaignCacheSet,
  lsSet,
} from '@/utils/localstorage'

const uniqueSortedLevels = (levels: number[]) =>
  [...new Set(levels)]
    .filter((level) => level >= 1 && level <= campaignLevelCount)
    .sort((a, b) => a - b)

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(CAMPAIGN_COMPLETE_LEVEL),
    mergeMap((action) => {
      const completedLevels = uniqueSortedLevels([
        ...state$.value.campaign.completedLevels,
        action.levelId,
      ])
      const unlockedLevel = Math.min(
        Math.max(state$.value.campaign.unlockedLevel, action.levelId + 1),
        campaignLevelCount,
      )
      const challengeSeed = nextCampaignSeed(
        state$.value.campaign.challengeSeed,
        action.levelId,
      )
      const campaignProgress = {
        completedLevels,
        unlockedLevel,
        challengeSeed,
        activeChallengeMode: null,
        activeLevel: null,
        lastCompletedLevel: action.levelId,
      }
      const campaignCompleted = completedLevels.length >= campaignLevelCount

      lsSet((draft) => {
        if (campaignCompleted) {
          delete draft.campaign
        } else {
          draft.campaign = campaignProgress
        }
      })
      if (campaignCompleted) {
        campaignCacheClear()
      } else {
        campaignCacheSet(campaignProgress)
      }

      return of<RootActionType>({
        type: CAMPAIGN_COMPLETE_LEVEL_MAIN,
        levelId: action.levelId,
        challengeSeed,
      })
    }),
  )

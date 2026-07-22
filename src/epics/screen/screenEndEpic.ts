import { ofType, StateObservable } from 'redux-observable'
import { concat, EMPTY, Observable, of } from 'rxjs'
import { withLatestFrom, mergeMap } from 'rxjs/operators'
import {
  ABORT_ALL,
  CAMPAIGN_COMPLETE_LEVEL,
  SCREEN_END,
  SCREEN_END_MAIN,
  UPDATE_CAMPAIGN_PROGRESS_MAIN,
} from '@/constants/ActionTypes'
import { defaultCampaignState } from '@/reducers/campaign'
import { RootActionType } from '@/types/actionObj'
import { isEndScreenNoCloseState, RootStateType } from '@/types/state'
import { campaignCacheClear, lsSet } from '@/utils/localstorage'
import { play } from '@/utils/sound/Sound'

const soundMap = { lose: 'defeat', tie: 'victory', win: 'victory' } as const

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(SCREEN_END),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { payload } = action
      if (isEndScreenNoCloseState(payload)) {
        play(soundMap[payload.type])
      }
      const shouldCompleteCampaignLevel =
        payload.type === 'win' && state.campaign.activeLevel !== null
      const shouldResetCampaign =
        payload.type === 'lose' && state.campaign.activeLevel !== null
      if (shouldResetCampaign) {
        campaignCacheClear()
        lsSet((draft) => {
          delete draft.campaign
        })
      }
      return concat(
        of<RootActionType>({
          type: ABORT_ALL,
        }),
        shouldResetCampaign
          ? of<RootActionType>({
              type: UPDATE_CAMPAIGN_PROGRESS_MAIN,
              payload: defaultCampaignState,
            })
          : EMPTY,
        shouldCompleteCampaignLevel
          ? of<RootActionType>({
              type: CAMPAIGN_COMPLETE_LEVEL,
              levelId: state.campaign.activeLevel as number,
            })
          : EMPTY,
        of<RootActionType>({
          type: SCREEN_END_MAIN,
          payload,
        }),
      )
    }),
  )

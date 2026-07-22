import { ofType, StateObservable } from 'redux-observable'
import { concat, Observable, of } from 'rxjs'
import { mergeMap, takeUntil, withLatestFrom, delay } from 'rxjs/operators'
import {
  DRAW_CARD,
  DRAW_CARD_CORE,
  ABORT_ALL,
  SWITCH_LOCK,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'
import { randomWithProbs } from '@/utils/randomWithProbs'

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(DRAW_CARD),
    withLatestFrom(state$),
    mergeMap(([_action, _state]) => {
      return concat(
        of<RootActionType>({
          type: SWITCH_LOCK,
          on: true,
          locknumber: 1,
        }),
        of<RootActionType>({
          type: DRAW_CARD_CORE,
          n: randomWithProbs(),
        }).pipe(delay(0)),
      ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

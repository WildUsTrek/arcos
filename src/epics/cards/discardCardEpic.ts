import { ofType, StateObservable } from 'redux-observable'
import { of, Observable } from 'rxjs'
import { withLatestFrom, mergeMap, takeUntil } from 'rxjs/operators'
import {
  DISCARD_CARD,
  DISCARD_CARD_CORE,
  ABORT_ALL,
  PLAY_CARD_CORE_GUARDED,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(DISCARD_CARD),
    withLatestFrom(state$),
    mergeMap(([action, _state]) => {
      const { index, position, owner } = action

      return of<RootActionType>({
        type: PLAY_CARD_CORE_GUARDED,
        payload: {
          type: DISCARD_CARD_CORE,
          index,
          position,
          owner,
        },
      ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

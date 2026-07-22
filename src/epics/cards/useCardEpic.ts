import { ofType, StateObservable } from 'redux-observable'
import { Observable, of } from 'rxjs'
import { mergeMap, withLatestFrom, takeUntil } from 'rxjs/operators'
import {
  USE_CARD,
  USE_CARD_CORE,
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
    ofType(USE_CARD),
    withLatestFrom(state$),
    mergeMap(([action, _state]) => {
      const { n, index, position, owner } = action

      return of<RootActionType>({
        type: PLAY_CARD_CORE_GUARDED,
        payload: {
          type: USE_CARD_CORE,
          n,
          index,
          position,
          owner,
        },
      ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

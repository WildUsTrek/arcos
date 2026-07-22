import { ofType, StateObservable } from 'redux-observable'
import { concat, Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import {
  CLOSE_SCREEN_END_INIT,
  INIT,
  SCREEN_END,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'

export default (
  action$: Observable<RootActionType>,
  _state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(CLOSE_SCREEN_END_INIT),
    mergeMap((_action) =>
      concat(
        of<RootActionType>({
          type: SCREEN_END,
          payload: { type: null },
        }),
        of<RootActionType>({
          type: INIT,
          fromScreenEnd: true,
        }),
      ),
    ),
  )

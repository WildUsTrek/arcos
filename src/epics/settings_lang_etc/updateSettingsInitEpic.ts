import { ofType, StateObservable } from 'redux-observable'
import { of, concat, Observable } from 'rxjs'
import { mergeMap, delay } from 'rxjs/operators'
import {
  UPDATE_SETTINGS_INIT,
  UPDATE_SETTINGS,
  INIT,
} from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'

export default (
  action$: Observable<RootActionType>,
  _state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(UPDATE_SETTINGS_INIT),
    mergeMap((action) => {
      const { payload } = action

      return concat(
        of<RootActionType>({
          type: UPDATE_SETTINGS,
          payload,
        }),
        of<RootActionType>({
          type: INIT,
        }).pipe(delay(0)),
      )
    }),
  )

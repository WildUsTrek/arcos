import { ofType, StateObservable } from 'redux-observable'
import { Observable, of } from 'rxjs'
import { mergeMap, takeUntil } from 'rxjs/operators'
import {
  UPDATE_LANG,
  UPDATE_LANG_MAIN,
  ABORT_ALL,
} from '@/constants/ActionTypes'
import { defaultBoldfont, defaultErathian } from '@/constants/defaultSettings'
import { defaultLang } from '@/i18n/langs'
import { RootActionType } from '@/types/actionObj'
import { RootStateType } from '@/types/state'
import { lsSet } from '@/utils/localstorage'

export default (
  action$: Observable<RootActionType>,
  _state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(UPDATE_LANG),
    mergeMap((_action) => {
      lsSet((draft) => {
        if (draft.lang === undefined) {
          draft.lang = {
            code: defaultLang,
            boldfont: defaultBoldfont,
            erathian: defaultErathian,
          }
        } else {
          draft.lang.code = defaultLang
        }
      })
      return of<RootActionType>({
        type: UPDATE_LANG_MAIN,
        lang: defaultLang,
      }).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

import { ofType, StateObservable } from 'redux-observable'
import { EMPTY, Observable, of } from 'rxjs'
import { withLatestFrom, mergeMap, takeUntil } from 'rxjs/operators'
import checkCardUseDiscard from '@/ai/checkCardUseDiscard'
import { ABORT_ALL, SCREEN_END, CHECK_SURRENDER } from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { AiCardListItemType } from '@/types/ai'
import { RootStateType } from '@/types/state'

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(CHECK_SURRENDER),
    withLatestFrom(state$),
    mergeMap(([_action, state]) => {
      // it borrows `checkCardUseDiscard` function and relavant types in ai/ folder
      const cardList: AiCardListItemType[] = checkCardUseDiscard(
        state,
        'player',
      ).filter((card) => card.canuse || card.candiscard)

      if (cardList.length === 0) {
        return of<RootActionType>({
          type: SCREEN_END,
          payload: { type: 'lose', surrender: true },
        }).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
      } else {
        return EMPTY
      }
    }),
  )

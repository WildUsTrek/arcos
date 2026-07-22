import { ofType, StateObservable } from 'redux-observable'
import { Observable, of } from 'rxjs'
import { withLatestFrom, mergeMap } from 'rxjs/operators'
import { INIT, INIT_CORE } from '@/constants/ActionTypes'
import { RootActionType } from '@/types/actionObj'
import { CardListItemAllType, RootStateType } from '@/types/state'
import { randomWithProbs } from '@/utils/randomWithProbs'

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(INIT),
    withLatestFrom(state$),
    mergeMap(([_action, state]) => {
      const playersTurn = Math.random() < 0.5
      const cardList: CardListItemAllType[] = []
      const total = state.settings.cardsInHand
      for (let i = 0, l = total * 2; i < l; i++) {
        const card: CardListItemAllType = {
          position: i % total,
          n: randomWithProbs(),
          unusable: false,
          discarded: false,
          isFlipped: false,
          zeroOpacity: false,
          owner: i < total ? 'player' : 'opponent',
        }
        cardList.push(card)
      }

      return of<RootActionType>({
        type: INIT_CORE,
        playersTurn,
        cardList,
        gameNumber: -1,
      })
    }),
  )

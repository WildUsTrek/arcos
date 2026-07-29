import { ofType, StateObservable } from 'redux-observable'
import { concat, EMPTY, Observable, of } from 'rxjs'
import { withLatestFrom, mergeMap, delay, takeUntil } from 'rxjs/operators'
import {
  DRAW_CARD_CORE,
  DRAW_CARD_PRE,
  DRAW_CARD_MAIN,
  CHECK_UNUSABLE,
  AI_PLAY_CARD,
  ABORT_ALL,
  CHECK_SURRENDER,
  SWITCH_LOCK,
} from '@/constants/ActionTypes'
import {
  aiExtraDelay,
  noAiExtraDelay,
  shouldUseAi,
} from '@/constants/devSettings'
import {
  maxCampaignVisibleCardsInHand,
  maxCardsInHand,
} from '@/constants/ranges'
import {
  drawCardPre,
  cardTransitionDuration,
  aiDelay,
} from '@/constants/visuals'
import { RootActionType } from '@/types/actionObj'
import { ownerType2, RootStateType } from '@/types/state'
import devLog from '@/utils/devLog'
import getPan from '@/utils/sound/getPan'
import { play } from '@/utils/sound/Sound'

const getVisibleHandCount = (state: RootStateType, owner: ownerType2) =>
  state.cards.list.filter(
    (card) => card !== null && card.owner === owner && card.position >= 0,
  ).length

const getVisibleHandLimit = (state: RootStateType) =>
  state.campaign.activeLevel !== null
    ? maxCampaignVisibleCardsInHand
    : maxCardsInHand + 1

export default (
  action$: Observable<RootActionType>,
  state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(DRAW_CARD_CORE),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { n } = action
      const owner = state.game.playersTurn ? 'player' : 'opponent'
      const visibleHandLimit = getVisibleHandLimit(state)
      const visibleHandCount = Math.max(
        state.cards.total[owner],
        getVisibleHandCount(state, owner),
      )

      if (visibleHandCount >= visibleHandLimit) {
        devLog(
          `${owner} draw skipped at hand limit ${visibleHandLimit}`,
          'info',
        )

        return concat(
          of<RootActionType>({
            type: SWITCH_LOCK,
            on: false,
            locknumber: 1,
          }).pipe(delay(0)),
          owner === 'opponent' && shouldUseAi
            ? of<RootActionType>({
                type: AI_PLAY_CARD,
              }).pipe(delay(aiDelay + (noAiExtraDelay ? 0 : aiExtraDelay)))
            : EMPTY,
          owner === 'player'
            ? of<RootActionType>({
                type: CHECK_SURRENDER,
              }).pipe(delay(0))
            : EMPTY,
        ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
      }

      play(
        'deal',
        null,
        state.sound.stereo
          ? getPan(state.cards.total[owner] + 1, state.cards.nextPos[owner])
          : 0,
      )

      devLog(`${owner} draws card ${n}`, 'info')

      return concat(
        of<RootActionType>({
          type: DRAW_CARD_PRE,
          n,
        }),
        of<RootActionType>({
          type: CHECK_UNUSABLE,
          lastOnly: true,
        }),
        of<RootActionType>({
          type: DRAW_CARD_MAIN,
          owner,
        }).pipe(delay(drawCardPre)),
        of<RootActionType>({
          type: SWITCH_LOCK,
          on: false,
          locknumber: 1,
        }).pipe(delay(0)),
        owner === 'opponent' && shouldUseAi
          ? of<RootActionType>({
              type: AI_PLAY_CARD,
            }).pipe(
              delay(
                cardTransitionDuration +
                  aiDelay +
                  (noAiExtraDelay ? 0 : aiExtraDelay),
              ),
            )
          : EMPTY,
        owner === 'player'
          ? of<RootActionType>({
              type: CHECK_SURRENDER,
            }).pipe(delay(0))
          : EMPTY,
      ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

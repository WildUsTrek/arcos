import { expect, test } from 'bun:test'
import { StateObservable } from 'redux-observable'
import { Subject } from 'rxjs'
import {
  CHECK_SURRENDER,
  DRAW_CARD_CORE,
  INIT,
  SWITCH_LOCK,
} from '../../src/constants/ActionTypes'
import { maxCampaignVisibleCardsInHand } from '../../src/constants/ranges'
import drawCardCoreEpic from '../../src/epics/cards/drawCardCoreEpic'
import reducers from '../../src/reducers'
import { RootActionType } from '../../src/types/actionObj'
import {
  CardListItemAllType,
  RootStateType,
  ownerType2,
} from '../../src/types/state'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const makeHand = (owner: ownerType2): CardListItemAllType[] =>
  Array.from({ length: maxCampaignVisibleCardsInHand }, (_, position) => ({
    position,
    n: 0,
    owner,
    unusable: false,
    discarded: false,
    isFlipped: false,
    zeroOpacity: false,
  }))

test('campaign draw skips new cards when the player hand is already at the mobile cap', async () => {
  const baseState = reducers(undefined, { type: INIT })
  const cappedState: RootStateType = {
    ...baseState,
    campaign: {
      ...baseState.campaign,
      activeLevel: 1,
    },
    game: {
      ...baseState.game,
      playersTurn: true,
    },
    cards: {
      total: {
        player: maxCampaignVisibleCardsInHand,
        opponent: 0,
      },
      nextPos: {
        player: maxCampaignVisibleCardsInHand,
        opponent: 0,
      },
      list: makeHand('player'),
    },
  }
  const actionSubject = new Subject<RootActionType>()
  const stateSubject = new Subject<RootStateType>()
  const state$ = new StateObservable(stateSubject, cappedState)
  const emitted: RootActionType[] = []
  const subscription = drawCardCoreEpic(actionSubject, state$).subscribe(
    (action) => {
      emitted.push(action)
    },
  )

  actionSubject.next({ type: DRAW_CARD_CORE, n: 0 })
  await flush()

  expect(emitted).toEqual([
    {
      type: SWITCH_LOCK,
      on: false,
      locknumber: 1,
    },
    {
      type: CHECK_SURRENDER,
    },
  ])

  subscription.unsubscribe()
})

import { expect, test } from 'bun:test'
import { StateObservable } from 'redux-observable'
import { Subject } from 'rxjs'
import {
  ABORT_ALL,
  INIT,
  PLAY_CARD_CORE_GUARDED,
  SWITCH_LOCK,
  USE_CARD_CORE,
} from '../../src/constants/ActionTypes'
import playCardCoreGuardedEpic from '../../src/epics/cards/playCardCoreGuardedEpic'
import reducers from '../../src/reducers'
import { RootActionType } from '../../src/types/actionObj'
import { RootStateType } from '../../src/types/state'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const guardedUseCardAction: RootActionType = {
  type: PLAY_CARD_CORE_GUARDED,
  payload: {
    type: USE_CARD_CORE,
    index: 0,
    n: 0,
    owner: 'player',
    position: 0,
  },
}

test('guarded card action waits for the gameplay lock to clear', async () => {
  const baseState = reducers(undefined, { type: INIT })
  const lockedState = reducers(baseState, {
    type: SWITCH_LOCK,
    on: true,
  })
  const unlockedState = reducers(lockedState, {
    type: SWITCH_LOCK,
    on: false,
  })
  const actionSubject = new Subject<RootActionType>()
  const stateSubject = new Subject<RootStateType>()
  const state$ = new StateObservable(stateSubject, lockedState)
  const emitted: RootActionType[] = []
  const subscription = playCardCoreGuardedEpic(actionSubject, state$).subscribe(
    (action) => {
      emitted.push(action)
    },
  )

  actionSubject.next(guardedUseCardAction)
  await flush()

  expect(emitted).toEqual([])

  stateSubject.next(unlockedState)
  await flush()

  expect(emitted).toEqual([guardedUseCardAction.payload])

  subscription.unsubscribe()
})

test('guarded card action is cancelled by a full game abort', async () => {
  const baseState = reducers(undefined, { type: INIT })
  const lockedState = reducers(baseState, {
    type: SWITCH_LOCK,
    on: true,
  })
  const unlockedState = reducers(lockedState, {
    type: SWITCH_LOCK,
    on: false,
  })
  const actionSubject = new Subject<RootActionType>()
  const stateSubject = new Subject<RootStateType>()
  const state$ = new StateObservable(stateSubject, lockedState)
  const emitted: RootActionType[] = []
  const subscription = playCardCoreGuardedEpic(actionSubject, state$).subscribe(
    (action) => {
      emitted.push(action)
    },
  )

  actionSubject.next(guardedUseCardAction)
  actionSubject.next({ type: ABORT_ALL })
  stateSubject.next(unlockedState)
  await flush()

  expect(emitted).toEqual([])

  subscription.unsubscribe()
})

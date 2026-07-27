import { expect, test } from 'bun:test'
import { StateObservable } from 'redux-observable'
import { Subject } from 'rxjs'
import {
  AI_PLAY_CARD,
  ABORT_ALL,
  INIT,
  SCREEN_HELP,
} from '../../src/constants/ActionTypes'
import aiPlayCardEpic from '../../src/epics/cards/aiPlayCardEpic'
import reducers from '../../src/reducers'
import { RootActionType } from '../../src/types/actionObj'
import { RootStateType } from '../../src/types/state'

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

test('AI action pauses behind an overlay and resumes after it closes', async () => {
  const baseState = reducers(undefined, { type: INIT })
  const screenState = reducers(baseState, { type: SCREEN_HELP, show: true })
  const closedState = reducers(screenState, { type: SCREEN_HELP, show: false })
  const actionSubject = new Subject<RootActionType>()
  const stateSubject = new Subject<RootStateType>()
  const state$ = new StateObservable(stateSubject, screenState)
  const emitted: RootActionType[] = []
  const subscription = aiPlayCardEpic(actionSubject, state$).subscribe(
    (action) => {
      emitted.push(action)
    },
  )

  actionSubject.next({ type: AI_PLAY_CARD })
  await flush()

  expect(emitted).toEqual([])

  stateSubject.next(closedState)
  await flush()

  expect(emitted).toEqual([{ type: AI_PLAY_CARD }])

  subscription.unsubscribe()
})

test('AI overlay pause is cancelled when the battle is aborted', async () => {
  const baseState = reducers(undefined, { type: INIT })
  const screenState = reducers(baseState, { type: SCREEN_HELP, show: true })
  const closedState = reducers(screenState, { type: SCREEN_HELP, show: false })
  const actionSubject = new Subject<RootActionType>()
  const stateSubject = new Subject<RootStateType>()
  const state$ = new StateObservable(stateSubject, screenState)
  const emitted: RootActionType[] = []
  const subscription = aiPlayCardEpic(actionSubject, state$).subscribe(
    (action) => {
      emitted.push(action)
    },
  )

  actionSubject.next({ type: AI_PLAY_CARD })
  actionSubject.next({ type: ABORT_ALL })
  stateSubject.next(closedState)
  await flush()

  expect(emitted).toEqual([])

  subscription.unsubscribe()
})

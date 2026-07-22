import { ofType, StateObservable } from 'redux-observable'
import { of, concat, EMPTY, Observable } from 'rxjs'
import { mergeMap, takeUntil } from 'rxjs/operators'
import {
  READLS_UPDATESTORE_INIT,
  UPDATE_SETTINGS_MAIN,
  ABORT_ALL,
  INIT,
  UPDATE_BOLDFONT_MAIN,
  UPDATE_ERATHIAN_MAIN,
  UPDATE_LANG_MAIN,
  UPDATE_VOLUME_MAIN,
  UPDATE_STEREO_MAIN,
  UPDATE_NOANIM_MAIN,
  UPDATE_PIXELATION_MAIN,
  UPDATE_VISUALVALUES_MAIN,
  UPDATE_CAMPAIGN_PROGRESS_MAIN,
} from '@/constants/ActionTypes'
import { defaultLang } from '@/i18n/langs'
import { RootActionType } from '@/types/actionObj'
import {
  RootStateType,
  CampaignStateType,
  SettingsStateType,
  VisualValuesType,
} from '@/types/state'
import { campaignCacheGet, lsGet, lsSet, lsVersion } from '@/utils/localstorage'

export default (
  action$: Observable<RootActionType>,
  _state$: StateObservable<RootStateType>,
) =>
  action$.pipe(
    ofType(READLS_UPDATESTORE_INIT),
    mergeMap((_action) => {
      lsVersion()
      lsSet((draft) => {
        draft.lang = {
          code: defaultLang,
          boldfont: lsGet<boolean>(['lang', 'boldfont']) ?? false,
          erathian: lsGet<boolean>(['lang', 'erathian']) ?? false,
        }
      })
      const boldfont = lsGet<boolean>(['lang', 'boldfont'])
      const erathian = lsGet<boolean>(['lang', 'erathian'])
      const settings = lsGet<Partial<SettingsStateType>>(['settings'])
      const volume = lsGet<number>(['sound', 'volume'])
      const stereo = lsGet<boolean>(['sound', 'stereo'])
      const noanim = lsGet<boolean>(['visual', 'noanim'])
      const pixelation = lsGet<number>(['visual', 'pixelation'])
      const visualvalues = lsGet<Partial<VisualValuesType>>([
        'visual',
        'visualvalues',
      ])
      const campaign =
        campaignCacheGet() ?? lsGet<Partial<CampaignStateType>>(['campaign'])
      const playerName = settings?.playerName ?? 'Avventuriero'

      return concat(
        of<RootActionType>({
          type: UPDATE_SETTINGS_MAIN,
          payload: {
            playerName,
            opponentName: 'Sfidante',
          },
        }),
        of<RootActionType>({
          type: UPDATE_LANG_MAIN,
          lang: defaultLang,
        }),
        boldfont !== null
          ? of<RootActionType>({
              type: UPDATE_BOLDFONT_MAIN,
              boldfont,
            })
          : EMPTY,
        erathian !== null
          ? of<RootActionType>({
              type: UPDATE_ERATHIAN_MAIN,
              erathian,
            })
          : EMPTY,
        volume !== null
          ? of<RootActionType>({
              type: UPDATE_VOLUME_MAIN,
              volume,
            })
          : EMPTY,
        stereo !== null
          ? of<RootActionType>({
              type: UPDATE_STEREO_MAIN,
              stereo,
            })
          : EMPTY,
        noanim !== null
          ? of<RootActionType>({
              type: UPDATE_NOANIM_MAIN,
              noanim,
            })
          : EMPTY,
        pixelation !== null
          ? of<RootActionType>({
              type: UPDATE_PIXELATION_MAIN,
              pixelation,
            })
          : EMPTY,
        visualvalues !== null
          ? of<RootActionType>({
              type: UPDATE_VISUALVALUES_MAIN,
              payload: visualvalues,
            })
          : EMPTY,
        campaign !== null
          ? of<RootActionType>({
              type: UPDATE_CAMPAIGN_PROGRESS_MAIN,
              payload: campaign,
            })
          : EMPTY,
        of<RootActionType>({
          type: INIT,
        }),
      ).pipe(takeUntil(action$.pipe(ofType(ABORT_ALL))))
    }),
  )

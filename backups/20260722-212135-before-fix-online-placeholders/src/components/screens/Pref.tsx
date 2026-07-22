import cl from 'clarr'
import { produce } from 'immer'
import React, {
  ChangeEvent,
  JSX,
  useContext,
  useEffect,
  useState,
} from 'react'
import NumberInput from '@/components/special/NumberInput'
import {
  UPDATE_SETTINGS_INIT,
  SCREEN_PREF,
  UPDATE_AILEVEL,
} from '@/constants/ActionTypes'
import {
  defaultPlayerNameList,
  defaultOpponentNameList,
  defaultSettings,
  defaultAiLevel,
} from '@/constants/defaultSettings'
import { maxCardsInHand, minGeneratorIsOne } from '@/constants/ranges'
import {
  allStatusNames,
  otherSettingNames,
  poNames,
} from '@/constants/resourceNames'
import { preSettings, continents } from '@/data/preSettings'
import { I18nContext } from '@/i18n/I18nContext'
import { FormFieldsType, FormFieldsAllPartialType } from '@/types/formFields'
import { useAppSelector, useAppDispatch } from '@/utils/hooks/useAppDispatch'
import isEmoji from '@/utils/isEmoji'
import { sample } from '@/utils/random'
import { allCondAndOtherSettingsEqual } from '@/utils/startWinState'
import { tooltipAttrs } from '@/utils/tooltip'
import { hasProperty } from '@/utils/typeHelpers'
import { upper1st } from '@/utils/upper1st'
import { variousLengthChunk } from '@/utils/variousLengthChunk'
import Window from './Window'
import styles from './Window.module.scss'

type NumericField = {
  name: keyof FormFieldsType
  label: string
  min: number
  max?: number
}

const Pref = () => {
  const _ = useContext(I18nContext)
  const dispatch = useAppDispatch()

  const aiLevel = useAppSelector((state) => state.ai.aiLevel)

  const settingStore: FormFieldsType = {
    playerName: useAppSelector((state) => state.settings.playerName),
    opponentName: useAppSelector((state) => state.settings.opponentName),
    tower: useAppSelector((state) => state.settings.tower),
    wall: useAppSelector((state) => state.settings.wall),
    bricks: useAppSelector((state) => state.settings.bricks),
    gems: useAppSelector((state) => state.settings.gems),
    recruits: useAppSelector((state) => state.settings.recruits),
    brickProd: useAppSelector((state) => state.settings.brickProd),
    gemProd: useAppSelector((state) => state.settings.gemProd),
    recruitProd: useAppSelector((state) => state.settings.recruitProd),
    winTower: useAppSelector((state) => state.settings.winTower),
    winResource: useAppSelector((state) => state.settings.winResource),
    cardsInHand: useAppSelector((state) => state.settings.cardsInHand),
    opponentId: '',
  }

  const [formFields, setFormFields] = useState<FormFieldsType>(settingStore)
  const [aiLevelFormField, setAiLevelFormField] = useState<number>(aiLevel)

  const checkPreset = (o: FormFieldsType | FormFieldsAllPartialType) => {
    const indexMatched = preSettings
      .concat(defaultSettings)
      .findIndex((settings) => allCondAndOtherSettingsEqual(o, settings))
    return indexMatched === preSettings.length ? -2 : indexMatched
  }

  const [preset, setPreset] = useState<number>(-10)

  useEffect(() => {
    const winTowerMin = formFields.tower + 1
    const winResourceMin =
      Math.max(
        formFields.bricks + formFields.brickProd,
        formFields.gems + formFields.gemProd,
        formFields.recruits + formFields.recruitProd,
      ) + 1

    if (formFields.winTower < winTowerMin) {
      setFormFields((prev) =>
        produce(prev, (draft) => {
          draft.winTower = winTowerMin
        }),
      )
    } else if (formFields.winResource < winResourceMin) {
      setFormFields((prev) =>
        produce(prev, (draft) => {
          draft.winResource = winResourceMin
        }),
      )
    }

    setPreset(checkPreset(formFields))
  }, [formFields])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, inputMode, value } = e.target
    setFormFields((prev) =>
      produce(prev, (draft) => {
        if (hasProperty(draft, name)) {
          if (inputMode === 'numeric') {
            draft[name] = parseInt(value, 10)
          } else if (type === 'text') {
            draft[name] = value
          }
        }
      }),
    )
  }

  const setFFPreset = (index: number) => {
    const presetIndex = index === -2 ? preSettings.length : index
    if (presetIndex >= 0) {
      const targetSettings = preSettings.concat(defaultSettings)[presetIndex]
      setFormFields((prev) => ({ ...prev, ...targetSettings }))
    }
  }

  const applyAndNewGame = () => {
    dispatch({
      type: SCREEN_PREF,
      show: false,
    })
    dispatch({
      type: UPDATE_AILEVEL,
      aiLevel: aiLevelFormField,
    })

    const { opponentId, ...settings } = formFields
    dispatch({
      type: UPDATE_SETTINGS_INIT,
      payload: settings,
    })
  }

  const renderNumberField = ({ name, label, min, max }: NumericField) => (
    <label htmlFor={name} key={name}>
      <span>{label}</span>
      <NumberInput
        name={name}
        id={name}
        min={min.toString()}
        {...(max !== undefined ? { max: max.toString() } : {})}
        value={formFields[name] as number}
        onChange={handleChange}
      />
    </label>
  )

  const startingTop: NumericField[] = [
    { name: allStatusNames[0], label: upper1st(_.i18n('tower')), min: 1 },
    { name: allStatusNames[2], label: upper1st(_.i18n('bricks')), min: 0 },
    { name: allStatusNames[3], label: upper1st(_.i18n('gems')), min: 0 },
    { name: allStatusNames[4], label: upper1st(_.i18n('recruits')), min: 0 },
  ]

  const startingBottom: NumericField[] = [
    { name: allStatusNames[1], label: upper1st(_.i18n('wall')), min: 0 },
    {
      name: allStatusNames[5],
      label: upper1st(_.i18n('quarry')),
      min: minGeneratorIsOne ? 1 : 0,
    },
    {
      name: allStatusNames[6],
      label: upper1st(_.i18n('magic')),
      min: minGeneratorIsOne ? 1 : 0,
    },
    {
      name: allStatusNames[7],
      label: upper1st(_.i18n('dungeon')),
      min: minGeneratorIsOne ? 1 : 0,
    },
  ]

  return (
    <Window screenActionType={SCREEN_PREF}>
      <div className={styles.twocolumnjustifybetween}>
        <h3 className={styles.twocolumnitem}>
          {_.i18n('Preferences')}
          {_.i18n(': ')}
        </h3>
        <span id={styles.againsthumanorai} className={styles.twocolumnitem}>
          {_.i18n('You are playing against computer AI')}
        </span>
      </div>

      <div className={cl(styles.twocolumn, styles.half)}>
        <label htmlFor={poNames[0]}>
          <span>
            {_.i18n('Your Name')}
            {_.i18n(': ')}
          </span>
          <input
            type="text"
            name={poNames[0]}
            id={poNames[0]}
            className="emoji"
            value={formFields.playerName}
            onChange={handleChange}
            onFocus={(e) => {
              if (isEmoji(e.target.value)) {
                e.target.select()
              }
            }}
          />
        </label>
        <label htmlFor={poNames[1]}>
          <span>
            {_.i18n("Opponent's Name")}
            {_.i18n(': ')}
          </span>
          <input
            type="text"
            name={poNames[1]}
            id={poNames[1]}
            className="emoji"
            value={formFields.opponentName}
            onChange={handleChange}
            onFocus={(e) => {
              if (isEmoji(e.target.value)) {
                e.target.select()
              }
            }}
          />
        </label>
      </div>

      <label htmlFor="tavern" className={cl(styles.onecolumn)}>
        <span>
          {_.i18n('Choose a Tavern (Preset Preferences)')}
          {_.i18n(': ')}
        </span>
        <select
          name="tavern"
          id="tavern"
          value={preset}
          onChange={(e) => {
            setFFPreset(parseInt(e.target.value, 10))
          }}
        >
          <option value={-2}>{_.i18n('Default')}</option>
          {continents.map((part, ci) => (
            <optgroup
              className="font-light not-italic"
              label={`${_.i18n(
                ['Castle in Enroth', 'Antagarich', 'Jadame'][part.c - 6],
              )}`}
              key={ci}
            >
              {
                variousLengthChunk<JSX.Element>(
                  preSettings.map((_s, i) => (
                    <option value={i} key={i}>
                      {_.taverns(i, 'name')} - {_.taverns(i, 'location')}
                    </option>
                  )),
                  continents.map((c) => c.count),
                )[ci]
              }
            </optgroup>
          ))}
          {preset === -1 && <option value={-1}>{_.i18n('Customized')}</option>}
        </select>
      </label>

      <h4>
        {_.i18n('Starting Conditions')}
        {_.i18n(': ')}
      </h4>
      <div className={cl(styles.fourcolumn)}>
        {startingTop.map(renderNumberField)}
      </div>
      <div className={cl(styles.fourcolumn)}>
        {startingBottom.map(renderNumberField)}
      </div>

      <h4>
        {_.i18n('Victory Conditions')}
        {_.i18n(': ')}
      </h4>
      <div className={cl(styles.twocolumn)}>
        <label htmlFor={otherSettingNames[0]}>
          <span>{upper1st(_.i18n('tower'))}</span>
          <NumberInput
            name={otherSettingNames[0]}
            id={otherSettingNames[0]}
            min={(formFields.tower + 1).toString()}
            value={formFields.winTower}
            onChange={handleChange}
            {...tooltipAttrs(
              _.i18n('Minimum is starting %s1 + 1 = %s0')
                .replace('%s1', upper1st(_.i18n('tower')))
                .replace('%s0', (formFields.tower + 1).toString()),
              'bottom',
            )}
          />
        </label>
        <label htmlFor={otherSettingNames[1]}>
          <span>{upper1st(_.i18n('resource'))}</span>
          <NumberInput
            name={otherSettingNames[1]}
            id={otherSettingNames[1]}
            min={(
              Math.max(
                formFields.bricks + formFields.brickProd,
                formFields.gems + formFields.gemProd,
                formFields.recruits + formFields.recruitProd,
              ) + 1
            ).toString()}
            value={formFields.winResource}
            onChange={handleChange}
          />
        </label>
      </div>

      <h4>
        {_.i18n('Other Preferences')}
        {_.i18n(': ')}
      </h4>
      <div className={cl(styles.twocolumn)}>
        {renderNumberField({
          name: otherSettingNames[2],
          label: _.i18n('Cards in Hand'),
          min: 0,
          max: maxCardsInHand,
        })}
        <label htmlFor={otherSettingNames[3]}>
          <span className={cl(styles.onethird)}>{_.i18n('AI Level')}</span>
          <select
            name={otherSettingNames[3]}
            id={otherSettingNames[3]}
            className={cl(styles.twothird)}
            value={aiLevelFormField}
            onChange={(e) => {
              setAiLevelFormField(parseInt(e.target.value, 10))
            }}
          >
            <option className="emoji" value={0}>
              {_.i18n('Genius')}
            </option>
            <option className="emoji" value={1}>
              {_.i18n('Smart')}
            </option>
            <option className="emoji" value={2}>
              {_.i18n('Mediocre')}
            </option>
            <option className="emoji" value={3}>
              {_.i18n('Stupid')}
            </option>
            <option className="emoji" value={4}>
              {_.i18n('Idiotic')}
            </option>
          </select>
        </label>
      </div>

      <div className={cl(styles.buttonwrapper)}>
        <button
          accessKey="r"
          onClick={() => {
            setFormFields(({ opponentId }) => ({
              playerName: sample(defaultPlayerNameList),
              opponentName: sample(defaultOpponentNameList),
              ...defaultSettings,
              opponentId,
            }))
            setAiLevelFormField(defaultAiLevel)
          }}
        >
          {_.i18n('Reset')}
        </button>
        <button
          accessKey="a"
          className={styles.warning}
          onClick={applyAndNewGame}
        >
          {_.i18n('Apply & New Game')}
        </button>
      </div>
    </Window>
  )
}

export default Pref

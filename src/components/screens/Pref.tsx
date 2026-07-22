import cl from 'clarr'
import React, { useContext } from 'react'
import {
  CAMPAIGN_START_LEVEL_MAIN,
  SCREEN_PREF,
  UPDATE_AILEVEL,
  UPDATE_SETTINGS_INIT,
} from '@/constants/ActionTypes'
import {
  campaignLevelCount,
  getNextPlayableLevelId,
  resolveCampaignLevel,
} from '@/campaign/levels'
import { I18nContext } from '@/i18n/I18nContext'
import { useAppSelector, useAppDispatch } from '@/utils/hooks/useAppDispatch'
import Window from './Window'
import styles from './Window.module.scss'

const Pref = () => {
  const _ = useContext(I18nContext)
  const dispatch = useAppDispatch()

  const playerName = useAppSelector((state) => state.settings.playerName)
  const unlockedLevel = useAppSelector((state) => state.campaign.unlockedLevel)
  const completedLevels = useAppSelector(
    (state) => state.campaign.completedLevels,
  )
  const lastCompletedLevel = useAppSelector(
    (state) => state.campaign.lastCompletedLevel,
  )
  const challengeSeed = useAppSelector((state) => state.campaign.challengeSeed)

  const levelId = getNextPlayableLevelId(unlockedLevel)
  const level = resolveCampaignLevel(levelId, challengeSeed)
  const completedCount = completedLevels.length
  const campaignCompleted = completedCount >= campaignLevelCount

  const startBattle = () => {
    dispatch({
      type: SCREEN_PREF,
      show: false,
    })
    dispatch({
      type: CAMPAIGN_START_LEVEL_MAIN,
      levelId: level.id,
      challengeMode: level.challengeMode,
    })
    dispatch({
      type: UPDATE_AILEVEL,
      aiLevel: level.aiLevel,
    })
    dispatch({
      type: UPDATE_SETTINGS_INIT,
      payload: {
        playerName,
        opponentName: level.opponentName,
        ...level.settings,
      },
    })
  }

  return (
    <Window screenActionType={SCREEN_PREF}>
      <div className={styles.campaignpanel}>
        <div className={styles.campaignheader}>
          <div>
            <span className={styles.campaigneyebrow}>
              {_.i18n('Level')} {level.id}
            </span>
            <h3>{level.tavernName}</h3>
          </div>
          <span className={styles.campaignprogress}>
            {completedCount}/{campaignLevelCount}
          </span>
        </div>

        <section className={styles.campaignbody}>
          <div className={styles.campaignreward}>
            <span>{_.i18n('Reward')}</span>
            <strong>{level.reward}</strong>
          </div>

          <div className={styles.campaignmetagrid}>
            <p>
              <strong>{_.i18n('Opponent')}</strong>
              <span>{level.opponentName}</span>
            </p>
            <p>
              <strong>{_.i18n('Challenge')}</strong>
              <span>{level.challengeLabel}</span>
            </p>
            <p>
              <strong>{_.i18n('AI Level')}</strong>
              <span>{level.aiLevel + 1}/5</span>
            </p>
            <p>
              <strong>{_.i18n('AI Profile')}</strong>
              <span>{_.i18n(level.aiProfile)}</span>
            </p>
          </div>

          <div className={styles.campaignmode}>
            <strong>{_.i18n('Mode effect')}</strong>
            <p>
              {level.challengeDescription}
            </p>
          </div>

          <div className={styles.campaignvictory}>
            <strong>{_.i18n('Victory conditions')}</strong>
            <ul>
              {level.victoryConditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </div>
        </section>

        {lastCompletedLevel !== null && (
          <p className="text-center text-sm font-light">
            {_.i18n('Last completed level')}
            {_.i18n(': ')}
            {lastCompletedLevel}
          </p>
        )}

        {campaignCompleted && (
          <p className="text-center font-bold">
            {_.i18n('Campaign completed')}
          </p>
        )}

        <div className={cl(styles.buttonwrapper)}>
          <button accessKey="a" className={styles.warning} onClick={startBattle}>
            {campaignCompleted
              ? _.i18n('Replay final battle')
              : _.i18n('Start battle')}
          </button>
        </div>
      </div>
    </Window>
  )
}

export default Pref

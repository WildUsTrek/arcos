import cl from 'clarr'
import React, { useContext, useState } from 'react'
import {
  campaignLevelCount,
  getNextPlayableLevelId,
  resolveCampaignLevel,
} from '@/campaign/levels'
import {
  ABORT_ALL,
  CAMPAIGN_START_LEVEL_MAIN,
  SCREEN_PREF,
  UPDATE_AILEVEL,
} from '@/constants/ActionTypes'
import { I18nContext } from '@/i18n/I18nContext'
import { useAppSelector, useAppDispatch } from '@/utils/hooks/useAppDispatch'
import Window from './Window'
import styles from './Window.module.scss'

const Pref = () => {
  const _ = useContext(I18nContext)
  const dispatch = useAppDispatch()
  const [detailsOpen, setDetailsOpen] = useState(false)

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
  const completedLevelSet = new Set(completedLevels)

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
      type: ABORT_ALL,
    })
  }

  return (
    <Window screenActionType={SCREEN_PREF} darkerBg cancellable={false}>
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
          <button
            className={styles.campaigndetailsbutton}
            onClick={() => {
              setDetailsOpen(true)
            }}
            type="button"
          >
            Dettagli
          </button>
          <button
            accessKey="a"
            className={cl(styles.warning, styles.campaignstart)}
            onClick={startBattle}
          >
            {campaignCompleted
              ? _.i18n('Replay final battle')
              : _.i18n('Start battle')}
          </button>
        </div>

        <section className={styles.campaignbody}>
          <div className={styles.campaignmap}>
            {Array.from({ length: campaignLevelCount }, (_, index) => {
              const mapLevelId = index + 1
              const mapLevel = resolveCampaignLevel(mapLevelId, challengeSeed)
              const completed = completedLevelSet.has(mapLevelId)
              const current = mapLevelId === level.id && !campaignCompleted
              const locked = mapLevelId > unlockedLevel

              return (
                <div
                  className={cl(
                    styles.campaignnode,
                    completed && styles.completed,
                    current && styles.current,
                    locked && styles.locked,
                  )}
                  key={mapLevel.id}
                >
                  <span>{mapLevel.id}</span>
                  <strong>{mapLevel.tavernName}</strong>
                  <small>
                    {completed
                      ? 'Completata'
                      : current
                        ? 'Prossima sfida'
                        : locked
                          ? 'Bloccata'
                          : 'Disponibile'}
                  </small>
                </div>
              )
            })}
          </div>

          <div className={styles.campaignrisk}>
            <strong>Regola campagna</strong>
            <p>
              Vincere sblocca la prossima taverna. Perdere una sfida campagna
              azzera la scalata e fa ripartire dal livello 1.
            </p>
          </div>
        </section>

        {detailsOpen && (
          <div className={styles.campaigndetailsoverlay} role="dialog">
            <div className={styles.campaigndetailspanel}>
              <div className={styles.campaigndetailsheader}>
                <div>
                  <span className={styles.campaigneyebrow}>
                    {_.i18n('Level')} {level.id}
                  </span>
                  <h3>Dettagli sfida</h3>
                </div>
                <button
                  className={styles.campaigndetailsclose}
                  onClick={() => {
                    setDetailsOpen(false)
                  }}
                  type="button"
                >
                  Chiudi
                </button>
              </div>

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
                <p>{level.challengeDescription}</p>
              </div>

              <div className={styles.campaignvictory}>
                <strong>{_.i18n('Victory conditions')}</strong>
                <ul>
                  {level.victoryConditions.map((condition) => (
                    <li key={condition}>{condition}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </Window>
  )
}

export default Pref

import React, { useEffect, useState } from 'react'
import { resolveCampaignLevel } from '@/campaign/levels'
import {
  CAMPAIGN_ACK_BATTLE_INTRO,
  UPDATE_SETTINGS_INIT,
} from '@/constants/ActionTypes'
import { useAppDispatch, useAppSelector } from '@/utils/hooks/useAppDispatch'
import styles from './CampaignBattleIntro.module.scss'

const tavernPhaseMs = 1900

type IntroPhase = 'tavern' | 'rules'

type CampaignBattleIntroContentProps = {
  levelId: number
  challengeSeed: number
}

const CampaignBattleIntroContent = ({
  levelId,
  challengeSeed,
}: CampaignBattleIntroContentProps) => {
  const [phase, setPhase] = useState<IntroPhase>('tavern')
  const [hidden, setHidden] = useState(false)
  const dispatch = useAppDispatch()
  const playerName = useAppSelector((state) => state.settings.playerName)

  useEffect(() => {
    const rulesTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setPhase('rules')
    }, tavernPhaseMs)

    return () => {
      clearTimeout(rulesTimer)
    }
  }, [])

  const level = resolveCampaignLevel(levelId, challengeSeed)

  const startBattle = () => {
    setHidden(true)
    dispatch({
      type: CAMPAIGN_ACK_BATTLE_INTRO,
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

  if (hidden) {
    return null
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal={true}>
      <div className={styles.inner}>
        {phase === 'tavern' ? (
          <div className={styles.taverncard}>
            <span className={styles.eyebrow}>Livello {level.id}</span>
            <h1 className={styles.tavern}>{level.tavernName}</h1>
            <p className={styles.subtitle}>La sfida sta per cominciare</p>
          </div>
        ) : (
          <div className={styles.rules}>
            <div className={styles.stepper}>
              <span></span>
              <span className={styles.ready}></span>
            </div>
            <div className={styles.ruleheader}>
              <div className={styles.challenger}>
                <span className={styles.eyebrow}>Sfidante</span>
                <strong>{level.opponentName}</strong>
                <p className={styles.subtitle}>{level.challengeLabel}</p>
              </div>
            </div>
            <ul className={styles.conditions}>
              {level.victoryConditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
            <button
              className={styles['continue-button']}
              onClick={startBattle}
              type="button"
            >
              Inizia battaglia
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const CampaignBattleIntro = () => {
  const activeLevel = useAppSelector((state) => state.campaign.activeLevel)
  const challengeSeed = useAppSelector((state) => state.campaign.challengeSeed)

  if (activeLevel === null) {
    return null
  }

  return (
    <CampaignBattleIntroContent
      key={`${activeLevel}-${challengeSeed}`}
      levelId={activeLevel}
      challengeSeed={challengeSeed}
    />
  )
}

export default CampaignBattleIntro

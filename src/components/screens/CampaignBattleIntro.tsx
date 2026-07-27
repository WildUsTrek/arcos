import React, { useEffect, useState } from 'react'
import { resolveCampaignLevel } from '@/campaign/levels'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import styles from './CampaignBattleIntro.module.scss'

const tavernPhaseMs = 1900
const rulesDismissDelayMs = 3600

type IntroPhase = 'tavern' | 'rules' | 'dismissible'

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

  useEffect(() => {
    const rulesTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setPhase('rules')
    }, tavernPhaseMs)
    const dismissTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setPhase('dismissible')
    }, tavernPhaseMs + rulesDismissDelayMs)

    return () => {
      clearTimeout(rulesTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  const level = resolveCampaignLevel(levelId, challengeSeed)

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
              <span></span>
              <span
                className={phase === 'dismissible' ? styles.ready : ''}
              ></span>
            </div>
            <div className={styles.ruleheader}>
              <div className={styles.location}>
                <span className={styles.eyebrow}>Taverna</span>
                <strong>{level.tavernName}</strong>
              </div>
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
            {phase === 'dismissible' && (
              <button
                className={styles['continue-button']}
                onClick={() => {
                  setHidden(true)
                }}
                type="button"
              >
                Inizia battaglia
              </button>
            )}
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

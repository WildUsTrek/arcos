import React, { useEffect, useState } from 'react'
import { resolveCampaignLevel } from '@/campaign/levels'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import styles from './CampaignBattleIntro.module.scss'

const tavernPhaseMs = 1900
const totalIntroMs = 5600

type CampaignBattleIntroContentProps = {
  levelId: number
  challengeSeed: number
}

const CampaignBattleIntroContent = ({
  levelId,
  challengeSeed,
}: CampaignBattleIntroContentProps) => {
  const [showRules, setShowRules] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const rulesTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setShowRules(true)
    }, tavernPhaseMs)
    const hideTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
      setHidden(true)
    }, totalIntroMs)

    return () => {
      clearTimeout(rulesTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const level = resolveCampaignLevel(levelId, challengeSeed)

  if (hidden) {
    return null
  }

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        setHidden(true)
      }}
      role="presentation"
    >
      <div className={styles.inner}>
        {!showRules ? (
          <>
            <span className={styles.eyebrow}>Livello {level.id}</span>
            <h1 className={styles.tavern}>{level.tavernName}</h1>
          </>
        ) : (
          <div className={styles.rules}>
            <div className={styles.challenger}>
              <span className={styles.eyebrow}>Sfidante</span>
              <strong>{level.opponentName}</strong>
              <p className={styles.subtitle}>{level.challengeLabel}</p>
            </div>
            <ul className={styles.conditions}>
              {level.victoryConditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
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

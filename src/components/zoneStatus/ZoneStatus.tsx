import cl from 'clarr'
import React, { useContext } from 'react'
import { resolveCampaignLevel } from '@/campaign/levels'
import { GameSizeContext } from '@/utils/contexts/GameSizeContext'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import Birds from '../effects/Birds'
import Tower from '../towerWall/Tower'
import Wall from '../towerWall/Wall'
import Status from './Status'
import styles from './ZoneStatus.module.scss'

/**
 * Upper Zone for Status, Tower, Wall, Birds
 */
const ZoneStatus = () => {
  const playerName = useAppSelector((state) => state.settings.playerName)
  const opponentName = useAppSelector((state) => state.settings.opponentName)
  const activeLevel = useAppSelector((state) => state.campaign.activeLevel)
  const challengeSeed = useAppSelector((state) => state.campaign.challengeSeed)
  const winTower = useAppSelector((state) => state.settings.winTower)
  const campaignOpponentName =
    activeLevel !== null
      ? resolveCampaignLevel(activeLevel, challengeSeed).opponentName
      : null

  const size = useContext(GameSizeContext)

  return (
    <div className={cl(styles.main, size.narrowMobile ? 'h-1/2' : 'h-2/3')}>
      <div className={cl(styles.mainbg, 'pixelated')}></div>

      <div className={styles.side}>
        <Status playerName={playerName} />
        <Tower goal={winTower} />
        <Wall />

        <Status playerName={campaignOpponentName ?? opponentName} isOpponent />
        <Tower isOpponent goal={winTower} />
        <Wall isOpponent />
        <Birds />
      </div>
    </div>
  )
}

export default ZoneStatus

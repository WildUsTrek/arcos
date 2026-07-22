import cl from 'clarr'
import React, { useContext } from 'react'
import DiscardModeNotice from '@/components/special/DiscardModeNotice'
import { I18nContext } from '@/i18n/I18nContext'
import { CardListItemAllType } from '@/types/state'
import { GameSizeContext } from '@/utils/contexts/GameSizeContext'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import { tooltipAttrs } from '@/utils/tooltip'
import Card from './Card'
import styles from './ZoneCardsInner.module.scss'

const ZoneCardsInner = () => {
  const _ = useContext(I18nContext)
  const cards: Readonly<CardListItemAllType[]> = useAppSelector(
    (state) => state.cards.list,
  )
  const discardMode = useAppSelector((state) => state.game.discardMode)

  const playersTurn = useAppSelector((state) => state.game.playersTurn)
  const locked = useAppSelector((state) =>
    state.game.locked.some((l) => l === true),
  )

  const size = useContext(GameSizeContext)

  const playerCards = cards.filter(
    (card) => card && card.position >= 0 && card.owner === 'player',
  )
  const allUnusable =
    playerCards.length > 0 &&
    playerCards.every((card) => card && card.unusable === true)

  const allUnusableTooltip =
    allUnusable && playersTurn && !locked && !discardMode
      ? _.i18n('allUnusableTip')
      : ''

  return (
    <div
      className={cl(styles.main, size.narrowMobile ? 'h-1/2' : 'h-1/3')}
      {...tooltipAttrs(allUnusableTooltip)}
    >
      <Card n={-1} position={-1} unusable />
      {cards.map((card, i) =>
        card === null ? null : <Card key={i} index={i} {...card} />,
      )}
      <DiscardModeNotice shown={discardMode} />
    </div>
  )
}

export default ZoneCardsInner

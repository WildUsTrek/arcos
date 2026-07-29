import React, { useEffect, useMemo } from 'react'
import { defaultVisualvalues } from '@/constants/defaultSettings'
import { dataVisualvalues } from '@/data/visualvalues'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import { entries } from '@/utils/typeHelpers'
import ButtonBar from './buttons/ButtonBar'
import styles from './Game.module.scss'
import GameWindowList from './GameWindowList'
import ZoneCards from './zoneCards/ZoneCards'
import ZoneStatus from './zoneStatus/ZoneStatus'

let lastWilduChromeRevealRequest = 0

const requestWilduFrameChromeReveal = () => {
  const now = Date.now()
  if (now - lastWilduChromeRevealRequest < 450) return

  lastWilduChromeRevealRequest = now

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'WILDU_GAME_FRAME_CHROME_REVEAL_REQUEST',
          source: 'arcomage',
        },
        window.location.origin,
      )
    }
  } catch {
    // Standalone/non-Wild-U apertura: il gesto resta interno al gioco.
  }
}

const Game = () => {
  const visualvalues = useAppSelector((state) => state.visual.visualvalues)

  useEffect(() => {
    let touchStartY = 0

    const handlePointerMove = (event: PointerEvent) => {
      if (event.clientY <= 118) {
        requestWilduFrameChromeReveal()
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      touchStartY = touch ? touch.clientY : 0

      if (touchStartY <= 128) {
        requestWilduFrameChromeReveal()
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      const movedUp = touchStartY > 0 && touchStartY - touch.clientY > 18
      const nearTop = touch.clientY <= 128

      if (movedUp || nearTop) {
        requestWilduFrameChromeReveal()
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const visualCss = useMemo(
    () =>
      entries(visualvalues)
        .filter(([key, value]) => defaultVisualvalues[key] !== value)
        .map(([key, value]) => {
          const matchedItem = dataVisualvalues.find((item) => key === item.term)
          if (matchedItem) {
            if (matchedItem.type === 'main') {
              if (matchedItem.term === 'hue') {
                return `${matchedItem.css}(${value}deg)`
              } else {
                return `${matchedItem.css}(${value})`
              }
            } else if (value === true) {
              return `url('#${matchedItem.css}')`
            }
          }
          return null
        })
        .filter((v): v is string => v !== null)
        .join(' '),
    [visualvalues],
  )

  return (
    <div
      className={styles.main}
      tabIndex={-1}
      {...(visualCss !== '' ? { style: { filter: visualCss } } : {})}
    >
      <ZoneStatus />
      <ZoneCards />
      <GameWindowList />
      <ButtonBar />
    </div>
  )
}

export default Game

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { GameSizeContext } from '@/utils/contexts/GameSizeContext'
import { isEnabled, isFullscreen, requestFs } from '@/utils/fullscreen'
import {
  getMobilePlayability,
  readMobilePointerState,
} from '@/utils/mobilePlayability'
import styles from './MobileFullscreenGate.module.scss'

const MobileFullscreenGate = () => {
  const size = useContext(GameSizeContext)
  const [fullscreen, setFullscreen] = useState(isFullscreen)

  const shouldRequireFullscreen = useMemo(() => {
    return getMobilePlayability({
      width: size.width,
      height: size.height,
      fullscreenEnabled: isEnabled,
      ...readMobilePointerState(),
    }).needsFullscreenGate
  }, [size.height, size.width])

  useEffect(() => {
    const syncFullscreen = () => {
      setFullscreen(isFullscreen())
    }

    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('webkitfullscreenchange', syncFullscreen)
    syncFullscreen()

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncFullscreen)
    }
  }, [])

  if (!shouldRequireFullscreen || fullscreen) {
    return null
  }

  const enterFullscreen = () => {
    requestFs()
    setTimeout(() => {
      setFullscreen(isFullscreen())
    }, 150)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal={true}>
      <section className={styles.panel}>
        <span>Mobile</span>
        <h2>Schermo intero richiesto</h2>
        <p>
          Per evitare tagli laterali, barre del browser e comandi sovrapposti,
          la campagna mobile si gioca a schermo intero.
        </p>
        <button type="button" onClick={enterFullscreen}>
          Schermo intero
        </button>
      </section>
    </div>
  )
}

export default MobileFullscreenGate

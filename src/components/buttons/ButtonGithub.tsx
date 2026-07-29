import cl from 'clarr'
import React from 'react'
import { tooltipAttrs } from '@/utils/tooltip'
import styles from './ButtonGithub.module.scss'

declare global {
  interface Window {
    closeWilduGameFrame?: () => void
  }
}

const requestWilduClose = () => {
  try {
    if (window.parent && window.parent !== window) {
      if (typeof window.parent.closeWilduGameFrame === 'function') {
        window.parent.closeWilduGameFrame()
        return
      }

      window.parent.postMessage(
        {
          type: 'WILDU_GAME_CLOSE_REQUEST',
          source: 'arcomage',
        },
        window.location.origin,
      )
    }
  } catch {
    // Standalone/non-Wild-U apertura: il pulsante resta innocuo.
  }
}

const ButtonGithub = () => (
  <button
    accessKey="x"
    className={cl('topbutton', styles.githubbutton)}
    onClick={requestWilduClose}
    onAuxClick={requestWilduClose}
    {...tooltipAttrs('Esci', 'bottom')}
    aria-label="Esci"
    type="button"
  >
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3.5h8.8c.6 0 1 .4 1 1v2.2h-2V5.5H6v13h5.8v-1.2h2v2.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-15c0-.6.4-1 1-1z" />
      <path d="M15.4 7.2l4.6 4.6-4.6 4.6-1.4-1.4 2.2-2.2H9.2v-2h7l-2.2-2.2 1.4-1.4z" />
    </svg>
  </button>
)

export default ButtonGithub

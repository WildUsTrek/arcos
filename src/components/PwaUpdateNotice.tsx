import React, { useEffect, useRef, useState } from 'react'
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register'
import styles from './PwaUpdateNotice.module.scss'

const PwaUpdateNotice = () => {
  const [needRefresh, setNeedRefresh] = useState(false)
  const updateServiceWorkerRef = useRef<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null)

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
    })
  }, [])

  if (!needRefresh) {
    return null
  }

  return (
    <div className={styles.notice} role="status">
      <strong>Nuova versione disponibile</strong>
      <p>Ricarica per usare gli ultimi livelli, UI e bilanciamenti.</p>
      <div className={styles.actions}>
        <button
          onClick={() => {
            setNeedRefresh(false)
          }}
          type="button"
        >
          Dopo
        </button>
        <button
          onClick={() => {
            void updateServiceWorkerRef.current?.(true)
          }}
          type="button"
        >
          Ricarica
        </button>
      </div>
    </div>
  )
}

export default PwaUpdateNotice

import React, { useEffect, useState } from 'react'
import { narrowMobileWinHeightMax } from '@/constants/visuals'
import { defaultGameSize, GameSizeContext, vType } from './GameSizeContext'

type PropType = {
  children: React.ReactNode
}

const getViewportSize = (): Pick<vType, 'width' | 'height'> => {
  const visualViewport = window.visualViewport
  const width =
    visualViewport?.width ??
    document.documentElement.clientWidth ??
    window.innerWidth
  const height =
    visualViewport?.height ??
    document.documentElement.clientHeight ??
    window.innerHeight

  return {
    width: Math.floor(width),
    height: Math.floor(height),
  }
}

const GameSizeProvider = ({ children }: PropType) => {
  const [gameSize, setGameSize] = useState<vType>(defaultGameSize)
  useEffect(() => {
    const handleResize = () => {
      const viewportSize = getViewportSize()
      setGameSize({
        ...viewportSize,
        narrowMobile: viewportSize.height <= narrowMobileWinHeightMax,
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])

  return (
    <GameSizeContext.Provider value={gameSize}>
      {children}
    </GameSizeContext.Provider>
  )
}

export default GameSizeProvider

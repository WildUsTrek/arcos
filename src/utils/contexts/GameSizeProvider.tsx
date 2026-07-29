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
    const delayedResizeHandles: number[] = []
    const handleResize = () => {
      const viewportSize = getViewportSize()
      setGameSize({
        ...viewportSize,
        narrowMobile: viewportSize.height <= narrowMobileWinHeightMax,
      })
    }
    const handleOrientationChange = () => {
      handleResize()
      delayedResizeHandles.push(window.setTimeout(handleResize, 80))
      delayedResizeHandles.push(window.setTimeout(handleResize, 240))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)
    handleResize()

    return () => {
      delayedResizeHandles.forEach((handle) => window.clearTimeout(handle))
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
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

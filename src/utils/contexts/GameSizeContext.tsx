import { createContext } from 'react'
import { narrowMobileWinHeightMax } from '@/constants/visuals'

export type vType = {
  width: number
  height: number
  narrowMobile: boolean
}

export const defaultGameSize: vType = {
  width: Math.floor(window.visualViewport?.width ?? window.innerWidth),
  height: Math.floor(window.visualViewport?.height ?? window.innerHeight),
  narrowMobile:
    Math.floor(window.visualViewport?.height ?? window.innerHeight) <=
    narrowMobileWinHeightMax,
}

export const GameSizeContext = createContext<vType>(defaultGameSize)

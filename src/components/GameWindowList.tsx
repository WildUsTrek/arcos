import React from 'react'
import { isEndScreenNoCloseState } from '@/types/state'
import { useAppSelector } from '@/utils/hooks/useAppDispatch'
import CampaignBattleIntro from './screens/CampaignBattleIntro'
import DisconnectNotice from './screens/DisconnectNotice'
import EndScreen from './screens/EndScreen'
import Help from './screens/Help'
import LandscapeNotice from './screens/LandscapeNotice'
import MobileFullscreenGate from './screens/MobileFullscreenGate'
import Pref from './screens/Pref'
import SgPref from './screens/SgPref'

const GameWindowList = () => {
  const pref = useAppSelector((state) => state.screen.pref)
  const sgPref = useAppSelector((state) => state.screen.sgPref)
  const end = useAppSelector((state) => state.screen.end)
  const help = useAppSelector((state) => state.screen.help)
  const landscape = useAppSelector((state) => state.screen.landscape)
  const disconnectNotice = useAppSelector(
    (state) => state.screen.disconnectNotice,
  )
  const campaignIntroVisible =
    !pref && !landscape && !isEndScreenNoCloseState(end)

  // lazy loading is a bit slow for those frequently used settings only to save a few KBs, so we don't use it
  return (
    <>
      {campaignIntroVisible && <CampaignBattleIntro />}
      {isEndScreenNoCloseState(end) && <EndScreen {...end} />}
      {pref && <Pref />}
      {sgPref && <SgPref />}
      {help && <Help />}
      {landscape && <LandscapeNotice />}
      {disconnectNotice && <DisconnectNotice />}
      <MobileFullscreenGate />
    </>
  )
}

export default GameWindowList

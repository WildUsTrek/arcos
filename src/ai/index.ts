import { resolveCampaignLevel } from '@/campaign/levels'
import { AiCardListItemType, AiInstructionType } from '@/types/ai'
import { RootStateType } from '@/types/state'
import { getWinState } from '@/utils/startWinState'
import checkCardUseDiscard from './checkCardUseDiscard'
import { aiDecision } from './main'

// `null` return value is a 'surrender' instruction
export const ai = (state: RootStateType): AiInstructionType | null => {
  const cardList: AiCardListItemType[] = checkCardUseDiscard(state, 'opponent')
  const playerCardList: AiCardListItemType[] = checkCardUseDiscard(
    state,
    'player',
  )
  const campaignLevel =
    state.campaign.activeLevel !== null
      ? resolveCampaignLevel(
          state.campaign.activeLevel,
          state.campaign.challengeSeed,
        )
      : null
  return aiDecision(
    cardList,
    playerCardList,
    state.status,
    getWinState(state.settings),
    state.ai.aiLevel,
    campaignLevel
      ? {
          levelId: campaignLevel.id,
          challengeMode: campaignLevel.challengeMode,
          profile: campaignLevel.aiProfile,
        }
      : undefined,
  )
}

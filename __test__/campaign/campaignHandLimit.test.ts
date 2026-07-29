import { expect, test } from 'bun:test'
import { campaignLevelCount, resolveCampaignLevel } from '@/campaign/levels'
import { maxCampaignCardsInHand } from '@/constants/ranges'

test('campaign levels stay inside the mobile hand limit', () => {
  for (let levelId = 1; levelId <= campaignLevelCount; levelId += 1) {
    const level = resolveCampaignLevel(levelId)

    expect(level.settings.cardsInHand).toBeLessThanOrEqual(
      maxCampaignCardsInHand,
    )
  }
})

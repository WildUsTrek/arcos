import { expect, test } from 'bun:test'
import { campaignLevelCount } from '@/campaign/levels'
import { evaluateCampaignBalance } from '../../tools/campaign-balance-report'

test('campaign balance report covers every campaign level', () => {
  const report = evaluateCampaignBalance()

  expect(report.length).toBe(campaignLevelCount)
  expect(report.every((row) => row.tavern !== '' && row.opponent !== '')).toBe(
    true,
  )
})

test('campaign difficulty trends upward across the full run', () => {
  const report = evaluateCampaignBalance()
  const firstTierAverage =
    report.slice(0, 3).reduce((sum, row) => sum + row.difficultyScore, 0) / 3
  const finalTierAverage =
    report.slice(-3).reduce((sum, row) => sum + row.difficultyScore, 0) / 3

  expect(finalTierAverage).toBeGreaterThan(firstTierAverage + 35)
})

test('campaign balance report has no structural warnings', () => {
  const report = evaluateCampaignBalance()

  expect(report.flatMap((row) => row.warnings)).toEqual([])
})

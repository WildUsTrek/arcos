import fs from 'fs'
import path from 'path'
import { expect, test } from 'bun:test'

const introPath = path.join(
  import.meta.dir,
  '../../src/components/screens/CampaignBattleIntro.tsx',
)
const introStylesPath = path.join(
  import.meta.dir,
  '../../src/components/screens/CampaignBattleIntro.module.scss',
)
const windowListPath = path.join(
  import.meta.dir,
  '../../src/components/GameWindowList.tsx',
)

test('campaign intro cannot be globally skipped before rules are readable', () => {
  const source = fs.readFileSync(introPath, 'utf8')
  const overlayOpening = source.match(
    /<div\s+className=\{styles\.overlay\}[\s\S]*?role="dialog"/,
  )?.[0]

  expect(source).not.toContain('role="presentation"')
  expect(overlayOpening).not.toContain('setHidden(true)')
  expect(source).toContain('Inizia battaglia')
  expect(source).toContain(
    "type IntroPhase = 'tavern' | 'rules' | 'dismissible'",
  )
})

test('campaign intro overlay has click-through protection and landscape layout', () => {
  const source = fs.readFileSync(introStylesPath, 'utf8')

  expect(source).toContain('z-index: 130')
  expect(source).toContain('pointer-events: auto')
  expect(source).toContain('aspect-ratio: 16 / 9')
})

test('campaign intro is suppressed while the landscape notice is active', () => {
  const source = fs.readFileSync(windowListPath, 'utf8')

  expect(source).toContain('const campaignIntroVisible = !landscape')
  expect(source).toContain('{campaignIntroVisible && <CampaignBattleIntro />}')
})

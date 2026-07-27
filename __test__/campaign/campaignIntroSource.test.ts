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
const prefPath = path.join(
  import.meta.dir,
  '../../src/components/screens/Pref.tsx',
)
const windowStylesPath = path.join(
  import.meta.dir,
  '../../src/components/screens/Window.module.scss',
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
  expect(source).toContain("type IntroPhase = 'tavern' | 'rules'")
  expect(source).not.toContain('dismissible')
  expect(source).not.toContain('styles.location')
})

test('campaign intro overlay has click-through protection and landscape layout', () => {
  const source = fs.readFileSync(introStylesPath, 'utf8')

  expect(source).toContain('z-index: 130')
  expect(source).toContain('pointer-events: auto')
  expect(source).toContain('aspect-ratio: 16 / 9')
  expect(source).toContain('(height <= 520px) and (orientation: landscape)')
  expect(source).toContain('(width <= 760px) and (orientation: portrait)')
})

test('campaign intro is suppressed while the landscape notice is active', () => {
  const source = fs.readFileSync(windowListPath, 'utf8')

  expect(source).toContain('const campaignIntroVisible = !landscape')
  expect(source).toContain('{campaignIntroVisible && <CampaignBattleIntro />}')
})

test('campaign battle starts only after the intro confirmation', () => {
  const introSource = fs.readFileSync(introPath, 'utf8')
  const prefSource = fs.readFileSync(prefPath, 'utf8')

  expect(prefSource).not.toContain('UPDATE_SETTINGS_INIT')
  expect(prefSource).toContain('styles.campaignstart')
  expect(introSource).toContain('UPDATE_SETTINGS_INIT')
  expect(introSource).toContain('onClick={startBattle}')
})

test('campaign menu uses a landscape grid instead of a narrow vertical panel', () => {
  const source = fs.readFileSync(windowStylesPath, 'utf8')

  expect(source).toContain('width: min(1180px, calc(100vw - 48px))')
  expect(source).toContain('grid-template-areas:')
  expect(source).toContain("'map reward'")
  expect(source).not.toContain('@media (width <= 900px), (height <= 560px)')
  expect(source).toContain('(height <= 560px) and (orientation: landscape)')
  expect(source).toContain('.campaignstart')
})

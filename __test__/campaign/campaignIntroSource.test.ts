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
const fullscreenGatePath = path.join(
  import.meta.dir,
  '../../src/components/screens/MobileFullscreenGate.tsx',
)
const indexHtmlPath = path.join(import.meta.dir, '../../index.html')
const gameSizeProviderPath = path.join(
  import.meta.dir,
  '../../src/utils/contexts/GameSizeProvider.tsx',
)
const cardPosStylePath = path.join(
  import.meta.dir,
  '../../src/components/zoneCards/CardPosStyle.tsx',
)
const cardLayoutMetricsPath = path.join(
  import.meta.dir,
  '../../src/components/zoneCards/CardLayoutMetrics.ts',
)
const cardStylePath = path.join(
  import.meta.dir,
  '../../src/components/zoneCards/Card.module.scss',
)
const cardPath = path.join(
  import.meta.dir,
  '../../src/components/zoneCards/Card.tsx',
)
const statusPath = path.join(
  import.meta.dir,
  '../../src/components/zoneStatus/Status.tsx',
)
const statusStylesPath = path.join(
  import.meta.dir,
  '../../src/components/zoneStatus/Status.module.scss',
)
const windowPath = path.join(
  import.meta.dir,
  '../../src/components/screens/Window.tsx',
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
  expect(prefSource).toContain('cancellable={false}')
  expect(introSource).toContain('UPDATE_SETTINGS_INIT')
  expect(introSource).toContain('onClick={startBattle}')
})

test('campaign menu uses a landscape grid instead of a narrow vertical panel', () => {
  const source = fs.readFileSync(windowStylesPath, 'utf8')
  const prefSource = fs.readFileSync(prefPath, 'utf8')

  expect(source).toContain('100dvw')
  expect(source).toContain('safe-area-inset-right')
  expect(source).toContain('min-height: min(760px, calc(100dvh - 24px))')
  expect(source).toContain('grid-template-areas:')
  expect(source).toContain("'map'")
  expect(prefSource).toContain('Dettagli')
  expect(prefSource).toContain('detailsOpen')
  expect(source).toContain('.campaigndetailsoverlay')
  expect(source).toContain('position: fixed')
  expect(source).toContain('z-index: 150')
  expect(prefSource).toContain('aria-modal={true}')
  expect(source).not.toContain('@media (width <= 900px), (height <= 560px)')
  expect(source).toContain('(height <= 560px) and (orientation: landscape)')
  expect(source).toContain('.campaignstart')
})

test('mobile layout uses visual viewport and requires fullscreen when supported', () => {
  const providerSource = fs.readFileSync(gameSizeProviderPath, 'utf8')
  const fullscreenGateSource = fs.readFileSync(fullscreenGatePath, 'utf8')
  const indexHtmlSource = fs.readFileSync(indexHtmlPath, 'utf8')
  const windowListSource = fs.readFileSync(windowListPath, 'utf8')
  const windowStylesSource = fs.readFileSync(windowStylesPath, 'utf8')

  expect(providerSource).toContain('window.visualViewport')
  expect(providerSource).toContain("visualViewport?.addEventListener('resize'")
  expect(providerSource).toContain("visualViewport?.addEventListener('scroll'")
  expect(fullscreenGateSource).toContain('Schermo intero richiesto')
  expect(fullscreenGateSource).toContain('requestFs()')
  expect(fullscreenGateSource).toContain('pointer: coarse')
  expect(indexHtmlSource).toContain('mobile-web-app-capable')
  expect(indexHtmlSource).toContain('apple-mobile-web-app-capable')
  expect(indexHtmlSource).toContain('apple-mobile-web-app-status-bar-style')
  expect(windowListSource).toContain('<MobileFullscreenGate />')
  expect(windowStylesSource).toContain('min-height: calc(100dvh - 22px)')
})

test('mobile card layout reserves side safe area', () => {
  const source = fs.readFileSync(cardPosStylePath, 'utf8')
  const metricsSource = fs.readFileSync(cardLayoutMetricsPath, 'utf8')
  const cardSource = fs.readFileSync(cardPath, 'utf8')
  const cardStyles = fs.readFileSync(cardStylePath, 'utf8')

  expect(metricsSource).toContain('mobileSafeSideRatio')
  expect(metricsSource).toContain('mobileHandVerticalShare')
  expect(metricsSource).toContain('mobileHandTopShare')
  expect(metricsSource).toContain('mobileMinHandGapPx')
  expect(metricsSource).toContain('layoutWidth')
  expect(metricsSource).toContain('layoutOffsetX')
  expect(source).toContain('z-index: 20')
  expect(cardSource).not.toContain('hover:scale-105')
  expect(cardSource).toContain('styles.playable')
  expect(cardStyles).toContain('(hover: hover) and (pointer: fine)')
  expect(cardStyles).toContain('(hover: none), (pointer: coarse)')
  expect(cardStyles).toContain('touch-action: manipulation')
})

test('mobile campaign overlays use available landscape space with readable text', () => {
  const windowStylesSource = fs.readFileSync(windowStylesPath, 'utf8')
  const introStylesSource = fs.readFileSync(introStylesPath, 'utf8')

  expect(windowStylesSource).toContain('min-height: calc(100dvh - 22px)')
  expect(windowStylesSource).toContain('width: min(980px, calc(100dvw - 16px))')
  expect(windowStylesSource).toContain('font-size: clamp(15px, 3.3dvh, 18px)')
  expect(windowStylesSource).toContain('font-size: clamp(12px, 2.9dvh, 15px)')
  expect(windowStylesSource).not.toContain('font-size: 0.74rem')
  expect(windowStylesSource).not.toContain('font-size: clamp(0.98rem')
  expect(introStylesSource).toContain('min-height: calc(100dvh - 28px)')
  expect(introStylesSource).toContain('font-size: clamp(15px, 3.4dvh, 18px)')
})

test('mobile status columns use the same compact height as the status zone', () => {
  const statusSource = fs.readFileSync(statusPath, 'utf8')
  const statusStyles = fs.readFileSync(statusStylesPath, 'utf8')
  const windowSource = fs.readFileSync(windowPath, 'utf8')

  expect(statusSource).toContain(
    'size.height * (size.narrowMobile ? 1 / 2 : 2 / 3)',
  )
  expect(statusStyles).toContain(
    '(height <= 560px) and (orientation: landscape)',
  )
  expect(windowSource).toContain('cancellable = true')
  expect(windowSource).toContain('noopCancel')
})

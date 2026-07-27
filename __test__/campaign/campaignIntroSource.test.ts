import fs from 'fs'
import path from 'path'
import { expect, test } from 'bun:test'

const introPath = path.join(
  import.meta.dir,
  '../../src/components/screens/CampaignBattleIntro.tsx',
)

test('campaign intro cannot be globally skipped before rules are readable', () => {
  const source = fs.readFileSync(introPath, 'utf8')

  expect(source).not.toContain('role="presentation"')
  expect(source).not.toMatch(/<div\s+className=\{styles\.overlay\}\s+onClick/)
  expect(source).toContain('Inizia battaglia')
  expect(source).toContain(
    "type IntroPhase = 'tavern' | 'rules' | 'dismissible'",
  )
})

import { expect, test } from 'bun:test'
import { play, setVolume } from '@/utils/sound/Sound'

test('sound module is safe without browser audio APIs', () => {
  expect(() => setVolume(5)).not.toThrow()
  expect(() => play('deal')).not.toThrow()
})

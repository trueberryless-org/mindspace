import { describe, expect, test } from 'vitest'

import remarkReadingTime from '../../src/plugins/remark-reading-time.mjs'

function run(text: string) {
  const file = { data: { astro: { frontmatter: {} as Record<string, unknown> } } }
  const tree = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }]
  }

  remarkReadingTime()(tree, file)

  return file.data.astro.frontmatter
}

describe('remarkReadingTime', () => {
  test('never reports less than one minute', () => {
    expect(run('short')).toMatchObject({
      minutesRead: '1min',
      readingTime: { minutes: 1, words: 1 }
    })
  })

  test('rounds to whole minutes at 153 words per minute', () => {
    const text = Array.from({ length: 306 }, () => 'word').join(' ')

    expect(run(text)).toMatchObject({
      minutesRead: '2min',
      readingTime: { text: '2min', words: 306 }
    })
  })
})

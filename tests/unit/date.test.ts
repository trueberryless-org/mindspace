import { describe, expect, test, vi } from 'vitest'

import { formatDate, SUPPORTED_DATE_FORMATS } from '../../src/utils/date'

const date = new Date(2026, 2, 5)

describe('formatDate', () => {
  test.each([
    ['YYYY-MM-DD', '2026.03.05'],
    ['MM-DD-YYYY', '03.05.2026'],
    ['DD-MM-YYYY', '05.03.2026'],
    ['MONTH DAY YYYY', '<span class="month">Mar</span> 5 2026'],
    ['DAY MONTH YYYY', '5 <span class="month">Mar</span> 2026']
  ])('formats %s', (format, expected) => {
    expect(formatDate(date, format)).toBe(expected)
  })

  test('falls back to the ISO-like format for unknown formats', () => {
    expect(formatDate(date, 'unknown')).toBe('2026.03.05')
  })

  test('uses the configured format by default', () => {
    expect(formatDate(date)).toBe('5 <span class="month">Mar</span> 2026')
  })

  test('supports every documented format', () => {
    for (const format of SUPPORTED_DATE_FORMATS) {
      expect(formatDate(date, format)).not.toBe('')
    }
  })
})

describe('formatDate separators', () => {
  test.each([
    ['-', '05-03-2026'],
    ['', '05-03-2026'],
    ['#', '05.03.2026']
  ])('resolves the configured separator %j', async (dateSeparator, expected) => {
    vi.resetModules()
    vi.doMock('@/config', () => ({
      themeConfig: { date: { dateFormat: 'DD-MM-YYYY', dateSeparator } }
    }))

    const { formatDate: format } = await import('../../src/utils/date')

    expect(format(date)).toBe(expected)
    vi.doUnmock('@/config')
  })
})

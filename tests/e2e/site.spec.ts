import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const posts = ['cognitive-erosion', 'earworms', 'writing-blogs']

test.describe('home page', () => {
  test('lists all posts', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('Mindspace')

    for (const slug of posts) {
      await expect(
        page.locator(`main a[href="/${slug}"], main a[href="/${slug}/"]`).first()
      ).toBeVisible()
    }
  })

  test('has canonical and Open Graph metadata', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://mindspace.felixs.dev/'
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og\/og-image\.png$/
    )
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      /^(\/favicon\.svg|blob:.*)$/
    )
  })

  test('does not scroll horizontally', async ({ page }) => {
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )

    expect(overflow).toBeLessThanOrEqual(0)
  })
})

test.describe('post page', () => {
  test('renders the article', async ({ page }) => {
    await page.goto('/earworms/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('main')).toContainText('earworm', { ignoreCase: true })
  })

  test('has a dedicated Open Graph image', async ({ page, request }) => {
    const response = await request.get('/open-graph/earworms.png')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    await page.goto('/earworms/')
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /earworms\.png$/
    )
  })
})

test('serves valid feeds', async ({ request }) => {
  for (const path of ['/rss.xml', '/atom.xml']) {
    const response = await request.get(path)

    expect(response.status(), path).toBe(200)
    expect(await response.text(), path).toContain('<?xml')
  }
})

test('shows the not found page', async ({ page }) => {
  const response = await page.goto('/does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByText('Page Not Found...')).toBeVisible()
})

test.describe('accessibility', () => {
  for (const path of ['/', '/earworms/']) {
    for (const colorScheme of ['dark', 'light'] as const) {
      test(`${path} has no violations in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme })
        await page.goto(path)

        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()

        expect(
          violations.map(
            ({ id, nodes }) => `${id}: ${nodes.map(({ target }) => target.join(' ')).join(', ')}`
          )
        ).toEqual([])
      })
    }
  }
})

import { test, expect } from '@playwright/test'

const widths = [390, 768, 1280]

test.describe('classic menu theme parity', () => {
  test.skip(!process.env.THEME_PARITY_URL, 'Set THEME_PARITY_URL to compare the live menu with the theme engine')

  for (const width of widths) {
    test(`menu layout at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(process.env.THEME_PARITY_URL!)
      await expect(page.locator('body')).toBeVisible()
      await expect(page).toHaveScreenshot(`menu-${width}.png`, { maxDiffPixelRatio: 0.02 })
    })
  }
})

test.describe('classic storefront theme parity', () => {
  test.skip(!process.env.THEME_PARITY_STOREFRONT_URL, 'Set THEME_PARITY_STOREFRONT_URL to compare the live storefront with the theme engine')

  for (const width of widths) {
    test(`storefront layout at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(process.env.THEME_PARITY_STOREFRONT_URL!)
      await expect(page.locator('body')).toBeVisible()
      await expect(page).toHaveScreenshot(`storefront-${width}.png`, { maxDiffPixelRatio: 0.02 })
    })
  }
})

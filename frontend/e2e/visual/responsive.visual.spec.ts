import { test, expect } from '@playwright/test'

const BREAKPOINTS = [
  { name: 'mobile-sm', width: 320, height: 568 },
  { name: 'mobile-md', width: 375, height: 667 },
  { name: 'mobile-lg', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-sm', width: 1024, height: 768 },
  { name: 'desktop-md', width: 1440, height: 900 },
  { name: 'desktop-lg', width: 1920, height: 1080 },
]

test.describe('Responsive Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token-12345')
      localStorage.setItem('user', JSON.stringify({ userId: 1, email: 'test@example.com' }))
    })

    // Navigate to dashboard (MSW will handle API mocking)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    // Wait for MSW to initialize
    await page.waitForTimeout(1000)
  })

  for (const breakpoint of BREAKPOINTS) {
    test(`dashboard at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
      await expect(page).toHaveScreenshot(`dashboard-${breakpoint.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
})

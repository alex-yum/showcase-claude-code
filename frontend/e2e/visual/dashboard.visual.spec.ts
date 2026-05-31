import { test, expect } from '@playwright/test'

test.describe('Dashboard Visual Regression', () => {
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

  test('dashboard desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard with scrolled state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.evaluate(() => window.scrollTo(0, 500))
    await expect(page).toHaveScreenshot('dashboard-scrolled.png', {
      fullPage: false,
      animations: 'disabled',
    })
  })

  test('dashboard loading skeleton', async ({ page }) => {
    // Navigate to dashboard without API mocking to show loading state
    await page.goto('/dashboard')
    await expect(page).toHaveScreenshot('dashboard-loading.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 5000,
    })
  })

  test('dashboard mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 896, height: 414 })
    await expect(page).toHaveScreenshot('dashboard-mobile-landscape.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('dashboard with dark mode (via CSS)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

import { test, expect } from '@playwright/test'

test.describe('Login Page Visual Regression', () => {
  test('login page desktop view (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')

    // Wait for animations to settle
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('login-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login page mobile view (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    // Wait for animations to settle
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('login-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login page tablet view (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')

    // Wait for animations to settle
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('login-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login page with validation errors', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')

    // Trigger validation errors
    await page.getByLabel('Email Address').fill('invalid-email')
    await page.getByLabel('Password').first().fill('weak')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for errors to appear and stabilize
    await page.waitForSelector('p.text-red-400')
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('login-validation-errors.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    })
  })

  test('login page with API error banner', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')

    // Submit with invalid credentials to trigger API error
    await page.getByLabel('Email Address').fill('wrong@example.com')
    await page.getByLabel('Password').first().fill('WrongPassword!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for error banner
    await page.waitForSelector('[role="alert"]')

    await expect(page).toHaveScreenshot('login-api-error.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login page with loading state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')

    // Fill form
    await page.getByLabel('Email Address').fill('test@example.com')
    await page.getByLabel('Password').first().fill('Test123!@#')

    // Intercept login request to delay response
    await page.route('**/api/v1/auth/login', async (route) => {
      // Delay response by 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.continue()
    })

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for loading state
    await page.waitForSelector('button:has-text("Signing in...")')

    await expect(page).toHaveScreenshot('login-loading.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('login page password visible state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/login')

    // Fill password
    await page.getByLabel('Password').first().fill('Test123!@#')

    // Toggle password visibility
    await page.getByRole('button', { name: /toggle password visibility/i }).click()

    await expect(page).toHaveScreenshot('login-password-visible.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

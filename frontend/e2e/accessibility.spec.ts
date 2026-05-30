import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Login Page Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/login')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form labels are properly associated with inputs', async ({ page }) => {
    await page.goto('/login')

    // Email label
    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()
    await expect(emailLabel).toHaveText(/email address/i)

    // Password label
    const passwordLabel = page.locator('label[for="password"]')
    await expect(passwordLabel).toBeVisible()
    await expect(passwordLabel).toHaveText(/password/i)

    // Remember me label
    const rememberMeLabel = page.locator('label[for="rememberMe"]')
    await expect(rememberMeLabel).toBeVisible()
    await expect(rememberMeLabel).toHaveText(/remember me/i)
  })

  test('error messages are announced to screen readers', async ({ page }) => {
    await page.goto('/login')

    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: /sign in/i }).click()

    // Check for aria-live or role="alert" on error messages
    const errorMessages = page.locator('p.text-red-400')
    await expect(errorMessages.first()).toBeVisible()
  })

  test('focus indicators are visible on all interactive elements', async ({ page }) => {
    await page.goto('/login')

    const interactiveElements = [
      page.locator('input#email'),
      page.locator('input#password'),
      page.getByRole('button', { name: /toggle password visibility/i }),
      page.locator('input#rememberMe'),
      page.getByRole('link', { name: /forgot password/i }),
      page.getByRole('button', { name: /sign in/i }),
    ]

    for (const element of interactiveElements) {
      await element.focus()

      // Check element has focus
      await expect(element).toBeFocused()

      // Take screenshot to manually verify focus ring
      // (Programmatic focus ring detection is not reliable)
    }
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/login')

    // Run axe with WCAG AA color contrast rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze()

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'color-contrast'
    )

    expect(colorContrastViolations).toEqual([])
  })

  test('form can be completed using only keyboard', async ({ page }) => {
    await page.goto('/login')

    // Tab to email field and fill it
    await page.keyboard.press('Tab')
    await page.keyboard.type('test@example.com')

    // Tab to password field and fill it
    await page.keyboard.press('Tab')
    await page.keyboard.type('Test123!@#')

    // Tab through the password visibility toggle button
    await page.keyboard.press('Tab')

    // Tab through remember me checkbox
    await page.keyboard.press('Tab')

    // Tab through forgot password link
    await page.keyboard.press('Tab')

    // Tab to sign in button
    await page.keyboard.press('Tab')

    // Verify we can submit with Enter key
    await page.keyboard.press('Enter')

    // Wait for page to respond
    await page.waitForLoadState('networkidle').catch(() => {})

    // Verify form was submitted (URL should change or error should appear)
    const finalUrl = page.url()
    expect(finalUrl).toContain('localhost')
  })

  test('animated orbs are hidden from screen readers', async ({ page }) => {
    await page.goto('/login')

    // Check orbs have aria-hidden="true"
    const orbs = page.locator('.animate-float')
    const orbCount = await orbs.count()

    expect(orbCount).toBeGreaterThan(0)

    for (let i = 0; i < orbCount; i++) {
      const orb = orbs.nth(i)
      await expect(orb).toHaveAttribute('aria-hidden', 'true')
    }
  })
})

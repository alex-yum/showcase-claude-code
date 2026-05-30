import { test, expect, devices } from '@playwright/test'

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token-12345')
      localStorage.setItem('user', JSON.stringify({ userId: 1, email: 'test@example.com' }))
    })

    // Mock API responses with realistic data
    await page.route('**/api/v1/**', async route => {
      const url = route.request().url()

      if (url.includes('/orders')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [
              {
                orderId: '1234',
                userId: 1,
                status: 'delivered',
                total: 79.99,
                items: [
                  { productId: 1, name: 'Premium Cotton T-Shirt', quantity: 2, price: 39.99 }
                ],
                createdAt: '2026-05-28T10:30:00Z',
                updatedAt: '2026-05-29T14:20:00Z'
              },
              {
                orderId: '1235',
                userId: 1,
                status: 'shipped',
                total: 129.50,
                items: [
                  { productId: 2, name: 'Designer Jeans', quantity: 1, price: 129.50 }
                ],
                createdAt: '2026-05-25T08:15:00Z',
                updatedAt: '2026-05-26T16:45:00Z'
              }
            ]
          })
        })
      } else if (url.includes('/products')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              {
                productId: 1,
                name: 'Premium Cotton T-Shirt',
                description: 'Luxuriously soft everyday essential',
                price: 39.99,
                rating: 4.5,
                reviewCount: 234,
                imageUrl: null,
                inStock: true
              },
              {
                productId: 2,
                name: 'Designer Jeans',
                description: 'Premium denim with perfect fit',
                price: 129.50,
                rating: 4.8,
                reviewCount: 567,
                imageUrl: null,
                inStock: true
              },
              {
                productId: 3,
                name: 'Leather Wallet',
                description: 'Genuine leather craftsmanship',
                price: 59.99,
                rating: 4.6,
                reviewCount: 189,
                imageUrl: null,
                inStock: true
              }
            ]
          })
        })
      } else if (url.includes('/stats')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ordersThisMonth: 5,
            totalSpent: 237.50,
            loyaltyPoints: 2450
          })
        })
      } else {
        await route.continue()
      }
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
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

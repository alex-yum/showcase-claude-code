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
                id: '1234',
                orderNumber: '#1234',
                date: '2026-05-28',
                status: 'Delivered',
                total: 79.99,
                items: [{ name: 'Premium Cotton T-Shirt', quantity: 2 }]
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
                id: '1',
                name: 'Premium Cotton T-Shirt',
                price: 39.99,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                category: 'Clothing'
              },
              {
                id: '2',
                name: 'Designer Jeans',
                price: 129.50,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
                category: 'Clothing'
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

import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should show validation error for empty fields', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: /login/i }).click()

    await expect(page.getByText(/email.*required/i)).toBeVisible()
    await expect(page.getByText(/password.*required/i)).toBeVisible()
  })

  test('should have mobile-optimized touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const loginButton = page.getByRole('button', { name: /login/i })

    const emailBox = await emailInput.boundingBox()
    const passwordBox = await passwordInput.boundingBox()
    const buttonBox = await loginButton.boundingBox()

    expect(emailBox?.height).toBeGreaterThanOrEqual(44)
    expect(passwordBox?.height).toBeGreaterThanOrEqual(44)
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })

  test('should navigate to dashboard on successful login', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('validpassword')
    await page.getByRole('button', { name: /login/i }).click()

    await expect(page).toHaveURL(/dashboard/)
  })

  test('should have link to register page', async ({ page }) => {
    await page.goto('/login')

    const registerLink = page.getByRole('link', { name: /register|sign up/i })
    await expect(registerLink).toBeVisible()

    await registerLink.click()
    await expect(page).toHaveURL(/register/)
  })
})

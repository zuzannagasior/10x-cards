import type { Page } from "@playwright/test";

/**
 * Helper class for handling authentication in E2E tests
 */
export class AuthSetup {
  private readonly testEmail: string;
  private readonly testPassword: string;

  constructor() {
    // Load environment variables
    const testEmail = process.env.E2E_USERNAME;
    const testPassword = process.env.E2E_PASSWORD;

    // Validate required environment variables
    if (!testEmail || !testPassword) {
      throw new Error("Missing required environment variables for auth setup");
    }

    this.testEmail = testEmail;
    this.testPassword = testPassword;
  }

  /**
   * Authenticate user via UI interaction
   */
  async authenticate(page: Page): Promise<void> {
    // Navigate to the login page
    await page.goto("/login", { waitUntil: "networkidle" });

    // Wait for login form to be visible
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 5000 });

    // Fill in credentials and submit
    await page.locator('[data-testid="email-input"]').fill(this.testEmail);
    await page.locator('[data-testid="password-input"]').fill(this.testPassword);
    await page.locator('[data-testid="login-submit"]').click();

    // Wait for navigation to complete
    await page.waitForURL("generate");
  }
}

import { expect } from "@playwright/test";

import type { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navLinks = page.getByRole("navigation").getByRole("link");
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveTitle(/10x Cards/);
    await expect(this.heading).toBeVisible();
  }

  async navigateTo(linkText: string) {
    await this.navLinks.filter({ hasText: linkText }).click();
  }

  async expectUrl(urlPattern: RegExp) {
    await expect(this.page).toHaveURL(urlPattern);
  }

  async takeScreenshot(name: string) {
    await this.page.waitForLoadState("networkidle");
    await expect(this.page).toHaveScreenshot(name);
  }
}

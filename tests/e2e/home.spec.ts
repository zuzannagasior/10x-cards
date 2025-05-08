import { test } from "@playwright/test";

import { HomePage } from "./models/HomePage";

test.describe("Home Page", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("should load the home page", async () => {
    await homePage.expectPageLoaded();
  });

  test("should navigate to another page", async () => {
    await homePage.navigateTo("About");
    await homePage.expectUrl(/.*about/);
  });

  test("should take a screenshot of the home page", async () => {
    await homePage.takeScreenshot("home-page.png");
  });
});

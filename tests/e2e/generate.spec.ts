import { expect, test } from "@playwright/test";

import { AuthSetup } from "./models/auth.setup";
import { GeneratePage } from "./models/generate.page";

test.describe("Flashcard Generation", () => {
  let generatePage: GeneratePage;
  let authSetup: AuthSetup;

  // Sample text that meets the minimum length requirement (1000 characters)
  const sampleText = `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, 
    eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. 
    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui 
    ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, 
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
    Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
  `.repeat(2); // Repeat to ensure we meet the minimum length requirement

  test.beforeEach(async ({ page }) => {
    // Setup authentication
    authSetup = new AuthSetup();
    await authSetup.authenticate(page);

    // Initialize page object
    generatePage = new GeneratePage(page);

    // Navigate to generate page
    await generatePage.goto();
  });

  test("should generate and save 5 flashcards", async () => {
    // Arrange - Verify we're on the correct page and the input is ready
    await expect(generatePage.textInput).toBeVisible();
    await expect(generatePage.generateButton).toBeVisible();
    // Act - Step 1 & 2: Open page and paste text
    await generatePage.enterText(sampleText);
    await expect(generatePage.generateButton).toBeEnabled();
    // Act - Step 3: Generate flashcards and wait for results
    await generatePage.generateFlashcards();
    // Act - Step 4: Accept 5 flashcards
    await generatePage.acceptFlashcards(5);
    // Verify that exactly 5 cards are accepted before saving
    await generatePage.expectAcceptedFlashcardsCount(5);
    await expect(generatePage.saveAcceptedButton).toBeEnabled();
    // Act - Step 5: Save the accepted flashcards
    await generatePage.saveAcceptedFlashcards();
    // Assert - Step 6: Verify the final state
    // The page should be reset after successful save
    await expect(generatePage.textInput).toBeEmpty();
    await expect(generatePage.generateButton).toBeDisabled();
  });

  test("should show validation error for too short text", async () => {
    await generatePage.enterText("Too short text");
    await expect(generatePage.generateButton).toBeDisabled();
    const error = await generatePage.getValidationError();
    expect(error).toBe("Text must be at least 1000 characters long");
  });
});

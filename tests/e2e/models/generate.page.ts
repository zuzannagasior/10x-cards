import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

/**
 * Page Object Model for the Generate Flashcards page
 * Represents the page at /generate where users can generate and manage flashcards
 */
export class GeneratePage {
  readonly page: Page;

  // Main elements
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly saveAcceptedButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators using data-testid attributes
    this.textInput = page.getByTestId("text-generation-input");
    this.generateButton = page.getByTestId("generate-flashcards-button");
    this.saveAcceptedButton = page.getByTestId("save-accepted-flashcards-button");
  }

  /**
   * Navigate to the generate page
   */
  async goto() {
    await this.page.goto("/generate");
  }

  /**
   * Enter text into the generation input
   */
  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  /**
   * Click the generate button and wait for flashcards to be generated
   */
  async generateFlashcards() {
    await this.generateButton.click();
    // Wait for the success toast to appear
    await this.page.getByText("Flashcards generated successfully").waitFor();
  }

  /**
   * Accept a specific number of flashcards
   * @param count Number of flashcards to accept
   */
  async acceptFlashcards(count: number) {
    const acceptButtons = this.page.getByTestId("accept-flashcard-button");
    const buttons = await acceptButtons.all();

    // Verify we have enough flashcards to accept
    if (buttons.length < count) {
      throw new Error(`Not enough flashcards to accept. Required: ${count}, Available: ${buttons.length}`);
    }

    // Accept the specified number of flashcards
    for (let i = 0; i < count; i++) {
      await buttons[i].click();
    }
  }

  /**
   * Save accepted flashcards and verify success
   */
  async saveAcceptedFlashcards() {
    await this.saveAcceptedButton.click();
    // Wait for the success toast to appear
    await this.page.getByText("Flashcards saved successfully").waitFor();
  }

  /**
   * Get the number of accepted flashcards
   */
  async getAcceptedFlashcardsCount(): Promise<number> {
    // Count cards with green styling which indicates acceptance
    const acceptedCards = this.page.locator(".border-green-500");
    return await acceptedCards.count();
  }

  /**
   * Verify that the expected number of flashcards are accepted
   */
  async expectAcceptedFlashcardsCount(expectedCount: number) {
    const count = await this.getAcceptedFlashcardsCount();
    expect(count).toBe(expectedCount);
  }

  /**
   * Check if the generate button is enabled
   */
  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  /**
   * Check if the save accepted button is enabled
   */
  async isSaveAcceptedButtonEnabled(): Promise<boolean> {
    return await this.saveAcceptedButton.isEnabled();
  }

  /**
   * Get validation error message if present
   */
  async getValidationError(): Promise<string | null> {
    const errorElement = this.page.locator(".text-red-500");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }
}

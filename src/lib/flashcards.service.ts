import { DEFAULT_USER_ID, supabaseClient } from '../db/supabase.client';

export class FlashcardsService {
  /**
   * @param flashcards - Array of flashcard objects to insert.
   * @returns {Promise<any>} A promise resolving with the inserted flashcard data.
   * @throws {Error} Throws an error if no flashcards are provided or if the insertion fails.
   */
  async createFlashcards(
    flashcards: { front: string; back: string; source: "manual" | "ai" | "ai-edited"; generation_id?: number }[]
  ) {
    try {
      // Validate that flashcards array is not empty
      if (!flashcards.length) {
        throw new Error("No flashcards provided");
      }

      const flashcardsToInsert = flashcards.map((flashcard) => ({
        ...flashcard,
        user_id: DEFAULT_USER_ID,
      }));

      const { data, error } = await supabaseClient.from("flashcards").insert(flashcardsToInsert).select();

      if (error) {
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }

      return data;
    } catch {
      throw new Error("Unknown error while creating flashcards");
    }
  }
}

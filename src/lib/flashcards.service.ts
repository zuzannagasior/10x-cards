import type { Database } from "../db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FlashcardsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * @param flashcards - Array of flashcard objects to insert.
   * @param userId - ID of the user creating the flashcards.
   * @returns {Promise<any>} A promise resolving with the inserted flashcard data.
   * @throws {Error} Throws an error if no flashcards are provided or if the insertion fails.
   */
  async createFlashcards(
    flashcards: { front: string; back: string; source: "manual" | "ai" | "ai-edited"; generation_id?: number }[],
    userId: string
  ) {
    try {
      // Validate that flashcards array is not empty
      if (!flashcards.length) {
        throw new Error("No flashcards provided");
      }

      // Validate user_id is provided
      if (!userId) {
        throw new Error("User ID is required");
      }

      const flashcardsToInsert = flashcards.map((flashcard) => ({
        ...flashcard,
        user_id: userId,
      }));

      const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

      if (error) {
        throw new Error(`Failed to create flashcards: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error while creating flashcards");
    }
  }
}

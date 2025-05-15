import type { FlashcardDto, Source } from "../../types";
import { FlashcardForbiddenError, FlashcardNotFoundError, FlashcardOperationError } from "../errors/flashcard.errors";

import type { Database } from "../../db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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

  async getFlashcards(
    userId: string,
    page: number,
    limit: number,
    source?: Source
  ): Promise<{ data: FlashcardDto[]; count: number }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(startIndex, endIndex);

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    return {
      data: data as FlashcardDto[],
      count: count ?? 0,
    };
  }

  /**
   * Deletes a flashcard if it belongs to the specified user.
   * @param id The ID of the flashcard to delete
   * @param userId The ID of the user attempting to delete the flashcard
   * @throws {FlashcardNotFoundError} If the flashcard doesn't exist
   * @throws {FlashcardForbiddenError} If the flashcard belongs to another user
   * @throws {FlashcardOperationError} If the operation fails
   */
  async deleteFlashcard(id: number, userId: string): Promise<void> {
    // First check if the flashcard exists and belongs to the user
    const { data: existing, error: selectError } = await this.supabase
      .from("flashcards")
      .select("user_id")
      .eq("id", id)
      .single();

    if (selectError) {
      throw new FlashcardOperationError("check existence", selectError.message);
    }

    if (!existing) {
      throw new FlashcardNotFoundError(id);
    }

    if (existing.user_id !== userId) {
      throw new FlashcardForbiddenError(id);
    }

    // Delete the flashcard
    const { error: deleteError } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

    if (deleteError) {
      throw new FlashcardOperationError("delete", deleteError.message);
    }
  }
}

import type { CreateGenerationSessionResponseDto, FlashcardProposalDto } from "../types";
import crypto from "crypto";

import { DEFAULT_USER_ID, supabaseClient } from "../db/supabase.client";

export class GenerationService {
  async generateFlashcards(text: string): Promise<CreateGenerationSessionResponseDto> {
    try {
      const sourceTextHash = this.calculateTextHash(text);
      const flashcardsProposals = await this.callAIService(text);
      const session = await this.saveGenerationSession(sourceTextHash, flashcardsProposals.length);

      return {
        generation_session: {
          id: session.id,
          model: session.model,
          created_at: session.created_at,
        },
        flashcards_proposals: flashcardsProposals,
      };
    } catch (error) {
      if (error instanceof Error) {
        await this.logError(error.message, error.name, this.calculateTextHash(text));
      }
      throw error;
    }
  }

  private calculateTextHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callAIService(text: string): Promise<FlashcardProposalDto[]> {
    // Mock implementation - in real version this would call the AI service
    const numCards = Math.min(Math.floor(text.length / 1000), 5);

    return Array.from({ length: numCards }, (_, i) => ({
      front: `Sample question ${i + 1} from text of length ${text.length}`,
      back: `Sample answer ${i + 1}`,
    }));
  }

  private async saveGenerationSession(sourceTextHash: string, generatedCount: number) {
    const { data: session, error: sessionError } = await supabaseClient
      .from("generation_sessions")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: sourceTextHash,
        model: "gpt-4",
        generated_count: generatedCount,
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new Error("Failed to create generation session: " + sessionError?.message);
    }

    return session;
  }

  private async logError(message: string, errorCode: string, sourceTextHash: string): Promise<void> {
    try {
      await supabaseClient.from("generation_session_error_logs").insert({
        user_id: DEFAULT_USER_ID,
        error_message: message,
        error_code: errorCode || "UNKNOWN",
        source_text_hash: sourceTextHash,
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}

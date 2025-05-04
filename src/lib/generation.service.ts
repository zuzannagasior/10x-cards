import type { CreateGenerationSessionResponseDto, FlashcardProposalDto } from "../types";
import crypto from "crypto";

import { DEFAULT_USER_ID, supabaseClient } from "../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";

import type { ResponseFormatSchema } from "./openrouter.types";
export class GenerationService {
  private openRouterService: OpenRouterService;

  constructor(openRouterConfig: { apiKey?: string }) {
    if (!openRouterConfig.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    this.openRouterService = new OpenRouterService({
      apiKey: openRouterConfig.apiKey,
      defaultModel: "gpt-4o-mini",
      defaultParams: {
        temperature: 0.7,
        max_tokens: 2048,
      },
    });

    // Configure system message for flashcard generation
    this.openRouterService.setSystemMessage(
      "You are a flashcard generation assistant. Your task is to create high-quality flashcards from the provided text. " +
        "Each flashcard should have a clear question on the front and a concise answer on the back. " +
        "The front should be max 200 characters and the back max 500 characters. " +
        "Focus on key concepts, definitions, and relationships in the text."
    );

    // Configure response format for structured output
    const responseFormat: ResponseFormatSchema = {
      name: "flashcards",
      schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string" },
                back: { type: "string" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    };
    this.openRouterService.setResponseFormat(responseFormat);
  }

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
    try {
      const response = await this.openRouterService.sendChat(text);
      const result = JSON.parse(response.message);

      if (!result.flashcards || !Array.isArray(result.flashcards)) {
        throw new Error("Invalid response format from AI service");
      }

      return result.flashcards.map((card: { front: string; back: string }) => ({
        front: card.front,
        back: card.back,
      }));
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards using AI service");
    }
  }

  private async saveGenerationSession(sourceTextHash: string, generatedCount: number) {
    const { data: session, error: sessionError } = await supabaseClient
      .from("generation_sessions")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: sourceTextHash,
        model: this.openRouterService.getModel().model,
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

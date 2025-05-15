/*
 * DTO and Command Model type definitions for the API endpoints.
 * These types are derived from the database models defined in src/db/database.types.ts
 * and are aligned with the API plan.
 */

import type { Database } from "./db/database.types";

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type GenerationSession = Database["public"]["Tables"]["generation_sessions"]["Row"];
export type GenerationSessionErrorLog = Database["public"]["Tables"]["generation_session_error_logs"]["Row"];

/**
 * Flashcard Data Transfer Object
 * Represents a flashcard as returned by the API.
 */
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

export type Source = "all" | "manual" | "ai" | "ai-edited";

/**
 * CreateFlashcardCommand represents the payload for creating a flashcard.
 * For manual flashcards, generation_id should not be provided.
 * For AI generated or AI-edited flashcards, generation_id is required.
 */
export type CreateFlashcardCommand =
  | {
      front: string;
      back: string;
      source: "manual";
      generation_id?: never;
    }
  | {
      front: string;
      back: string;
      source: "ai" | "ai-edited";
      generation_id: number;
    };

/**
 * Request DTO for creating one or more flashcards.
 */
export interface CreateFlashcardsRequestDto {
  flashcards: CreateFlashcardCommand[];
}

/**
 * UpdateFlashcardCommand represents the payload for updating a flashcard's content.
 */
export type UpdateFlashcardCommand = Pick<FlashcardDto, "front" | "back">;

/**
 * Pagination DTO used for list responses.
 */
export interface PaginationDto {
  page: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Response DTO for listing flashcards.
 */
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

/**
 * GenerationSessionDto represents a flashcard generation session for list endpoints.
 */
export type GenerationSessionDto = GenerationSession;
/**
 * Response DTO for listing generation sessions.
 */
export interface ListGenerationSessionsResponseDto {
  data: GenerationSessionDto[];
  pagination: PaginationDto;
}

/**
 * Command model for creating a generation session.
 * The text should be between 1000 and 10000 characters.
 */
export interface CreateGenerationSessionCommand {
  text: string;
}

export interface FlashcardProposalDto {
  front: string;
  back: string;
}

/**
 * Response DTO for creating a generation session.
 * Returns the session details and an array of generated flashcard proposals.
 */
export interface CreateGenerationSessionResponseDto {
  generation_session: Pick<GenerationSessionDto, "id" | "model" | "created_at">;
  flashcards_proposals: FlashcardProposalDto[];
}

/**
 * GenerationSessionErrorLogDto represents an error log entry from a generation session.
 * It directly maps to the corresponding database table.
 */
export type GenerationSessionErrorLogDto = GenerationSessionErrorLog;

/**
 * Response DTO for listing generation session error logs.
 */
export interface ListGenerationSessionErrorLogsResponseDto {
  errors: GenerationSessionErrorLogDto[];
}

export interface FlashcardViewModel extends FlashcardProposalDto {
  accepted: boolean;
  edited: boolean;
}

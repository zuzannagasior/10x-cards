import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FlashcardForbiddenError,
  FlashcardNotFoundError,
  FlashcardOperationError,
} from "@/lib/errors/flashcard.errors";
import { FlashcardsService } from "@/lib/services/flashcards.service";

import { DELETE } from "../[id]";

import type { APIContext } from "astro";
import type { Database } from "@/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock the FlashcardsService
vi.mock("@/lib/services/flashcards.service", () => ({
  FlashcardsService: vi.fn(),
}));

// Helper function to create a test context
function createTestContext(
  params: Record<string, string>,
  locals: {
    user?: { id: string; email: string | null };
    supabase?: SupabaseClient<Database>;
  } = {}
): Partial<APIContext> {
  return {
    params,
    locals: locals as App.Locals, // Cast to App.Locals since we're in a test environment
    url: new URL("http://localhost"),
  };
}

describe("DELETE /api/flashcards/[id]", () => {
  let mockDeleteFlashcard: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDeleteFlashcard = vi.fn();
    (FlashcardsService as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      deleteFlashcard: mockDeleteFlashcard,
    }));
  });

  it("should return 401 when user is not authenticated", async () => {
    const response = await DELETE(createTestContext({ id: "1" }, {}) as APIContext);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 when ID is invalid", async () => {
    const response = await DELETE(
      createTestContext(
        { id: "invalid" },
        {
          user: { id: "user-123", email: "test@example.com" },
        }
      ) as APIContext
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid ID parameter");
    expect(body.details).toBeDefined();
  });

  it("should return 204 when flashcard is successfully deleted", async () => {
    mockDeleteFlashcard.mockResolvedValue(undefined);

    const response = await DELETE(
      createTestContext(
        { id: "1" },
        {
          user: { id: "user-123", email: "test@example.com" },
          supabase: {} as SupabaseClient<Database>,
        }
      ) as APIContext
    );

    expect(response.status).toBe(204);
    expect(mockDeleteFlashcard).toHaveBeenCalledWith(1, "user-123");
  });

  it("should return 404 when flashcard is not found", async () => {
    mockDeleteFlashcard.mockRejectedValue(new FlashcardNotFoundError(1));

    const response = await DELETE(
      createTestContext(
        { id: "1" },
        {
          user: { id: "user-123", email: "test@example.com" },
          supabase: {} as SupabaseClient<Database>,
        }
      ) as APIContext
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not Found");
    expect(body.code).toBe("FLASHCARD_NOT_FOUND");
  });

  it("should return 403 when user doesn't own the flashcard", async () => {
    mockDeleteFlashcard.mockRejectedValue(new FlashcardForbiddenError(1));

    const response = await DELETE(
      createTestContext(
        { id: "1" },
        {
          user: { id: "user-123", email: "test@example.com" },
          supabase: {} as SupabaseClient<Database>,
        }
      ) as APIContext
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden");
    expect(body.code).toBe("FLASHCARD_FORBIDDEN");
  });

  it("should return 500 when operation fails", async () => {
    mockDeleteFlashcard.mockRejectedValue(new FlashcardOperationError("delete", "Database error"));

    const response = await DELETE(
      createTestContext(
        { id: "1" },
        {
          user: { id: "user-123", email: "test@example.com" },
          supabase: {} as SupabaseClient<Database>,
        }
      ) as APIContext
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Operation Failed");
    expect(body.code).toBe("FLASHCARD_OPERATION_FAILED");
  });

  it("should return 500 on unexpected errors", async () => {
    mockDeleteFlashcard.mockRejectedValue(new Error("Unexpected error"));

    const response = await DELETE(
      createTestContext(
        { id: "1" },
        {
          user: { id: "user-123", email: "test@example.com" },
          supabase: {} as SupabaseClient<Database>,
        }
      ) as APIContext
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });
});

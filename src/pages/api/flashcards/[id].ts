import { FlashcardError, FlashcardForbiddenError, FlashcardNotFoundError } from "@/lib/errors/flashcard.errors";
import { flashcardParamsSchema } from "@/lib/schemas/flashcards";
import { FlashcardsService } from "@/lib/services/flashcards.service";

import type { APIRoute } from "astro";
export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate ID parameter using Zod
    const result = flashcardParamsSchema.safeParse({ id: Number(params.id) });
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid ID parameter",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize service and delete flashcard
    const flashcardsService = new FlashcardsService(locals.supabase);
    await flashcardsService.deleteFlashcard(result.data.id, locals.user.id);

    // Return success with no content
    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof FlashcardError) {
      console.error(`Flashcard error (${error.code}):`, error.message);

      if (error instanceof FlashcardNotFoundError) {
        return new Response(JSON.stringify({ error: "Not Found", code: error.code }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (error instanceof FlashcardForbiddenError) {
        return new Response(JSON.stringify({ error: "Forbidden", code: error.code }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle other flashcard errors
      return new Response(JSON.stringify({ error: "Operation Failed", code: error.code }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle unexpected errors
    console.error("Unexpected error while deleting flashcard:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

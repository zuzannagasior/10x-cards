import { CreateFlashcardsRequestSchema, getFlashcardsQuerySchema } from "@/lib/schemas/flashcards";
import { FlashcardsService } from "@/lib/services/flashcards.service";

import type { APIRoute } from "astro";
import type { FlashcardsListResponseDto } from "../../../types";
export const prerender = false;

export async function POST({ request, locals }: Parameters<APIRoute>[0]) {
  try {
    // Check for authorization middleware result
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    // Validate payload using Zod schema
    const parsed = CreateFlashcardsRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.errors }), { status: 400 });
    }

    const { flashcards } = parsed.data;
    const flashcardsService = new FlashcardsService(locals.supabase);
    const result = await flashcardsService.createFlashcards(flashcards, locals.user.id);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("Flashcards endpoint error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      }),
      { status: 500 }
    );
  }
}

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Validate and parse query parameters
    const result = getFlashcardsQuerySchema.safeParse(Object.fromEntries(url.searchParams));

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.issues,
        }),
        {
          status: 400,
        }
      );
    }

    const { page, limit, source } = result.data;

    // Get flashcards from service
    const flashcardsService = new FlashcardsService(locals.supabase);
    const { data: flashcards, count } = await flashcardsService.getFlashcards(user.id, page, limit, source);

    // Prepare response
    const response: FlashcardsListResponseDto = {
      data: flashcards,
      pagination: {
        page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in GET /flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
      }
    );
  }
};

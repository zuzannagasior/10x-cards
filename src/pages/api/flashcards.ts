import type { APIRoute } from "astro";
import { z } from 'zod';

import { FlashcardsService } from '../../lib/flashcards.service';

// Define schema for manual flashcards
const CreateFlashcardCommandSchemaManual = z.object({
  front: z.string().max(200),
  back: z.string().max(500),
  source: z.literal("manual"),
});

// Define schema for AI flashcards (ai or ai-edited) with required generation_id
const CreateFlashcardCommandSchemaAI = z.object({
  front: z.string().max(200),
  back: z.string().max(500),
  source: z.union([z.literal("ai"), z.literal("ai-edited")]),
  generation_id: z.number(),
});

// Union schema for flashcard creation command
const CreateFlashcardCommandSchema = z.union([CreateFlashcardCommandSchemaManual, CreateFlashcardCommandSchemaAI]);

// Schema for the request body
const CreateFlashcardsRequestSchema = z.object({
  flashcards: z.array(CreateFlashcardCommandSchema),
});

export const prerender = false;

export async function POST({ request }: Parameters<APIRoute>[0]) {
  try {
    //  const { user, supabase } = locals as RequestLocals;
    // Check for authorization middleware result
    //   if (!user) {
    //     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    //   }

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
    const flashcardsService = new FlashcardsService();
    const result = await flashcardsService.createFlashcards(flashcards);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("Flashcards endpoint error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

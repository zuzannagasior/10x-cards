import type { APIRoute } from "astro";
import { z } from "zod";

import { GenerationService } from "../../lib/generation.service";

export const prerender = false;

const requestSchema = z.object({
  text: z
    .string()
    .min(1000, { message: "Text is too short. Minimum 1000 characters required." })
    .max(10000, { message: "Text is too long. Maximum 10000 characters allowed." }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check for authorization middleware result
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
    }

    // Validate input using Zod
    const parseResult = requestSchema.safeParse(requestData);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: parseResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const { text } = parseResult.data;
    const generationService = new GenerationService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      userId: locals.user.id,
      supabase: locals.supabase,
    });
    const result = await generationService.generateFlashcards(text);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("Generation endpoint error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : undefined,
      }),
      { status: 500 }
    );
  }
};

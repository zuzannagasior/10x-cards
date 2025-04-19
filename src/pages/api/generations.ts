import { z } from "zod";

import { GenerationService } from "../../lib/generation.service";

export const prerender = false;

const requestSchema = z.object({
  text: z
    .string()
    .min(1000, { message: "Text is too short. Minimum 1000 characters required." })
    .max(10000, { message: "Text is too long. Maximum 10000 characters allowed." }),
});

export async function POST({ request }: { request: Request }): Promise<Response> {
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate input using Zod
    const parseResult = requestSchema.safeParse(requestData);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { text } = parseResult.data;
    const generationService = new GenerationService();
    const result = await generationService.generateFlashcards(text);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generation endpoint error:", error);

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

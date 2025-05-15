import type { Source } from "../../types";
import { z } from "zod";

// Define schema for manual flashcards
export const CreateFlashcardCommandSchemaManual = z.object({
  front: z.string().max(200),
  back: z.string().max(500),
  source: z.literal("manual"),
});

// Define schema for AI flashcards (ai or ai-edited) with required generation_id
export const CreateFlashcardCommandSchemaAI = z.object({
  front: z.string().max(200),
  back: z.string().max(500),
  source: z.union([z.literal("ai"), z.literal("ai-edited")]),
  generation_id: z.number(),
});

// Union schema for flashcard creation command
export const CreateFlashcardCommandSchema = z.union([
  CreateFlashcardCommandSchemaManual,
  CreateFlashcardCommandSchemaAI,
]);

// Schema for the request body
export const CreateFlashcardsRequestSchema = z.object({
  flashcards: z.array(CreateFlashcardCommandSchema).min(1, "At least one flashcard is required"),
});

export const getFlashcardsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().positive("Page must be a positive number")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().positive("Limit must be a positive number").max(100, "Maximum limit is 100")),
  source: z
    .string()
    .optional()
    .transform((val) => val as Source | undefined)
    .pipe(z.union([z.literal("manual"), z.literal("ai"), z.literal("ai-edited")]).optional()),
});

export type GetFlashcardsQueryParams = z.infer<typeof getFlashcardsQuerySchema>;

export const flashcardIdSchema = z
  .number()
  .int()
  .positive()
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val), {
    message: "ID must be a valid number",
  });

export const flashcardParamsSchema = z.object({
  id: flashcardIdSchema,
});

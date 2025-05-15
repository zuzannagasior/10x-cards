import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../flashcards";

import type { APIContext } from "astro";
import type { Database } from "@/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Flashcards API", () => {
  let mockContext: APIContext;
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    mockContext = {
      locals: {
        user: { id: "test-user" },
        supabase: mockSupabase,
      },
      url: new URL("http://localhost/api/flashcards"),
      request: new Request("http://localhost/api/flashcards"),
    } as unknown as APIContext;
  });

  describe("GET /flashcards", () => {
    it("should return flashcards with pagination", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            front: "Test front",
            back: "Test back",
            source: "manual",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        count: 1,
        error: null,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      });

      mockSupabase.from = mockFrom;

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        data: mockResponse.data,
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: 1,
        },
      });
    });

    it("should handle query parameters", async () => {
      mockContext.url = new URL("http://localhost/api/flashcards?page=2&limit=10&source=manual");

      const mockResponse = {
        data: [],
        count: 0,
        error: null,
      };

      const mockRange = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockResponse),
      });
      const mockOrder = vi.fn().mockReturnValue({
        range: mockRange,
      });
      const mockEqUser = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEqUser,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from = mockFrom;

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        data: [],
        pagination: {
          page: 2,
          totalPages: 0,
          totalItems: 0,
        },
      });

      // Verify the query chain
      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockSelect).toHaveBeenCalledWith("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      });
      expect(mockEqUser).toHaveBeenCalledWith("user_id", "test-user");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(10, 19);
      expect(mockRange().eq).toHaveBeenCalledWith("source", "manual");
    });

    it("should return 401 when user is not authenticated", async () => {
      mockContext.locals.user = undefined;

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid query parameters", async () => {
      mockContext.url = new URL("http://localhost/api/flashcards?page=invalid");

      const response = await GET(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid query parameters");
    });
  });

  describe("POST /flashcards", () => {
    const validPayload = {
      flashcards: [
        {
          front: "Test front",
          back: "Test back",
          source: "manual" as const,
        },
      ],
    };

    it("should create flashcards successfully", async () => {
      const mockResponse = {
        data: [{ ...validPayload.flashcards[0], id: 1 }],
        error: null,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      mockSupabase.from = mockFrom;

      mockContext.request = new Request("http://localhost/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      });

      const response = await POST(mockContext);
      expect(response.status).toBe(201);
    });

    it("should return 401 when user is not authenticated", async () => {
      mockContext.locals.user = undefined;

      const response = await POST(mockContext);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("should return 400 for invalid payload", async () => {
      const invalidPayload = { flashcards: [] };

      mockContext.request = new Request("http://localhost/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidPayload),
      });

      // Nie potrzebujemy mockować serwisu, ponieważ walidacja Zod powinna zatrzymać request wcześniej
      const response = await POST(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBeDefined();
    });

    it("should return 400 for invalid JSON", async () => {
      mockContext.request = new Request("http://localhost/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await POST(mockContext);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid JSON");
    });
  });
});

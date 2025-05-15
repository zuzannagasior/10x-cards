import { beforeEach, describe, expect, it, vi } from "vitest";

import { FlashcardsService } from "../flashcards.service";

import type { Database } from "@/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("FlashcardsService", () => {
  let mockSupabase: SupabaseClient<Database>;
  let service: FlashcardsService;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    service = new FlashcardsService(mockSupabase);
  });

  describe("getFlashcards", () => {
    it("should fetch flashcards with pagination", async () => {
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

      const result = await service.getFlashcards("user123", 1, 20);

      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockFrom().select).toHaveBeenCalledWith("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      });
      expect(mockFrom().select().eq).toHaveBeenCalledWith("user_id", "user123");
      expect(mockFrom().select().eq().order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockFrom().select().eq().order().range).toHaveBeenCalledWith(0, 19);
      expect(result).toEqual({
        data: mockResponse.data,
        count: mockResponse.count,
      });
    });

    it("should apply source filter when provided", async () => {
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

      await service.getFlashcards("user123", 1, 20, "manual");

      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockSelect).toHaveBeenCalledWith("id, front, back, source, generation_id, created_at, updated_at", {
        count: "exact",
      });
      expect(mockEqUser).toHaveBeenCalledWith("user_id", "user123");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 19);
      expect(mockRange().eq).toHaveBeenCalledWith("source", "manual");
    });

    it("should throw error when Supabase query fails", async () => {
      const mockError = new Error("Database error");
      const mockResponse = {
        data: null,
        count: null,
        error: mockError,
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

      await expect(service.getFlashcards("user123", 1, 20)).rejects.toThrow("Failed to fetch flashcards");
    });
  });

  describe("createFlashcards", () => {
    const mockFlashcards = [
      {
        front: "Test front",
        back: "Test back",
        source: "manual" as const,
      },
    ];

    it("should create flashcards successfully", async () => {
      const mockResponse = {
        data: [{ ...mockFlashcards[0], id: 1 }],
        error: null,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      mockSupabase.from = mockFrom;

      const result = await service.createFlashcards(mockFlashcards, "user123");

      expect(mockFrom).toHaveBeenCalledWith("flashcards");
      expect(mockFrom().insert).toHaveBeenCalledWith([{ ...mockFlashcards[0], user_id: "user123" }]);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when no flashcards provided", async () => {
      await expect(service.createFlashcards([], "user123")).rejects.toThrow("No flashcards provided");
    });

    it("should throw error when no user ID provided", async () => {
      await expect(service.createFlashcards(mockFlashcards, "")).rejects.toThrow("User ID is required");
    });

    it("should throw error when Supabase insert fails", async () => {
      const mockError = new Error("Database error");
      const mockResponse = {
        data: null,
        error: mockError,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue(mockResponse),
        }),
      });

      mockSupabase.from = mockFrom;

      await expect(service.createFlashcards(mockFlashcards, "user123")).rejects.toThrow("Failed to create flashcards");
    });
  });
});

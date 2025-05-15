import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getErrorMessage, handleApiResponse } from "@/lib/api-error";

import { FlashcardModal } from "./FlashcardModal";
import { FlashcardPreviewModal } from "./FlashcardPreviewModal";
import { FlashcardsTable } from "./FlashcardsTable";
import { FlashcardsToolbar } from "./FlashcardsToolbar";
import { PaginationControls } from "./PaginationControls";

import type { FlashcardDto, FlashcardsListResponseDto, PaginationDto, Source, UpdateFlashcardCommand } from "@/types";
export function FlashcardsView() {
  // State management
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filter, setFilter] = useState<Source>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCard, setSelectedCard] = useState<FlashcardDto | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<FlashcardDto | undefined>();

  // API integration
  const fetchFlashcards = async (page: number, source: Source) => {
    setIsLoading(true);
    try {
      const sourceParam = source === "all" ? "" : `&source=${source}`;
      const response = await fetch(`/api/flashcards?page=${page}&limit=10${sourceParam}`);
      const data = (await handleApiResponse(response)) as FlashcardsListResponseDto;
      setFlashcards(data.data);
      setPagination(data.pagination);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const createFlashcard = async (front: string, back: string) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: [{ front, back, source: "manual" }],
        }),
      });
      await handleApiResponse(response);
      toast.success("Flashcard created successfully");
      fetchFlashcards(pagination.page, filter);
      setModalOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const updateFlashcard = async (id: number, data: UpdateFlashcardCommand) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await handleApiResponse(response);
      toast.success("Flashcard updated successfully");
      fetchFlashcards(pagination.page, filter);
      setModalOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteFlashcard = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });
      if (response.status !== 204) {
        await handleApiResponse(response);
      }
      toast.success("Flashcard deleted successfully");
      fetchFlashcards(pagination.page, filter);
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  // Event handlers
  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedCard(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (flashcard: FlashcardDto) => {
    setModalMode("edit");
    setSelectedCard(flashcard);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFilterChange = (newFilter: Source) => {
    setFilter(newFilter);
    fetchFlashcards(1, newFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchFlashcards(newPage, filter);
  };

  const handleGenerateAI = () => {
    window.location.href = "/generate";
  };

  const handleModalSubmit = async (data: { front: string; back: string }) => {
    if (modalMode === "create") {
      await createFlashcard(data.front, data.back);
    } else if (selectedCard) {
      await updateFlashcard(selectedCard.id, data);
    }
  };

  const handlePreviewClick = (flashcard: FlashcardDto) => {
    setPreviewCard(flashcard);
    setPreviewModalOpen(true);
  };

  // Initial load
  useEffect(() => {
    fetchFlashcards(1, filter);
  }, []);

  return (
    <div className="space-y-6">
      <FlashcardsToolbar
        currentFilter={filter}
        onCreateClick={handleCreateClick}
        onGenerateAI={handleGenerateAI}
        onFilterChange={handleFilterChange}
      />
      {isLoading && <div className="text-center">Loading...</div>}
      {!isLoading && (
        <>
          <FlashcardsTable
            data={flashcards}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onPreview={handlePreviewClick}
          />
          <div className="mt-4 flex justify-center">
            <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </>
      )}
      <FlashcardModal
        isOpen={modalOpen}
        mode={modalMode}
        initialData={selectedCard}
        onSubmit={handleModalSubmit}
        onClose={() => setModalOpen(false)}
      />
      {previewCard && (
        <FlashcardPreviewModal
          isOpen={previewModalOpen}
          flashcard={previewCard}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewCard(undefined);
          }}
        />
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the flashcard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => cardToDelete && deleteFlashcard(cardToDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

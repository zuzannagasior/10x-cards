import { FlashcardListItem } from "./FlashcardListItem";

import type { FlashcardViewModel } from "../types";

interface FlashcardsListProps {
  flashcards: FlashcardViewModel[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
}

export function FlashcardsList({ flashcards, onAccept, onReject, onEdit }: FlashcardsListProps) {
  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Generated Flashcards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((flashcard, index) => (
          <FlashcardListItem
            key={index}
            flashcard={flashcard}
            onAccept={() => onAccept(index)}
            onReject={() => onReject(index)}
            onEdit={(front: string, back: string) => onEdit(index, front, back)}
          />
        ))}
      </div>
    </div>
  );
}

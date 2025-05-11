import type { CreateFlashcardCommand, FlashcardViewModel } from "../types";

import { Button } from "@/components/ui/button";

interface GlobalActionsProps {
  flashcards: FlashcardViewModel[];
  generationId: number;
  onSave: (flashcards: CreateFlashcardCommand[]) => Promise<void>;
  disabled?: boolean;
}

export function GlobalActions({ flashcards, generationId, onSave, disabled }: GlobalActionsProps) {
  const handleSaveAll = async () => {
    const commands: CreateFlashcardCommand[] = flashcards.map((flashcard) => ({
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.edited ? "ai-edited" : "ai",
      generation_id: generationId,
    }));

    await onSave(commands);
  };

  const handleSaveAccepted = async () => {
    const acceptedFlashcards = flashcards.filter((f) => f.accepted);
    const commands: CreateFlashcardCommand[] = acceptedFlashcards.map((flashcard) => ({
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.edited ? "ai-edited" : "ai",
      generation_id: generationId,
    }));

    await onSave(commands);
  };

  const hasAccepted = flashcards.some((f) => f.accepted);

  return (
    <div className="flex justify-end gap-2">
      <Button
        onClick={handleSaveAccepted}
        disabled={disabled || !hasAccepted}
        variant="outline"
        size="lg"
        data-testid="save-accepted-flashcards-button"
      >
        Save Accepted
      </Button>
      <Button onClick={handleSaveAll} disabled={disabled || flashcards.length === 0} size="lg">
        Save All
      </Button>
    </div>
  );
}

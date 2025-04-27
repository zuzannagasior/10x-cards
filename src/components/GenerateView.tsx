import type {
  CreateFlashcardCommand,
  CreateGenerationSessionCommand,
  CreateGenerationSessionResponseDto,
  FlashcardViewModel,
} from "../types";
import { useState } from "react";
import { toast } from "sonner";

import { FlashcardsList } from "@/components/FlashcardsList";
import { GlobalActions } from "@/components/GlobalActions";
import { TextInput } from "@/components/TextInput";
import { Button } from "@/components/ui/button";
import { getErrorMessage, handleApiResponse } from "@/lib/api-error";

export function GenerateView() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardViewModel[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const validateText = (text: string): boolean => {
    if (text.length < 1000) {
      setValidationError("Text must be at least 1000 characters long");
      return false;
    }
    if (text.length > 10000) {
      setValidationError("Text cannot be longer than 10000 characters");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    validateText(newText);
  };

  const handleGenerate = async () => {
    if (!validateText(text)) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text } as CreateGenerationSessionCommand),
      });

      const data = (await handleApiResponse(response)) as CreateGenerationSessionResponseDto;
      const newFlashcards: FlashcardViewModel[] = data.flashcards_proposals.map((proposal) => ({
        ...proposal,
        accepted: false,
        edited: false,
      }));
      setFlashcardProposals(newFlashcards);
      setGenerationId(data.generation_session.id);
      toast.success("Flashcards generated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = (index: number) => {
    setFlashcardProposals((prev) => prev.map((card, i) => (i === index ? { ...card, accepted: true } : card)));
  };

  const handleReject = (index: number) => {
    setFlashcardProposals((prev) => prev.map((card, i) => (i === index ? { ...card, accepted: false } : card)));
  };

  const handleEdit = (index: number, front: string, back: string) => {
    setFlashcardProposals((prev) =>
      prev.map((card, i) => (i === index ? { ...card, front, back, edited: true } : card))
    );
  };

  const handleSaveFlashcards = async (flashcards: CreateFlashcardCommand[]) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcards }),
      });

      await handleApiResponse(response);
      toast.success("Flashcards saved successfully");
      setFlashcardProposals([]);
      setText("");
      setGenerationId(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TextInput value={text} onChange={handleTextChange} error={validationError} disabled={isGenerating} />
      <div className="flex justify-end">
        <Button onClick={handleGenerate} disabled={!text || !!validationError || isGenerating}>
          {isGenerating ? "Generating..." : "Generate Flashcards"}
        </Button>
      </div>
      {flashcardProposals.length > 0 && generationId && (
        <>
          <FlashcardsList
            flashcards={flashcardProposals}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
          />
          <GlobalActions
            flashcards={flashcardProposals}
            generationId={generationId}
            onSave={handleSaveFlashcards}
            disabled={isSaving}
          />
        </>
      )}
    </div>
  );
}

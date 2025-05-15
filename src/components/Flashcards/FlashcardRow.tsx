import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { FlashcardDto } from "@/types";

interface FlashcardRowProps {
  flashcard: FlashcardDto;
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
  onPreview: (flashcard: FlashcardDto) => void;
}

export function FlashcardRow({ flashcard, onEdit, onDelete, onPreview }: FlashcardRowProps) {
  const getSourceLabel = (source: string) => {
    switch (source) {
      case "manual":
        return "Manual";
      case "ai":
        return "AI Generated";
      case "ai-edited":
        return "AI Edited";
      default:
        return source;
    }
  };

  const getSourceVariant = (source: string): "default" | "secondary" | "outline" => {
    switch (source) {
      case "manual":
        return "default";
      case "ai":
        return "secondary";
      case "ai-edited":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle max-w-[300px]">
        <div className="line-clamp-2">{flashcard.front}</div>
      </td>
      <td className="p-4 align-middle max-w-[300px]">
        <div className="line-clamp-2">{flashcard.back}</div>
      </td>
      <td className="p-4 align-middle">
        <Badge variant={getSourceVariant(flashcard.source)}>{getSourceLabel(flashcard.source)}</Badge>
      </td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onPreview(flashcard)}>
            Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(flashcard)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(flashcard.id)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { FlashcardDto } from "@/types";

interface FlashcardPreviewModalProps {
  isOpen: boolean;
  flashcard: FlashcardDto;
  onClose: () => void;
}

export function FlashcardPreviewModal({ isOpen, flashcard, onClose }: FlashcardPreviewModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Flashcard Preview</span>
            <Badge variant={getSourceVariant(flashcard.source)}>{getSourceLabel(flashcard.source)}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent>
              <div className="font-medium text-muted-foreground mb-2">Front</div>
              <div className="text-lg">{flashcard.front}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="font-medium text-muted-foreground mb-2">Back</div>
              <div className="text-lg">{flashcard.back}</div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { FlashcardViewModel } from "../types";
interface FlashcardListItemProps {
  flashcard: FlashcardViewModel;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (front: string, back: string) => void;
}

export function FlashcardListItem({ flashcard, onAccept, onReject, onEdit }: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  const handleSave = () => {
    onEdit(editedFront, editedBack);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setIsEditing(false);
  };

  return (
    <>
      <Card className={cn("flex flex-row justify-start gap-0", flashcard.accepted && "border-green-500 bg-green-50")}>
        <CardAction className="flex flex-col gap-2 pl-6">
          <Button
            onClick={onAccept}
            variant={flashcard.accepted ? "outline" : "default"}
            disabled={flashcard.accepted}
            size="icon"
            className="w-10 h-10"
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            disabled={flashcard.accepted}
            size="icon"
            className="w-10 h-10"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {flashcard.accepted && (
            <Button onClick={onReject} variant="destructive" size="icon" className="w-10 h-10">
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </CardAction>
        <div className="flex-1">
          <CardHeader>
            <div className="font-medium">Front</div>
            <div className="mt-1">{flashcard.front}</div>
          </CardHeader>
          <CardContent>
            <div className="font-medium">Back</div>
            <div className="mt-1">{flashcard.back}</div>
          </CardContent>
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                maxLength={200}
              />
              <p className="text-sm text-gray-500">{editedFront.length} / 200 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back</Label>
              <Textarea id="back" value={editedBack} onChange={(e) => setEditedBack(e.target.value)} maxLength={500} />
              <p className="text-sm text-gray-500">{editedBack.length} / 500 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!editedFront || !editedBack}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

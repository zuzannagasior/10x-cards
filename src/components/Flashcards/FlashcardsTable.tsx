import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { FlashcardRow } from "./FlashcardRow";

import type { FlashcardDto } from "@/types";
interface FlashcardsTableProps {
  data: FlashcardDto[];
  onEdit: (flashcard: FlashcardDto) => void;
  onDelete: (id: number) => void;
  onPreview: (flashcard: FlashcardDto) => void;
}

export function FlashcardsTable({ data, onEdit, onDelete, onPreview }: FlashcardsTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No flashcards found. Create your first flashcard or generate some using AI!
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full md:w-auto">Front</TableHead>
            <TableHead className="hidden md:table-cell">Back</TableHead>
            <TableHead className="whitespace-nowrap">Source</TableHead>
            <TableHead className="w-[60px] md:w-[180px] whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((flashcard) => (
            <FlashcardRow
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Source } from "@/types";

interface FlashcardsToolbarProps {
  currentFilter: Source;
  onCreateClick: () => void;
  onGenerateAI: () => void;
  onFilterChange: (source: Source) => void;
}

export function FlashcardsToolbar({
  currentFilter,
  onCreateClick,
  onGenerateAI,
  onFilterChange,
}: FlashcardsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Button onClick={onCreateClick} variant="default">
          New Flashcard
        </Button>
        <Button onClick={onGenerateAI} variant="outline">
          Generate with AI
        </Button>
      </div>
      <Select value={currentFilter} onValueChange={(value: string) => onFilterChange(value as Source)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="ai">AI Generated</SelectItem>
          <SelectItem value="ai-edited">AI Edited</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

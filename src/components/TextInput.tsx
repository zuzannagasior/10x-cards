import type { ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function TextInput({ value, onChange, error, disabled }: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="text-input">Enter your text (1,000-10,000 characters)</Label>
      <Textarea
        id="text-input"
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        disabled={disabled}
        className={`min-h-[200px] ${error ? "border-red-500" : ""}`}
        placeholder="Paste your text here..."
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-sm text-gray-500">Characters: {value.length} / 10,000</p>
    </div>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

import type { FlashcardDto } from "@/types";
const flashcardSchema = z.object({
  front: z.string().min(1, "Front is required").max(200, "Front cannot be longer than 200 characters"),
  back: z.string().min(1, "Back is required").max(500, "Back cannot be longer than 500 characters"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface FlashcardModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: FlashcardDto;
  onSubmit: (data: FlashcardFormData) => void;
  onClose: () => void;
}

export function FlashcardModal({ isOpen, mode, initialData, onSubmit, onClose }: FlashcardModalProps) {
  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  // Reset form and set initial values when modal is opened or mode/initialData changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        form.reset({
          front: initialData.front,
          back: initialData.back,
        });
      } else {
        form.reset({
          front: "",
          back: "",
        });
      }
    }
  }, [isOpen, mode, initialData, form]);

  const handleSubmit = (data: FlashcardFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Flashcard" : "Edit Flashcard"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Front</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the front side text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Back</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the back side text" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Create" : "Save Changes"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

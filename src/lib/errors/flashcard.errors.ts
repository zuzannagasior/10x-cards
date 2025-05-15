export class FlashcardError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "FlashcardError";
  }
}

export class FlashcardNotFoundError extends FlashcardError {
  constructor(id: number) {
    super(`Flashcard with ID ${id} not found`, "FLASHCARD_NOT_FOUND");
    this.name = "FlashcardNotFoundError";
  }
}

export class FlashcardForbiddenError extends FlashcardError {
  constructor(id: number) {
    super(`Access to flashcard ${id} forbidden`, "FLASHCARD_FORBIDDEN");
    this.name = "FlashcardForbiddenError";
  }
}

export class FlashcardOperationError extends FlashcardError {
  constructor(operation: string, details?: string) {
    super(`Failed to ${operation} flashcard${details ? `: ${details}` : ""}`, "FLASHCARD_OPERATION_FAILED");
    this.name = "FlashcardOperationError";
  }
}

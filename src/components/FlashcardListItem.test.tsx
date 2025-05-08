import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FlashcardListItem } from "./FlashcardListItem";

import type { FlashcardViewModel } from "../types";
// Mock sample flashcard data
const mockFlashcard: FlashcardViewModel = {
  front: "What is React?",
  back: "A JavaScript library for building user interfaces",
  accepted: false,
  edited: false,
};

const acceptedMockFlashcard: FlashcardViewModel = {
  ...mockFlashcard,
  accepted: true,
};

describe("FlashcardListItem Component", () => {
  // Setup mock functions
  const onAccept = vi.fn();
  const onReject = vi.fn();
  const onEdit = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correctly with flashcard content", () => {
    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Verify content is displayed correctly
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText(mockFlashcard.front)).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();

    // Verify buttons - znajdź przyciski przez role i filtruj po zawartości SVG
    const buttons = screen.getAllByRole("button");
    const acceptButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-check']"));
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));

    expect(acceptButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();

    // Reject button should not be visible for non-accepted cards
    const rejectButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-x']"));
    expect(rejectButton).toBeUndefined();
  });

  it("applies special styling when flashcard is accepted", () => {
    render(
      <FlashcardListItem flashcard={acceptedMockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />
    );

    // Check for green styling classes
    const card = screen.getByText(acceptedMockFlashcard.front).closest(".flex");
    expect(card).toHaveClass("border-green-500");
    expect(card).toHaveClass("bg-green-50");

    // Verify reject button is visible for accepted cards
    const buttons = screen.getAllByRole("button");
    const rejectButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-x']"));
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("w-10");
  });

  it("calls onAccept when accept button is clicked", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Click accept button
    const buttons = screen.getAllByRole("button");
    const acceptButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-check']"));
    if (!acceptButton) {
      throw new Error("Accept button not found");
    }
    await user.click(acceptButton);

    // Verify callback was called
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onReject when reject button is clicked on accepted flashcard", async () => {
    const user = userEvent.setup();

    render(
      <FlashcardListItem flashcard={acceptedMockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />
    );

    // Click reject button
    const buttons = screen.getAllByRole("button");
    const rejectButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-x']"));
    if (!rejectButton) {
      throw new Error("Reject button not found");
    }
    await user.click(rejectButton);

    // Verify callback was called
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("opens edit dialog when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Initially dialog should not be visible
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click edit button
    const buttons = screen.getAllByRole("button");
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!editButton) {
      throw new Error("Edit button not found");
    }
    await user.click(editButton);

    // Dialog should now be visible
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Check dialog content
    expect(within(dialog).getByText("Edit Flashcard")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Front")).toHaveValue(mockFlashcard.front);
    expect(within(dialog).getByLabelText("Back")).toHaveValue(mockFlashcard.back);
  });

  it("disables Save button when form fields are empty", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Open edit dialog
    const buttons = screen.getAllByRole("button");
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!editButton) {
      throw new Error("Edit button not found");
    }
    await user.click(editButton);

    const dialog = screen.getByRole("dialog");
    const frontTextarea = within(dialog).getByLabelText("Front");
    const saveButton = within(dialog).getByRole("button", { name: /save/i });

    // Initial state - Save button should be enabled
    expect(saveButton).not.toBeDisabled();

    // Clear the front textarea
    await user.clear(frontTextarea);

    // Save button should now be disabled
    expect(saveButton).toBeDisabled();
  });

  it("calls onEdit with updated values when Save is clicked", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Open edit dialog
    const buttons = screen.getAllByRole("button");
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!editButton) {
      throw new Error("Edit button not found");
    }
    await user.click(editButton);

    const dialog = screen.getByRole("dialog");
    const frontTextarea = within(dialog).getByLabelText("Front");
    const backTextarea = within(dialog).getByLabelText("Back");
    const saveButton = within(dialog).getByRole("button", { name: /save/i });

    // Update textarea values
    await user.clear(frontTextarea);
    await user.clear(backTextarea);
    await user.type(frontTextarea, "Updated front text");
    await user.type(backTextarea, "Updated back text");

    // Submit form
    await user.click(saveButton);

    // Verify callback was called with updated values
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith("Updated front text", "Updated back text");

    // Dialog should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resets form values when Cancel is clicked", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Open edit dialog
    const buttons = screen.getAllByRole("button");
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!editButton) {
      throw new Error("Edit button not found");
    }
    await user.click(editButton);

    const dialog = screen.getByRole("dialog");
    const frontTextarea = within(dialog).getByLabelText("Front");
    const backTextarea = within(dialog).getByLabelText("Back");
    const cancelButton = within(dialog).getByRole("button", { name: /cancel/i });

    // Update textarea values
    await user.clear(frontTextarea);
    await user.clear(backTextarea);
    await user.type(frontTextarea, "Changed front text");
    await user.type(backTextarea, "Changed back text");

    // Click cancel
    await user.click(cancelButton);

    // Dialog should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Reopen dialog to check values were reset
    const newButtons = screen.getAllByRole("button");
    const newEditButton = newButtons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!newEditButton) {
      throw new Error("Edit button not found after closing dialog");
    }
    await user.click(newEditButton);

    const reopenedDialog = screen.getByRole("dialog");
    const reopenedFrontTextarea = within(reopenedDialog).getByLabelText("Front");
    const reopenedBackTextarea = within(reopenedDialog).getByLabelText("Back");

    // Values should be back to original
    expect(reopenedFrontTextarea).toHaveValue(mockFlashcard.front);
    expect(reopenedBackTextarea).toHaveValue(mockFlashcard.back);
  });

  it("displays character count for front and back fields", async () => {
    const user = userEvent.setup();

    render(<FlashcardListItem flashcard={mockFlashcard} onAccept={onAccept} onReject={onReject} onEdit={onEdit} />);

    // Open edit dialog
    const buttons = screen.getAllByRole("button");
    const editButton = buttons.find((btn) => btn.querySelector("svg[class*='lucide-pencil']"));
    if (!editButton) {
      throw new Error("Edit button not found");
    }
    await user.click(editButton);

    const dialog = screen.getByRole("dialog");
    const frontTextarea = within(dialog).getByLabelText("Front");

    // Check initial character count
    const frontLength = mockFlashcard.front.length;
    expect(screen.getByText(`${frontLength} / 200 characters`)).toBeInTheDocument();

    // Update text and check count is updated
    await user.clear(frontTextarea);
    await user.type(frontTextarea, "New");

    expect(screen.getByText("3 / 200 characters")).toBeInTheDocument();
  });
});

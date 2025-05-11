import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderActionsProps {
  userEmail: string;
}

export function HeaderActions({ userEmail }: HeaderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to logout");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <div className="border-border bg-card px-4 py-3">
            <div className="text-sm font-medium text-muted-foreground">{userEmail}</div>
          </div>
          <div className="px-2 py-3 space-y-1">
            <a
              href="/generate"
              className="block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
              onClick={() => setIsOpen(false)}
            >
              Generate
            </a>
            <a
              href="/flashcards"
              className="block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
              onClick={() => setIsOpen(false)}
            >
              My Flashcards
            </a>
            <a
              href="/study"
              className="block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
              onClick={() => setIsOpen(false)}
            >
              Study
            </a>
            <a
              href="/profile"
              className="block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/60"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </a>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <DropdownMenu data-testid="user-menu">
        <DropdownMenuTrigger asChild className="hidden md:inline-flex">
          <Button variant="ghost" className="text-sm">
            {userEmail}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href="/profile" className="w-full">
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

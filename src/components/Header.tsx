import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
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

      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="text-xl font-bold">
              10xCards
            </a>
            <nav className="flex items-center gap-4">
              <a href="/generate" className="text-sm font-medium">
                Generate
              </a>
              <a href="/flashcards" className="text-sm font-medium">
                My Flashcards
              </a>
              <a href="/study" className="text-sm font-medium">
                Study
              </a>
            </nav>
          </div>

          {userEmail && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm">
                  {userEmail}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="/settings">Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

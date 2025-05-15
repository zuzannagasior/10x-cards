import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type { PaginationDto } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  // Calculate the range of pages to show
  const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  let pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    // Show all pages if there are 7 or fewer
    pages = range(1, totalPages);
  } else {
    // Complex pagination with ellipsis
    if (page <= 3) {
      pages = [...range(1, 4), "ellipsis", totalPages];
    } else if (page >= totalPages - 2) {
      pages = [1, "ellipsis", ...range(totalPages - 3, totalPages)];
    } else {
      pages = [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((pageNum, i) =>
          pageNum === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

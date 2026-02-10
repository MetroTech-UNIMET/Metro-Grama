import React, { memo, useMemo } from 'react';
import {
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PaginationDynamicItemsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxShowingPages?: number; // threshold to start using ellipsis (default 10)
}

// FIXME - No funciona bien como numeros pares, hayu que definir bien que sifnifica maxShowingPages
// porque siempre muestra el inicio y final
/**
 * Renders pagination items with optional ellipsis when pages exceed maxShowingPages.
 * Always shows first and last pages, current page, and immediate neighbors.
 * Adds ellipsis only where there is a gap larger than 1.
 */
export const PaginationDynamicItems = memo(function PaginationDynamicItems({
  currentPage,
  totalPages,
  onPageChange,
  maxShowingPages = 10,
}: PaginationDynamicItemsProps) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];

    // If total pages small enough, show all pages
    if (totalPages <= maxShowingPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Windowed pages around current, aiming to center current
    // Reserve 2 spots for first and last, rest is window size
    const windowSize = Math.max(3, maxShowingPages - 2);
    const halfWindow = Math.floor(windowSize / 2);

    let start = currentPage - halfWindow;
    let end = currentPage + halfWindow;

    // Adjust when near start
    if (start < 2) {
      end += 2 - start; // shift right
      start = 2;
    }

    // Adjust when near end
    if (end > totalPages - 1) {
      const overshoot = end - (totalPages - 1);
      start = Math.max(2, start - overshoot);
      end = totalPages - 1;
    }

    const pages: number[] = [1];
    for (let p = start; p <= end; p++) pages.push(p);
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages, maxShowingPages]);

  if (totalPages <= 1) return null;

  return (
    <>
      {pageNumbers.map((page, index) => {
        const next = pageNumbers[index + 1];
        const showEllipsis = next && next - page > 1;

        return (
          <React.Fragment key={page}>
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
            {showEllipsis && (
              <PaginationItem key={`ellipsis-${page}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
});


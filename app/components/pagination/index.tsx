'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showRange?: boolean;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showRange = true,
  loading = false
}) => {
  const getPageNumbers = () => {
    const windowSize = 11; // 5 each side + current

    if (totalPages <= windowSize + 2) {
      // Small enough to show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate window, always 11 wide
    let start = currentPage - 5;
    let end = currentPage + 5;

    // Near the start: shift excess right
    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    // Near the end: shift excess left
    if (end > totalPages) {
      start -= end - totalPages;
      end = totalPages;
    }

    // Clamp
    start = Math.max(1, start);
    end = Math.min(totalPages, end);

    const pages: (number | string)[] = [];

    // First page + ellipsis if window doesn't include it
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis-start');
    }

    // The window
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Last page + ellipsis if window doesn't include it
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis-end');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Page info */}
      {showRange && (
        <p className="text-sm text-[var(--color-warm-gray)] font-body">
          Page {currentPage} of {totalPages}
        </p>
      )}

      {/* Pagination controls */}
      <nav className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`
            flex items-center justify-center w-10 h-10 border transition-all duration-200
            ${currentPage === 1 || loading
              ? 'border-[var(--color-stone)] text-[var(--color-stone)] cursor-not-allowed'
              : 'border-[var(--color-stone)] text-[var(--color-charcoal)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span key={page} className="flex items-center justify-center w-10 h-10 text-[var(--color-warm-gray)]">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`
                flex items-center justify-center w-10 h-10 text-sm font-body transition-all duration-200
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary)]'
                  : 'border border-[var(--color-stone)] text-[var(--color-charcoal)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }
                ${loading ? 'cursor-not-allowed opacity-50' : ''}
              `}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`
            flex items-center justify-center w-10 h-10 border transition-all duration-200
            ${currentPage === totalPages || loading
              ? 'border-[var(--color-stone)] text-[var(--color-stone)] cursor-not-allowed'
              : 'border-[var(--color-stone)] text-[var(--color-charcoal)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }
          `}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

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
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 4;
    const showEllipsisEnd = currentPage < totalPages - 3;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (showEllipsisStart) {
        pages.push('ellipsis-start');
      }

      const start = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
      const end = showEllipsisEnd ? Math.min(totalPages - 1, currentPage + 1) : totalPages - 1;

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (showEllipsisEnd) {
        pages.push('ellipsis-end');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
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

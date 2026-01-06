'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type Post } from '@/api/posts';

interface ListViewItemProps {
  item: Post;
  contentType: 'orations' | 'letters' | 'sayings';
  displayMode?: 'both' | 'english-only' | 'arabic-only';
}

const ListViewItem: React.FC<ListViewItemProps> = ({ 
  item, 
  contentType,
  displayMode = 'both'
}) => {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page');
  const currentSort = searchParams.get('sort');
  const currentSearch = searchParams.get('search');

  // Build return URL params
  const buildReturnParams = () => {
    const params = new URLSearchParams();
    if (currentPage) params.set('returnPage', currentPage);
    if (currentSort) params.set('returnSort', currentSort);
    if (currentSearch) params.set('returnSearch', currentSearch);
    return params.toString();
  };

  const returnParams = buildReturnParams();
  const detailUrl = `/${contentType}/details/${item.id}${returnParams ? `?${returnParams}` : ''}`;

  // Extract display number from sermon number (e.g., "1.5" -> 5)
  const getDisplayNumber = () => {
    if (!item.sermonNumber) return null;
    const parts = item.sermonNumber.split('.');
    return parts.length > 1 ? parts[1] : parts[0];
  };

  const displayNumber = getDisplayNumber();

  // Get first translation text for preview
  const getEnglishPreview = () => {
    if (item.translations && item.translations.length > 0) {
      const enTranslation = item.translations.find(t => t.type === 'en');
      if (enTranslation?.text) {
        return enTranslation.text.slice(0, 100) + (enTranslation.text.length > 100 ? '...' : '');
      }
    }
    return null;
  };

  // Get Arabic preview from title or first paragraph
  const getArabicPreview = () => {
    if (item.title) {
      const cleanTitle = item.title
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      return cleanTitle.slice(0, 80) + (cleanTitle.length > 80 ? '...' : '');
    }
    if (item.paragraphs && item.paragraphs.length > 0 && item.paragraphs[0].arabic) {
      const cleanArabic = item.paragraphs[0].arabic
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      return cleanArabic.slice(0, 80) + (cleanArabic.length > 80 ? '...' : '');
    }
    return null;
  };

  const englishPreview = getEnglishPreview();
  const arabicPreview = getArabicPreview();

  return (
    <Link 
      href={detailUrl}
      id={displayNumber ? `listing-${displayNumber}` : undefined}
      className="group block"
    >
      <div className="relative bg-white border border-[var(--color-stone)] hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300">
        {/* Corner accents on hover */}
        <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-4 group-hover:h-4 transition-all duration-300" />
        <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-4 group-hover:h-4 transition-all duration-300" />

        <div className="flex">
          {/* Number Badge */}
          {displayNumber && (
            <div className="flex-shrink-0 w-16 lg:w-20 bg-[var(--color-primary)] flex items-center justify-center">
              <span className="font-display text-xl lg:text-2xl text-white font-medium">
                {displayNumber}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex-grow p-5 lg:p-6 min-w-0">
            {/* Heading */}
            <h3 className="font-display text-lg lg:text-xl text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors duration-200 mb-2 line-clamp-2">
              {item.heading || 'Untitled'}
            </h3>

            {/* English Preview */}
            {(displayMode === 'both' || displayMode === 'english-only') && englishPreview && (
              <p className="font-body text-sm text-[var(--color-charcoal)] mb-2 line-clamp-2">
                {englishPreview}
              </p>
            )}

            {/* Arabic Preview */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && arabicPreview && (
              <p className="font-taha text-sm text-[var(--color-warm-gray)] line-clamp-1 text-right" dir="rtl">
                {arabicPreview}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex px-2 py-0.5 text-xs font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                  >
                    {tag.name}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs text-[var(--color-warm-gray)]">
                    +{item.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <div className="flex-shrink-0 flex items-center pr-4 lg:pr-6">
            <div className="w-8 h-8 flex items-center justify-center text-[var(--color-stone)] group-hover:text-[var(--color-primary)] transition-colors duration-200">
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListViewItem;

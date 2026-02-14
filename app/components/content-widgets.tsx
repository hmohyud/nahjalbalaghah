'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  BookOpen, ArrowRight, MoreHorizontal, FileText,
  Calendar, Loader2, Book, Hash
} from 'lucide-react';
import { type Post } from '@/api/posts';
import { Footnote } from '@/api/orations';
import { IndexItem } from '@/app/data/indexes';
import {
  parseTextReference,
  getContentTypeName,
  getTextRefTypeColor,
} from '@/app/utils/text-reference';
import { orationsApi, lettersApi, sayingsApi } from '@/api/posts';

// ============================================================================
// 1. ListViewItem (from app/components/list-view-item/index.tsx)
// ============================================================================

// Collapsible section for multi-paragraph content
interface CollapsibleSectionProps {
  number: string;
  arabic: string;
  english: string;
  displayMode: 'both' | 'english-only' | 'arabic-only';
  isEven: boolean;
  defaultOpen: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  number,
  arabic,
  english,
  displayMode,
  isEven,
  defaultOpen
}) => {
  const [isOpen, setIsOpen] = React.useState(true); // Always start expanded
  
  // Get a preview of the content for the collapsed state
  const getPreview = () => {
    if (displayMode === 'arabic-only') {
      return arabic ? arabic.slice(0, 60) + (arabic.length > 60 ? '...' : '') : '';
    }
    return english ? english.slice(0, 80) + (english.length > 80 ? '...' : '') : '';
  };

  return (
    <div
      className="collapsible-section"
      style={{ backgroundColor: isEven ? '#FFFFFF' : '#EDE8DF' }}
    >
      {/* Header - always visible, clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-section__header flex items-start gap-2 lg:gap-3 text-left"
      >
        <div className="flex-shrink-0 mt-0.5 flex items-center gap-1">
          {isOpen ? (
            <>
              <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--color-primary)]" />
              <span className="text-xs text-[var(--color-primary)] font-medium">Hide</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--color-warm-gray)]" />
              <span className="text-xs text-[var(--color-warm-gray)] font-medium">Show</span>
            </>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 lg:gap-3">
            {number && (
              <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-xs font-display text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                {number}
              </span>
            )}
            {!isOpen && (
              <span className="text-xs lg:text-sm text-[var(--color-warm-gray)] font-body truncate">
                {getPreview()}
              </span>
            )}
          </div>
        </div>
      </button>
      
      {/* Content - shown when expanded */}
      {isOpen && (
        <div className="collapsible-section__body">
          {/* Arabic text */}
          {(displayMode === 'both' || displayMode === 'arabic-only') && arabic && (
            <div className="collapsible-section__arabic-block mb-2 lg:mb-3">
              <p className="text-[var(--color-ink)] font-taha text-base lg:text-lg leading-loose whitespace-pre-wrap" dir="rtl">
                {arabic}
              </p>
            </div>
          )}
          
          {/* English text */}
          {(displayMode === 'both' || displayMode === 'english-only') && english && (
            <div className="collapsible-section__english-block">
              <p className="text-[var(--color-charcoal)] font-body text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                {english}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ListViewItemProps {
  item: Post;
  contentType: 'orations' | 'letters' | 'sayings';
  displayMode?: 'both' | 'english-only' | 'arabic-only';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ListViewItem: React.FC<ListViewItemProps> = ({ 
  item, 
  contentType,
  displayMode = 'both',
  isExpanded = false,
  onToggleExpand
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
  
  const contentTypeLabel = contentType === 'orations' ? 'Oration' : 
                           contentType === 'letters' ? 'Letter' : 'Saying';

  // Get first translation text for preview
  const getEnglishPreview = () => {
    if (item.translations && item.translations.length > 0) {
      const enTranslation = item.translations.find(t => t.type === 'en');
      if (enTranslation?.text) {
        // Shorter preview on mobile
        const maxLength = typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 100;
        return enTranslation.text.slice(0, maxLength) + (enTranslation.text.length > maxLength ? '...' : '');
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
      const maxLength = typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 80;
      return cleanTitle.slice(0, maxLength) + (cleanTitle.length > maxLength ? '...' : '');
    }
    if (item.paragraphs && item.paragraphs.length > 0 && item.paragraphs[0].arabic) {
      const cleanArabic = item.paragraphs[0].arabic
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      const maxLength = typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 80;
      return cleanArabic.slice(0, maxLength) + (cleanArabic.length > maxLength ? '...' : '');
    }
    return null;
  };

  const englishPreview = getEnglishPreview();
  const arabicPreview = getArabicPreview();

  // Get interleaved paragraphs (Arabic + English together for each section)
  const getInterleavedParagraphs = (): { number: string; arabic: string; english: string }[] => {
    const results: { number: string; arabic: string; english: string }[] = [];
    
    // First add item-level content if exists
    const itemArabic = item.title 
      ? item.title.replace(/<center>|<\/center>/gi, '').replace(/<span[^>]*>|<\/span>/gi, '').replace(/&nbsp;/gi, ' ').trim()
      : '';
    const itemEnglish = item.translations?.find(t => t.type === 'en')?.text || '';
    
    if (itemArabic || itemEnglish) {
      results.push({ 
        number: item.sermonNumber || '', 
        arabic: itemArabic, 
        english: itemEnglish 
      });
    }
    
    // Then get paragraph content
    if (item.paragraphs && item.paragraphs.length > 0) {
      const sortedParagraphs = [...item.paragraphs].sort((a, b) => {
        const parseNumber = (num: string) => num.split('.').map(n => parseInt(n, 10));
        const aNumbers = parseNumber(a.number || '0');
        const bNumbers = parseNumber(b.number || '0');
        for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
          const aNum = aNumbers[i] || 0;
          const bNum = bNumbers[i] || 0;
          if (aNum !== bNum) return aNum - bNum;
        }
        return 0;
      });
      
      for (const para of sortedParagraphs) {
        const paraArabic = para.arabic 
          ? para.arabic.replace(/<center>|<\/center>/gi, '').replace(/<span[^>]*>|<\/span>/gi, '').replace(/&nbsp;/gi, ' ').trim()
          : '';
        const paraEnglish = para.translations?.find((t: any) => t.type === 'en')?.text || '';
        
        if (paraArabic || paraEnglish) {
          results.push({
            number: para.number || '',
            arabic: paraArabic,
            english: paraEnglish
          });
        }
      }
    }
    
    return results;
  };

  const interleavedParagraphs = isExpanded ? getInterleavedParagraphs() : [];

  return (
    <div 
      id={displayNumber ? `listing-${displayNumber}` : undefined}
      className="group block"
    >
      <div className="list-item relative">
        {/* Corner accents on hover */}
        <div className="corner-accent-hover corner-accent-hover--top-left" />
        <div className="corner-accent-hover corner-accent-hover--bottom-right" />

        <div className="flex">
          {/* Number Badge */}
          {displayNumber && (
            <div className="list-item__number-badge flex items-center justify-center">
              <span className="list-item__number-text">
                {displayNumber}
              </span>
            </div>
          )}

          {/* Content - Links to detail page */}
          <Link 
            href={detailUrl}
            className="list-item__content-link flex-grow min-w-0"
          >
            {/* Heading */}
            <h3 className="list-item__heading line-clamp-2">
              {item.heading || 'Untitled'}
            </h3>

            {/* English Preview */}
            {(displayMode === 'both' || displayMode === 'english-only') && englishPreview && (
              <p className="font-body text-xs sm:text-sm text-[var(--color-charcoal)] mb-1 lg:mb-2 line-clamp-2">
                {englishPreview}
              </p>
            )}

            {/* Arabic Preview */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && arabicPreview && (
              <p className="font-taha text-xs sm:text-sm text-[var(--color-warm-gray)] line-clamp-1 text-right" dir="rtl">
                {arabicPreview}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 lg:gap-2 mt-2 lg:mt-3">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-xs font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                  >
                    {tag.name}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-[10px] lg:text-xs text-[var(--color-warm-gray)]">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Expand Button - Show/Hide text */}
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleExpand();
              }}
              className="list-item__expand-button flex flex-col items-center justify-center gap-0.5"
              aria-label={isExpanded ? 'Hide content' : 'Show content'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-primary)]" />
                  <span className="text-[10px] lg:text-xs font-medium text-[var(--color-primary)]">Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <span className="text-[10px] lg:text-xs font-medium text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] transition-colors">Show</span>
                </>
              )}
            </button>
          )}

          {/* Arrow indicator (only show if no expand button) */}
          {!onToggleExpand && (
            <div className="flex-shrink-0 flex items-center pr-3 lg:pr-6">
              <div className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-[var(--color-stone)] group-hover:text-[var(--color-primary)] transition-colors duration-200">
                <svg 
                  className="w-4 h-4 lg:w-5 lg:h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="list-item__expanded-content">
            {/* English Summary */}
            {(displayMode === 'both' || displayMode === 'english-only') && item.TocEnglish && (
              <div className="mb-4 lg:mb-6">
                <h4 className="list-item__summary-label">Summary</h4>
                <div className="list-item__summary-box">
                  <p className="text-[var(--color-charcoal)] font-body text-sm lg:text-base leading-relaxed">
                    {item.TocEnglish}
                  </p>
                </div>
              </div>
            )}
            
            {/* Arabic Summary */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && item.TocArabic && (
              <div className="mb-4 lg:mb-6">
                <h4 className="list-item__summary-label">ملخص</h4>
                <div className="list-item__arabic-summary-box">
                  <p className="text-[var(--color-ink)] font-taha text-lg lg:text-xl leading-loose" dir="rtl">
                    {item.TocArabic}
                  </p>
                </div>
              </div>
            )}

            {/* Full Text - Interleaved Arabic & English */}
            {interleavedParagraphs.length > 0 && (
              <div className="mb-4 lg:mb-6">
                {/* Single section (letters) - simpler display */}
                {interleavedParagraphs.length === 1 ? (
                  <div className="border border-[var(--color-stone)]">
                    <div className="p-3 lg:p-5">
                      {/* Arabic text */}
                      {(displayMode === 'both' || displayMode === 'arabic-only') && interleavedParagraphs[0].arabic && (
                        <div className="mb-3 lg:mb-4 p-3 lg:p-4 bg-[var(--color-parchment)]/30 border-r-2 border-[var(--color-primary)]">
                          <p className="text-[var(--color-ink)] font-taha text-base lg:text-lg leading-loose whitespace-pre-wrap" dir="rtl">
                            {interleavedParagraphs[0].arabic}
                          </p>
                        </div>
                      )}
                      
                      {/* English text */}
                      {(displayMode === 'both' || displayMode === 'english-only') && interleavedParagraphs[0].english && (
                        <div className="p-3 lg:p-4 bg-[var(--color-cream)]/50 border border-[var(--color-stone)]/50">
                          <p className="text-[var(--color-charcoal)] font-body text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                            {interleavedParagraphs[0].english}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Multi-section (orations) - collapsible sections with alternating colors */
                  <div className="border border-[var(--color-stone)]">
                    {interleavedParagraphs.map((para, idx) => (
                      <CollapsibleSection
                        key={idx}
                        number={para.number}
                        arabic={para.arabic}
                        english={para.english}
                        displayMode={displayMode}
                        isEven={idx % 2 === 0}
                        defaultOpen={idx === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Action Button - Only "Go to" button, TOC removed */}
            <div className="flex flex-wrap gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-[var(--color-stone)]">
              <Link
                href={detailUrl}
                className="btn-primary text-xs sm:text-sm"
              >
                <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
                Go to {contentTypeLabel}
                <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. Pagination (from app/components/pagination/index.tsx)
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showRange?: boolean;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
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
    <div className="pagination flex flex-col items-center gap-4">
      {/* Page info */}
      {showRange && (
        <p className="pagination__info">
          Page {currentPage} of {totalPages}
        </p>
      )}

      {/* Pagination controls */}
      <nav className="pagination__nav flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`pagination__button ${currentPage === 1 || loading ? 'cursor-not-allowed' : ''}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span key={page} className="pagination__ellipsis">
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
              className={`pagination__button ${isActive ? 'pagination__button--active' : ''} ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
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
          className={`pagination__button ${currentPage === totalPages || loading ? 'cursor-not-allowed' : ''}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

// ============================================================================
// 3. RangeSlider (from app/components/range-slider/index.tsx)
// ============================================================================

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = '',
}: RangeSliderProps) {
  const [minValue, setMinValue] = useState(value[0]);
  const [maxValue, setMaxValue] = useState(value[1]);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setMinValue(value[0]);
    setMaxValue(value[1]);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(newMin);
    onChange([newMin, maxValue]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(newMax);
    onChange([minValue, newMax]);
  };

  const minPos = ((minValue - min) / (max - min)) * 100;
  const maxPos = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className={`relative h-12 w-full ${className}`}>
      <div className="absolute top-1/2 h-1.5 w-full bg-gray-200 rounded-full -translate-y-1/2" />
      <motion.div
        className="absolute top-1/2 h-1.5 bg-[#43896B] rounded-full -translate-y-1/2"
        initial={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
        animate={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.div
        className={`absolute top-1/2 w-5 h-5 bg-[#43896B] rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 cursor-pointer ${
          isDragging === 'min' ? 'ring-2 ring-[#43896B] ring-opacity-50 scale-110' : ''
        }`}
        style={{ left: `${minPos}%` }}
        drag="x"
        dragConstraints={{ left: 0, right: maxPos }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => setIsDragging('min')}
        onDragEnd={() => setIsDragging(null)}
        onDrag={(_, info) => {
          const newPos = info.point.x;
          const sliderWidth = info.offset.x * (100 / minPos);
          const newMinPos = (newPos / sliderWidth) * 100;
          const newMinValue = Math.min(
            Math.round(min + (newMinPos / 100) * (max - min)),
            maxValue - step
          );
          setMinValue(newMinValue);
          onChange([newMinValue, maxValue]);
        }}
        whileHover={{ scale: 1.1 }}
      />
      <motion.div
        className={`absolute top-1/2 w-5 h-5 bg-[#43896B] rounded-full shadow-md -translate-y-1/2 -translate-x-1/2 cursor-pointer ${
          isDragging === 'max' ? 'ring-2 ring-[#43896B] ring-opacity-50 scale-110' : ''
        }`}
        style={{ left: `${maxPos}%` }}
        drag="x"
        dragConstraints={{ left: minPos, right: 100 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={() => setIsDragging('max')}
        onDragEnd={() => setIsDragging(null)}
        onDrag={(_, info) => {
          const newPos = info.point.x;
          const sliderWidth = info.offset.x * (100 / maxPos);
          const newMaxPos = (newPos / sliderWidth) * 100;
          const newMaxValue = Math.max(
            Math.round(min + (newMaxPos / 100) * (max - min)),
            minValue + step
          );
          setMaxValue(newMaxValue);
          onChange([minValue, newMaxValue]);
        }}
        whileHover={{ scale: 1.1 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
      {isDragging === 'min' && (
        <motion.div
          className="absolute px-2 py-1 bg-[#43896B] text-white text-xs rounded -translate-y-8 -translate-x-1/2"
          style={{ left: `${minPos}%` }}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: -8, opacity: 1 }}
          exit={{ y: -5, opacity: 0 }}
        >
          {minValue}
        </motion.div>
      )}
      {isDragging === 'max' && (
        <motion.div
          className="absolute px-2 py-1 bg-[#43896B] text-white text-xs rounded -translate-y-8 -translate-x-1/2"
          style={{ left: `${maxPos}%` }}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: -8, opacity: 1 }}
          exit={{ y: -5, opacity: 0 }}
        >
          {maxValue}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// 4. Timeline (from app/components/timeline/index.tsx)
// ============================================================================

interface TimelineProps {
  contentType: 'orations' | 'letters';
  title: string;
  items: Post[];
  loading?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ contentType, title, items, loading = false }) => {
  const [selectedItem, setSelectedItem] = useState<Post | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const contentTypeLabel = contentType === 'orations' ? 'Oration' : 'Letter';
  const Icon = contentType === 'orations' ? BookOpen : FileText;

  // Get display number from sermon number
  const getDisplayNumber = (sermonNumber: string | null): number => {
    if (!sermonNumber) return 0;
    const parts = sermonNumber.split('.');
    return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
  };

  // Sort items by their number
  const sortedItems = [...items].sort((a, b) => 
    getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber)
  );

  const visibleItems = sortedItems.slice(visibleRange.start, visibleRange.end);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 10;
    if (direction === 'left') {
      setVisibleRange(prev => ({
        start: Math.max(0, prev.start - step),
        end: Math.max(step, prev.end - step)
      }));
    } else {
      setVisibleRange(prev => ({
        start: Math.min(sortedItems.length - step, prev.start + step),
        end: Math.min(sortedItems.length, prev.end + step)
      }));
    }
  };

  const handleItemClick = (item: Post) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  // Get Arabic preview
  const getArabicPreview = (item: Post): string | null => {
    if (item.title) {
      const cleanTitle = item.title
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      return cleanTitle.slice(0, 100) + (cleanTitle.length > 100 ? '...' : '');
    }
    return null;
  };

  // Get English preview
  const getEnglishPreview = (item: Post): string | null => {
    if (item.translations && item.translations.length > 0) {
      const enTranslation = item.translations.find(t => t.type === 'en');
      if (enTranslation?.text) {
        return enTranslation.text.slice(0, 150) + (enTranslation.text.length > 150 ? '...' : '');
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-3" />
          <p className="text-[var(--color-warm-gray)] font-body">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="font-display text-xl lg:text-2xl text-[var(--color-ink)]">{title}</h2>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            {sortedItems.length} {contentType} • Click on a point to see details
          </p>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={visibleRange.start === 0}
            className="p-2 border border-[var(--color-stone)] bg-white hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-charcoal)]" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={visibleRange.end >= sortedItems.length}
            className="p-2 border border-[var(--color-stone)] bg-white hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-charcoal)]" />
          </button>
        </div>
      </div>

      {/* Range Indicator */}
      <div className="mb-4 text-xs text-[var(--color-warm-gray)] font-body">
        Showing {contentTypeLabel}s {visibleRange.start + 1} - {Math.min(visibleRange.end, sortedItems.length)} of {sortedItems.length}
      </div>

      {/* Timeline Track */}
      <div className="relative" ref={timelineRef}>
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gradient-to-r from-[var(--color-stone)] via-[var(--color-primary)] to-[var(--color-stone)] transform -translate-y-1/2" />
        
        {/* Timeline Points */}
        <div className="relative flex justify-between items-center py-8 overflow-x-auto">
          {visibleItems.map((item, index) => {
            const displayNum = getDisplayNumber(item.sermonNumber);
            const isSelected = selectedItem?.id === item.id;
            
            return (
              <div 
                key={item.id}
                className="flex flex-col items-center flex-shrink-0 px-2 lg:px-3"
                style={{ minWidth: '60px' }}
              >
                {/* Number Label (top) */}
                <div className={`mb-3 text-xs lg:text-sm font-display transition-colors ${
                  isSelected ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-warm-gray)]'
                }`}>
                  {displayNum}
                </div>
                
                {/* Timeline Point */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`relative w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] scale-125 shadow-lg' 
                      : 'bg-white border-[var(--color-stone)] hover:border-[var(--color-primary)] hover:scale-110'
                  }`}
                  aria-label={`View ${contentTypeLabel} ${displayNum}`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-ping opacity-30" />
                  )}
                </button>
                
                {/* Connector Line (bottom) */}
                <div className={`mt-3 w-[1px] h-4 transition-colors ${
                  isSelected ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-stone)]'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="mt-6 lg:mt-8 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 lg:w-6 lg:h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 lg:w-6 lg:h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />
          
          <div className="bg-white border border-[var(--color-stone)] p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[var(--color-primary)] flex items-center justify-center">
                  <span className="font-display text-lg lg:text-xl text-white">
                    {getDisplayNumber(selectedItem.sermonNumber)}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg lg:text-xl text-[var(--color-ink)]">
                    {selectedItem.heading || `${contentTypeLabel} ${getDisplayNumber(selectedItem.sermonNumber)}`}
                  </h3>
                  {selectedItem.sermonNumber && (
                    <p className="text-xs lg:text-sm text-[var(--color-warm-gray)]">
                      Section {selectedItem.sermonNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <Link
                href={`/${contentType}/details/${selectedItem.id}`}
                className="btn-primary text-xs lg:text-sm flex-shrink-0"
              >
                <Icon className="w-4 h-4" />
                Go to {contentTypeLabel}
              </Link>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              {/* Arabic Preview */}
              {getArabicPreview(selectedItem) && (
                <div className="bg-[var(--color-parchment)] p-3 lg:p-4 border-r-4 border-[var(--color-accent)]">
                  <p className="font-taha text-base lg:text-lg leading-loose text-[var(--color-ink)]" dir="rtl">
                    {getArabicPreview(selectedItem)}
                  </p>
                </div>
              )}
              
              {/* English Preview */}
              {getEnglishPreview(selectedItem) && (
                <div className="bg-[var(--color-cream)] p-3 lg:p-4 border border-[var(--color-stone)]">
                  <p className="font-body text-sm lg:text-base leading-relaxed text-[var(--color-charcoal)]">
                    {getEnglishPreview(selectedItem)}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-stone)]">
                {selectedItem.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex px-2 py-0.5 text-xs font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jump to Number Input */}
      <div className="mt-6 lg:mt-8 flex items-center gap-3">
        <label className="text-sm text-[var(--color-warm-gray)] font-body">Jump to {contentTypeLabel}:</label>
        <input
          type="number"
          min="1"
          max={sortedItems.length}
          placeholder="#"
          className="w-20 px-3 py-2 text-sm border border-[var(--color-stone)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = parseInt((e.target as HTMLInputElement).value, 10);
              if (target >= 1 && target <= sortedItems.length) {
                const itemIndex = sortedItems.findIndex(item => getDisplayNumber(item.sermonNumber) === target);
                if (itemIndex !== -1) {
                  const newStart = Math.max(0, itemIndex - 5);
                  const newEnd = Math.min(sortedItems.length, newStart + 20);
                  setVisibleRange({ start: newStart, end: newEnd });
                  setSelectedItem(sortedItems[itemIndex]);
                }
              }
            }
          }}
        />
        <span className="text-xs text-[var(--color-warm-gray)]">Press Enter</span>
      </div>
    </div>
  );
};

// ============================================================================
// 5. AlphabetChips (from app/components/alphabet-chips/index.tsx)
// ============================================================================

interface AlphabetChipsProps {
    selectedLetter: string;
    onSelectLetter: (letter: string) => void;
    language: 'English' | 'Arabic';
}

const ENGLISH_ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const ARABIC_ALPHABET = [
    'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
    'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

export function AlphabetChips({ selectedLetter, onSelectLetter, language }: AlphabetChipsProps) {
    const letters = language === 'English' ? ENGLISH_ALPHABET : ARABIC_ALPHABET;

    return (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-6 justify-center px-2 sm:px-0" dir={language === 'Arabic' ? 'rtl' : 'ltr'}>
            <button
                onClick={() => onSelectLetter('')}
                className={`h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold transition-all border flex items-center justify-center ${!selectedLetter
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-[var(--color-cream)] text-[var(--color-charcoal)] border-[var(--color-stone)] hover:bg-[var(--color-stone)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
            >
                All
            </button>
            {letters.map((letter) => (
                <button
                    key={letter}
                    onClick={() => onSelectLetter(letter)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-semibold transition-all border flex items-center justify-center ${selectedLetter === letter
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] scale-105"
                            : "bg-[var(--color-cream)] text-[var(--color-charcoal)] border-[var(--color-stone)] hover:bg-[var(--color-stone)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        }`}
                >
                    {letter}
                </button>
            ))}
        </div>
    );
}

// ============================================================================
// 6. FootnoteTooltip (from app/components/footnote-tooltip/index.tsx)
// ============================================================================

interface FootnoteTooltipProps {
  children: React.ReactNode;
  footnote: Footnote;
  className?: string;
  matchedLanguage?: 'english' | 'arabic';
}

let tooltipZIndexCounter = 2147483600;

export const FootnoteTooltip: React.FC<FootnoteTooltipProps> = ({ 
  children, 
  footnote, 
  className = '',
  matchedLanguage = 'english'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [uniqueZIndex] = useState(() => ++tooltipZIndexCounter);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log(`FootnoteTooltip created for footnote ${footnote.number}:`, {
    english_word: footnote.english_word,
    arabic_word: footnote.arabic_word,
    section: footnote.section,
    uniqueZIndex: uniqueZIndex,
    hasTranslation: !!footnote.english_translation,
    hasInterpretation: !!footnote.arabic_interpretation
  });

  const updatePosition = () => {
    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      console.log(`Footnote ${footnote.number} positioning debug:`, {
        triggerRect: {
          top: triggerRect.top,
          left: triggerRect.left,
          bottom: triggerRect.bottom,
          right: triggerRect.right,
          width: triggerRect.width,
          height: triggerRect.height
        },
        windowScroll: {
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        word: footnote.english_word
      });
      
      if (triggerRect.width === 0 && triggerRect.height === 0) {
        console.warn(`Footnote ${footnote.number}: Invalid triggerRect`);
        return;
      }
      
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;
      
      const tooltipWidth = 300;
      const tooltipHeight = 150;
      
      if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 16;
      }
      if (left < 16) {
        left = 16;
      }
      
      if (top + tooltipHeight > window.innerHeight) {
        top = triggerRect.top - tooltipHeight - 8;
      }
      if (top < 16) {
        top = 16;
      }
      
      console.log(`Footnote ${footnote.number} final viewport position:`, { top, left });
      setPosition({ top, left });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (mounted && isVisible) {
      const timer = setTimeout(() => {
        updatePosition();
        
        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        
        cleanup = () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
        };
      }, 50);
      
      return () => {
        clearTimeout(timer);
        if (cleanup) {
          cleanup();
        }
      };
    }
  }, [mounted, isVisible]);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
    setHasBeenVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const hasContent = footnote.english_translation || footnote.arabic_interpretation;

  if (!hasContent) {
    return (
      <span className={`footnote-marker ${className}`}>
        {children}
      </span>
    );
  }

  const shouldShowTooltip = mounted && isVisible && position.top > 0 && position.left >= 0;
  
  const tooltipContent = shouldShowTooltip ? (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: uniqueZIndex,
        position: 'fixed',
        pointerEvents: 'auto',
      }}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
    >
      <div className="text-xs mb-2 font-semibold text-[#43896B] border-b border-gray-200 pb-2">
        Footnote {footnote.number}
      </div>
      {matchedLanguage === 'english' && footnote.english_translation && (
        <div className="text-sm mb-2 leading-relaxed text-gray-800">
          {footnote.english_translation}
        </div>
      )}
      {matchedLanguage === 'arabic' && footnote.arabic_interpretation && (
        <div className="text-sm text-right mb-2 leading-relaxed text-gray-800" dir="rtl">
          {footnote.arabic_interpretation}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className={`footnote-marker cursor-help transition-colors ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        {children}
      </span>
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
};

// ============================================================================
// 7. IndexListing (from app/components/index-listing/index.tsx)
// ============================================================================

interface IndexListingProps {
  items: IndexItem[];
  categorySlug: string;
}

export const IndexListing: React.FC<IndexListingProps> = ({ items, categorySlug }) => {
  const sortedItems = [...items].sort((a, b) => a.word.localeCompare(b.word));

  const getFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sortedItems.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#43896B]/30 hover:bg-gray-50/50 transition-all duration-300 overflow-hidden group">
            <div className="flex gap-0">
              <div className="shrink-0 relative">
                <div className="shrink-0 h-full relative flex items-center justify-center">
                  <div className="w-14 h-full bg-linear-to-br from-[#43896B] via-[#43896B]/90 to-[#367556] rounded-br-2xl rounded-r-none flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-50"></div>
                    <span className="text-lg font-black text-white drop-shadow-sm relative z-10">
                      {getFirstLetter(item.word)}
                    </span>
                    <div className="absolute -right-2 top-0 w-4 h-full bg-linear-to-r from-[#367556] to-transparent transform skew-x-12"></div>
                  </div>
                </div>
              </div>

              <div className="grow min-w-0 py-6 pr-6 pl-8">
                <div className="flex flex-col lg:flex-row items-end gap-4 lg:items-start justify-between">
                  <div className="grow min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#43896B] transition-colors duration-300 leading-normal">
                      {item.word}
                    </h3>
                    {item.references.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.references.slice(0, 5).map((ref, refIndex) => {
                          const [prefix] = ref.split('.');
                          let linkHref = '';
                          switch (prefix) {
                            case '0':
                              linkHref = `/introduction#${ref}`;
                              break;
                            case '1':
                              linkHref = `/orations#${ref}`;
                              break;
                            case '2':
                              linkHref = `/letters#${ref}`;
                              break;
                            case '3':
                              linkHref = `/sayings#${ref}`;
                              break;
                            default:
                              linkHref = `/#${ref}`;
                          }
                          return (
                            <Link
                              key={refIndex}
                              href={linkHref}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-[#43896B]/10 to-[#43896B]/5 text-[#43896B] rounded-full border border-[#43896B]/20 hover:from-[#43896B]/20 hover:to-[#43896B]/10 transition-all duration-300"
                            >
                              <Hash className="w-3.5 h-3.5" />
                              {ref}
                            </Link>
                          );
                        })}
                        {item.references.length > 5 && (
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            +{item.references.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 8. TextRefChip (from app/components/text-ref-chip/index.tsx)
// ============================================================================

interface TextRefChipProps {
  textRef: string;
  variant?: 'default' | 'inline';
  showIcon?: boolean;
  showLabel?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  englishWord?: string;
  arabicWord?: string;
}

/**
 * Clickable chip component for text references
 * Handles parsing, routing, and highlighting on detail pages
 */
export function TextRefChip({
  textRef,
  variant = 'default',
  showIcon = true,
  showLabel = false,
  onClick,
  englishWord,
  arabicWord,
}: TextRefChipProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const parsed = useMemo(() => parseTextReference(textRef), [textRef]);

  if (!parsed) {
    // Fallback if reference cannot be parsed
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
        {showIcon && <Book className="w-3 h-3" />}
        {textRef}
      </span>
    );
  }

  const contentTypeName = getContentTypeName(parsed.type);
  const colorClass = getTextRefTypeColor(parsed.type);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(e);
      return;
    }

    try {
      setIsLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.set('highlightRef', parsed.number);
      
      if (englishWord) {
        queryParams.set('word', englishWord);
      }
      if (arabicWord) {
        queryParams.set('arabicWord', arabicWord);
      }

      // For introduction (radis), navigate directly
      if (parsed.type === 'introduction') {
        router.push(`/radis?${queryParams.toString()}`);
        return;
      }

      // Try different sermon/paragraph number formats
      // Format 1: Just the first part (26 from 26.1)
      let sermonNumber = parsed.sectionNumber.split('.')[0];
      
      // Fetch the post by sermon number to get its ID
      let post = null;
      switch (parsed.type) {
        case 'oration':
          post = await orationsApi.getOrationBySermonNumber(sermonNumber);
          break;
        case 'letter':
          post = await lettersApi.getLetterBySermonNumber(sermonNumber);
          break;
        case 'saying':
          post = await sayingsApi.getSayingBySermonNumber(sermonNumber);
          break;
      }

      // If not found, try with the full sectionNumber (26.1)
      if (!post && parsed.sectionNumber !== sermonNumber) {
        sermonNumber = parsed.sectionNumber;
        switch (parsed.type) {
          case 'oration':
            post = await orationsApi.getOrationBySermonNumber(sermonNumber);
            break;
          case 'letter':
            post = await lettersApi.getLetterBySermonNumber(sermonNumber);
            break;
          case 'saying':
            post = await sayingsApi.getSayingBySermonNumber(sermonNumber);
            break;
        }
      }

      // If still not found, try searching by paragraph number (full sectionNumber)
      if (!post) {
        const paragraphNumber = parsed.sectionNumber;
        switch (parsed.type) {
          case 'oration':
            post = await orationsApi.getOrationByParagraphNumber(paragraphNumber);
            break;
          case 'letter':
            post = await lettersApi.getLetterByParagraphNumber(paragraphNumber);
            break;
          case 'saying':
            post = await sayingsApi.getSayingByParagraphNumber(paragraphNumber);
            break;
        }
      }

      // Final fallback: search by text reference (client-side search through all posts)
      if (!post) {
        switch (parsed.type) {
          case 'oration':
            post = await orationsApi.getOrationByTextReference(parsed.number);
            break;
          case 'letter':
            post = await lettersApi.getLetterByTextReference(parsed.number);
            break;
          case 'saying':
            post = await sayingsApi.getSayingByTextReference(parsed.number);
            break;
        }
      }

      if (!post) {
        console.error(`Could not find ${parsed.type} with text reference ${parsed.number}`);
        return;
      }

      // Navigate to detail page with post ID and highlight ref
      const contentTypeMap = {
        oration: 'orations',
        letter: 'letters',
        saying: 'sayings',
        introduction: 'radis',
      };

      router.push(
        `/${contentTypeMap[parsed.type]}/details/${post.id}?${queryParams.toString()}`
      );
    } catch (error) {
      console.error('Error navigating to text reference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colorClass} text-xs font-semibold rounded transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-wait`}
        title={`Go to ${contentTypeName}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          showIcon && <ArrowRight className="w-3 h-3" />
        )}
        {textRef}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${colorClass} text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-wait`}
      title={`Navigate to ${contentTypeName} - ${parsed.sectionNumber}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        showIcon && <Book className="w-3 h-3" />
      )}
      {textRef}
      {showLabel && <span className="hidden sm:inline text-xs opacity-75">({contentTypeName})</span>}
    </button>
  );
}

// ============================================================================
// 9. TOCDisplay (from app/components/toc-display/index.tsx)
// ============================================================================

interface TOCDisplayProps {
  heading?: string;
  TocEnglish?: string;
  TocArabic?: string;
  contentId: number;
  contentType: 'orations' | 'letters' | 'sayings';
  sermonNumber?: string;
}

export function TOCDisplay({
  heading,
  TocEnglish,
  TocArabic,
  contentId,
  contentType,
  sermonNumber,
}: TOCDisplayProps) {
  const hasTOCData = heading || TocEnglish || TocArabic;

  if (!hasTOCData) {
    return null;
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#43896B]" />
          <h4 className="text-xs font-semibold text-[#43896B] uppercase tracking-wide">
            Table of Contents
          </h4>
        </div>
        <Link
          href={`/${contentType}/details/${contentId}/toc`}
          className="text-xs text-[#43896B] hover:underline font-medium"
        >
          View Full TOC
        </Link>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {heading && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Heading:</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">
              {truncateText(heading, 100)}
            </p>
          </div>
        )}

        {TocEnglish && (
          <div>
            <p className="text-xs text-gray-500 mb-1">English:</p>
            <p className="text-sm text-gray-700 leading-snug font-brill">
              {truncateText(TocEnglish, 120)}
            </p>
          </div>
        )}

        {TocArabic && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Arabic:</p>
            <p className="text-sm text-gray-800 leading-snug font-taha" dir="rtl">
              {truncateText(TocArabic, 120)}
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-gray-200">
        <Link
          href={`/${contentType}/details/${contentId}/toc`}
          className="inline-flex items-center gap-1.5 text-xs text-[#43896B] hover:text-[#43896B]/80 font-medium transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Read with Manuscripts
        </Link>
      </div>
    </div>
  );
}

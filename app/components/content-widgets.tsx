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
import { orationsApi, lettersApi, sayingsApi, conclusionsApi } from '@/api/posts';

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
      className={`collapsible-section ${isEven ? 'collapsible-section--even' : 'collapsible-section--odd'}`}
    >
      {/* Header - always visible, clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="collapsible-section__header"
      >
        <div className="collapsible-section__toggle-wrapper">
          {isOpen ? (
            <>
              <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4 collapsible-section__toggle-label--open" />
              <span className="collapsible-section__toggle-label collapsible-section__toggle-label--open">Hide</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 collapsible-section__toggle-label--closed" />
              <span className="collapsible-section__toggle-label collapsible-section__toggle-label--closed">Show</span>
            </>
          )}
        </div>
        <div className="collapsible-section__content-wrapper">
          <div className="collapsible-section__content-inner">
            {number && (
              <span className="collapsible-section__number-badge">
                {number}
              </span>
            )}
            {!isOpen && (
              <span className="collapsible-section__preview-text">
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
            <div className="collapsible-section__arabic-block">
              <p className="collapsible-section__arabic-text" dir="rtl">
                {arabic}
              </p>
            </div>
          )}

          {/* English text */}
          {(displayMode === 'both' || displayMode === 'english-only') && english && (
            <div className="collapsible-section__english-block">
              <p className="collapsible-section__english-text">
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
  listingParams?: {
    page?: string;
    search?: string;
    sort?: string;
    edition?: string;
    display?: string;
  };
}

export const ListViewItem: React.FC<ListViewItemProps> = ({
  item,
  contentType,
  displayMode = 'both',
  isExpanded = false,
  onToggleExpand,
  listingParams
}) => {
  const searchParams = useSearchParams();
  const currentPage = listingParams?.page ?? searchParams.get('page');
  const currentSort = listingParams?.sort ?? searchParams.get('sort');
  const currentSearch = listingParams?.search ?? searchParams.get('search');
  const currentEdition = listingParams?.edition ?? searchParams.get('edition');
  const currentDisplay = listingParams?.display ?? searchParams.get('display');

  // Build return URL params
  const buildReturnParams = () => {
    const params = new URLSearchParams();
    if (currentPage) params.set('returnPage', currentPage);
    if (currentSort) params.set('returnSort', currentSort);
    if (currentSearch) params.set('returnSearch', currentSearch);
    if (currentEdition) params.set('edition', currentEdition);
    if (currentDisplay && currentDisplay !== 'both') params.set('display', currentDisplay);
    return params.toString();
  };

  const returnParams = buildReturnParams();
  const detailUrl = `/content/details/${contentType}/${item.id}${returnParams ? `?${returnParams}` : ''}`;

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

  // Arabic-only editions (e.g. Attar) have the Arabic heading in `heading` -- show it once, as Arabic
  const rawHeading = item.heading || item.TocEnglish || '';
  const headingIsArabic = !!rawHeading && /[؀-ۿ]/.test(rawHeading) && !/[A-Za-z]/.test(rawHeading);
  const englishHeading = headingIsArabic ? '' : rawHeading;

  const englishPreview = item.TocEnglish && item.TocEnglish !== englishHeading
    ? item.TocEnglish.replace(/\[\d+\]/g, '').replace(/\n/g, ' ').trim()
    : getEnglishPreview();
  const arabicPreview = item.TocArabic || (headingIsArabic ? rawHeading : '') || getArabicPreview();

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
      className="list-item__outer group"
    >
      <div className="list-item">
        {/* Corner accents on hover */}
        <div className="corner-accent-hover corner-accent-hover--top-left" />
        <div className="corner-accent-hover corner-accent-hover--bottom-right" />

        <div className="list-item__flex-row">
          {/* Number Badge */}
          {displayNumber && (
            <div className="list-item__number-badge">
              <span className="list-item__number-text">
                {displayNumber}
              </span>
            </div>
          )}

          {/* Content - Links to detail page */}
          <Link
            href={detailUrl}
            className="list-item__content-link"
          >
            {/* Heading */}
            <h3 className="list-item__heading line-clamp-2">
              {englishHeading || (headingIsArabic ? '' : 'Untitled')}
            </h3>

            {/* English Preview */}
            {(displayMode === 'both' || displayMode === 'english-only') && englishPreview && (
              <p className="list-item__english-preview">
                {englishPreview}
              </p>
            )}

            {/* Arabic Preview */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && arabicPreview && (
              <p className="list-item__arabic-preview" dir="rtl">
                {arabicPreview}
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="list-item__tags-wrapper">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="list-item__tag"
                  >
                    {tag.name}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="list-item__tags-overflow">
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
              className="list-item__expand-button"
              aria-label={isExpanded ? 'Hide content' : 'Show content'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 list-item__expand-icon--active" />
                  <span className="list-item__expand-label list-item__expand-label--active">Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 list-item__expand-icon--inactive" />
                  <span className="list-item__expand-label list-item__expand-label--inactive">Show</span>
                </>
              )}
            </button>
          )}

          {/* Arrow indicator (only show if no expand button) */}
          {!onToggleExpand && (
            <div className="list-item__arrow-wrapper">
              <div className="list-item__arrow-circle">
                <svg
                  className="list-item__arrow-svg"
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
              <div className="list-item__summary-wrapper">
                <h4 className="list-item__summary-label">Summary</h4>
                <div className="list-item__summary-box">
                  <p className="list-item__summary-text">
                    {item.TocEnglish}
                  </p>
                </div>
              </div>
            )}

            {/* Arabic Summary */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && item.TocArabic && (
              <div className="list-item__summary-wrapper">
                <h4 className="list-item__summary-label">ملخص</h4>
                <div className="list-item__arabic-summary-box">
                  <p className="list-item__arabic-summary-text" dir="rtl">
                    {item.TocArabic}
                  </p>
                </div>
              </div>
            )}

            {/* Full Text - Interleaved Arabic & English */}
            {interleavedParagraphs.length > 0 && (
              <div className="list-item__paragraphs-wrapper">
                {/* Single section (letters) - simpler display */}
                {interleavedParagraphs.length === 1 ? (
                  <div className="list-item__single-section">
                    <div className="list-item__single-section-inner">
                      {/* Arabic text */}
                      {(displayMode === 'both' || displayMode === 'arabic-only') && interleavedParagraphs[0].arabic && (
                        <div className="list-item__single-arabic-block">
                          <p className="list-item__single-arabic-text" dir="rtl">
                            {interleavedParagraphs[0].arabic}
                          </p>
                        </div>
                      )}

                      {/* English text */}
                      {(displayMode === 'both' || displayMode === 'english-only') && interleavedParagraphs[0].english && (
                        <div className="list-item__single-english-block">
                          <p className="list-item__single-english-text">
                            {interleavedParagraphs[0].english}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Multi-section (orations) - collapsible sections with alternating colors */
                  <div className="list-item__multi-section">
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
            <div className="list-item__actions">
              <Link
                href={detailUrl}
                className="btn-primary list-item__action-btn"
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
    <div className="pagination">
      {/* Page info */}
      {showRange && (
        <p className="pagination__info">
          Page {currentPage} of {totalPages}
        </p>
      )}

      {/* Pagination controls */}
      <nav className="pagination__nav">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`pagination__button ${currentPage === 1 || loading ? 'pagination__button--disabled' : ''}`}
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
              className={`pagination__button ${isActive ? 'pagination__button--active' : ''} ${loading ? 'pagination__button--loading' : ''}`}
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
          className={`pagination__button ${currentPage === totalPages || loading ? 'pagination__button--disabled' : ''}`}
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
    <div className={`range-slider ${className}`}>
      <div className="range-slider__track" />
      <motion.div
        className="range-slider__fill"
        initial={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
        animate={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.div
        className={`range-slider__thumb ${isDragging === 'min' ? 'range-slider__thumb--active' : ''}`}
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
        className={`range-slider__thumb ${isDragging === 'max' ? 'range-slider__thumb--active' : ''}`}
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
        className="range-slider__input-hidden"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="range-slider__input-hidden"
      />
      {isDragging === 'min' && (
        <motion.div
          className="range-slider__tooltip"
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
          className="range-slider__tooltip"
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
      <div className="timeline__loading">
        <div className="timeline__loading-inner">
          <Loader2 className="w-8 h-8 animate-spin timeline__loading-spinner" />
          <p className="timeline__loading-text">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {/* Timeline Header */}
      <div className="timeline__header">
        <div>
          <h2 className="timeline__title">{title}</h2>
          <p className="timeline__subtitle">
            {sortedItems.length} {contentType} • Click on a point to see details
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="timeline__nav">
          <button
            onClick={() => handleScroll('left')}
            disabled={visibleRange.start === 0}
            className="timeline__nav-button"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={visibleRange.end >= sortedItems.length}
            className="timeline__nav-button"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Range Indicator */}
      <div className="timeline__range-indicator">
        Showing {contentTypeLabel}s {visibleRange.start + 1} - {Math.min(visibleRange.end, sortedItems.length)} of {sortedItems.length}
      </div>

      {/* Timeline Track */}
      <div className="timeline__track-wrapper" ref={timelineRef}>
        {/* Timeline Line */}
        <div className="timeline__line" />

        {/* Timeline Points */}
        <div className="timeline__points">
          {visibleItems.map((item, index) => {
            const displayNum = getDisplayNumber(item.sermonNumber);
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                className="timeline__point-wrapper timeline-item"
              >
                {/* Number Label (top) */}
                <div className={`timeline__point-label ${
                  isSelected ? 'timeline__point-label--selected' : 'timeline__point-label--default'
                }`}>
                  {displayNum}
                </div>

                {/* Timeline Point */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`timeline__point-button ${
                    isSelected
                      ? 'timeline__point-button--selected'
                      : 'timeline__point-button--default'
                  }`}
                  aria-label={`View ${contentTypeLabel} ${displayNum}`}
                >
                  {isSelected && (
                    <div className="timeline__point-ping" />
                  )}
                </button>

                {/* Connector Line (bottom) */}
                <div className={`timeline__point-connector ${
                  isSelected ? 'timeline__point-connector--selected' : 'timeline__point-connector--default'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="timeline__details">
          {/* Corner accents */}
          <div className="timeline__details-corner timeline__details-corner--tl" />
          <div className="timeline__details-corner timeline__details-corner--br" />

          <div className="timeline__details-card">
            {/* Header */}
            <div className="timeline__details-header">
              <div className="timeline__details-header-left">
                <div className="timeline__details-number-box">
                  <span className="timeline__details-number">
                    {getDisplayNumber(selectedItem.sermonNumber)}
                  </span>
                </div>
                <div>
                  <h3 className="timeline__details-title">
                    {selectedItem.heading || `${contentTypeLabel} ${getDisplayNumber(selectedItem.sermonNumber)}`}
                  </h3>
                  {selectedItem.sermonNumber && (
                    <p className="timeline__details-section">
                      Section {selectedItem.sermonNumber}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/content/details/${contentType}/${selectedItem.id}`}
                className="btn-primary timeline__details-link"
              >
                <Icon className="w-4 h-4" />
                <span className="timeline__details-link-text">Go to {contentTypeLabel}</span>
              </Link>
            </div>

            {/* Content Preview */}
            <div className="timeline__details-content">
              {/* Arabic Preview */}
              {getArabicPreview(selectedItem) && (
                <div className="timeline__details-arabic-block">
                  <p className="timeline__details-arabic-text" dir="rtl">
                    {getArabicPreview(selectedItem)}
                  </p>
                </div>
              )}

              {/* English Preview */}
              {getEnglishPreview(selectedItem) && (
                <div className="timeline__details-english-block">
                  <p className="timeline__details-english-text">
                    {getEnglishPreview(selectedItem)}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="timeline__details-tags">
                {selectedItem.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="timeline__tag"
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
      <div className="timeline__jump">
        <label className="timeline__jump-label">Jump to {contentTypeLabel}:</label>
        <input
          type="number"
          min="1"
          max={sortedItems.length}
          placeholder="#"
          className="timeline__jump-input"
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
        <span className="timeline__jump-hint">Press Enter</span>
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
        <div className="alphabet-chips" dir={language === 'Arabic' ? 'rtl' : 'ltr'}>
            <button
                onClick={() => onSelectLetter('')}
                className={`alphabet-chip alphabet-chip--all ${!selectedLetter
                        ? "alphabet-chip--active"
                        : "alphabet-chip--inactive"
                    }`}
            >
                All
            </button>
            {letters.map((letter) => (
                <button
                    key={letter}
                    onClick={() => onSelectLetter(letter)}
                    className={`alphabet-chip alphabet-chip--letter ${language === 'Arabic' ? 'text-sm font-taha' : ''} ${selectedLetter === letter
                            ? "alphabet-chip--active"
                            : "alphabet-chip--inactive"
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
      className="footnote-tooltip"
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
      <div className="footnote-tooltip__header">
        Footnote {footnote.number}
      </div>
      {matchedLanguage === 'english' && footnote.english_translation && (
        <div className="footnote-tooltip__text">
          {footnote.english_translation}
        </div>
      )}
      {matchedLanguage === 'arabic' && footnote.arabic_interpretation && (
        <div className="footnote-tooltip__text footnote-tooltip__text--rtl font-taha" dir="rtl">
          {footnote.arabic_interpretation}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        className={`footnote-marker footnote-trigger ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {/* In full screen only the full-screen element is visible, so render the tooltip inside it */}
      {mounted && tooltipContent && createPortal(tooltipContent, document.fullscreenElement ?? document.body)}
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
    <div className="index-listing">
      <div className="index-listing__grid">
        {sortedItems.map((item, index) => (
          <div key={index} className="index-listing__card">
            <div className="index-listing__card-inner">
              <div className="index-listing__letter-wrapper">
                <div className="index-listing__letter-inner">
                  <div className="index-listing__letter-box">
                    <div className="index-listing__letter-overlay"></div>
                    <span className="index-listing__letter">
                      {getFirstLetter(item.word)}
                    </span>
                    <div className="index-listing__letter-skew"></div>
                  </div>
                </div>
              </div>

              <div className="index-listing__content">
                <div className="index-listing__content-layout">
                  <div className="index-listing__content-text">
                    <Link href={`/indexes/${categorySlug}/${encodeURIComponent(item.word)}`}>
                      <h3 className="index-listing__title">
                        {item.word}
                      </h3>
                    </Link>
                    {item.references.length > 0 && (
                      <div className="index-listing__refs">
                        {item.references.slice(0, 5).map((ref, refIndex) => {
                          const [prefix] = ref.split('.');
                          // Introduction refs jump to Radi's introduction; everything else opens the
                          // index entry's detail page (/indexes/[slug]/[term]), which lists every reference.
                          const linkHref = prefix === '0'
                            ? `/radis?highlightRef=${ref}`
                            : `/indexes/${categorySlug}/${encodeURIComponent(item.word)}`;
                          return (
                            <Link
                              key={refIndex}
                              href={linkHref}
                              className="index-listing__ref-chip"
                            >
                              <Hash className="w-3.5 h-3.5" />
                              {ref}
                            </Link>
                          );
                        })}
                        {item.references.length > 5 && (
                          <span className="index-listing__overflow-chip">
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
      <span className="text-ref-chip--fallback">
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
      // For conclusion refs, route to the conclusions page.
      if (parsed.type === 'conclusion') {
        const conclusion = await conclusionsApi.getConclusionByNumber(parsed.sectionNumber);
        if (!conclusion) {
          console.error(`Could not find conclusion with text reference ${parsed.number}`);
          return;
        }
        queryParams.set('highlightRef', parsed.sectionNumber);
        router.push(`/conclusions?${queryParams.toString()}`);
        return;
      }

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
        conclusion: 'conclusions',
      };

      router.push(
        `/content/details/${contentTypeMap[parsed.type]}/${post.id}?${queryParams.toString()}`
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
        className={`text-ref-chip text-ref-chip--inline ${colorClass}`}
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
      className={`text-ref-chip text-ref-chip--default ${colorClass}`}
      title={`Navigate to ${contentTypeName} - ${parsed.sectionNumber}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        showIcon && <Book className="w-3 h-3" />
      )}
      {textRef}
      {showLabel && <span className="text-ref-chip__label">({contentTypeName})</span>}
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
    <div className="toc-display">
      {/* Header */}
      <div className="toc-display__header">
        <div className="toc-display__title-group">
          <FileText className="w-4 h-4 toc-display__icon" />
          <h4 className="toc-display__title">
            Table of Contents
          </h4>
        </div>
        <Link
          href={`/content/details/${contentType}/${contentId}/toc`}
          className="toc-display__link"
        >
          View Full TOC
        </Link>
      </div>

      {/* Content */}
      <div className="toc-display__content">
        {heading && (
          <div className="toc-display__content-section">
            <p className="toc-display__label">Heading:</p>
            <p className="toc-display__heading-text">
              {truncateText(heading, 100)}
            </p>
          </div>
        )}

        {TocEnglish && (
          <div className="toc-display__content-section">
            <p className="toc-display__label">English:</p>
            <p className="toc-display__english-text font-brill">
              {truncateText(TocEnglish, 120)}
            </p>
          </div>
        )}

        {TocArabic && (
          <div className="toc-display__content-section">
            <p className="toc-display__label">Arabic:</p>
            <p className="toc-display__arabic-text font-taha" dir="rtl">
              {truncateText(TocArabic, 120)}
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="toc-display__footer">
        <Link
          href={`/content/details/${contentType}/${contentId}/toc`}
          className="toc-display__footer-link"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Read with Manuscripts
        </Link>
      </div>
    </div>
  );
}

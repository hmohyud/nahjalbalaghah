'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type Post } from '@/api/posts';
import { ChevronDown, ChevronUp, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';

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

const ListViewItem: React.FC<ListViewItemProps> = ({ 
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

export default ListViewItem;

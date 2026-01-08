'use client';
import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type Post } from '@/api/posts';
import { ChevronDown, ChevronRight, BookOpen, ArrowRight } from 'lucide-react';

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
      className="border-b border-[var(--color-stone)] last:border-b-0"
      style={{ backgroundColor: isEven ? '#FFFFFF' : '#EDE8DF' }}
    >
      {/* Header - always visible, clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-[var(--color-cream)]/30 transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[var(--color-primary)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--color-warm-gray)]" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3">
            {number && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-display text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                {number}
              </span>
            )}
            {!isOpen && (
              <span className="text-sm text-[var(--color-warm-gray)] font-body truncate">
                {getPreview()}
              </span>
            )}
          </div>
        </div>
      </button>
      
      {/* Content - shown when expanded */}
      {isOpen && (
        <div className="px-4 pb-4 pl-11">
          {/* Arabic text */}
          {(displayMode === 'both' || displayMode === 'arabic-only') && arabic && (
            <div className="mb-3 p-4 border-r-2 border-[var(--color-primary)]">
              <p className="text-[var(--color-ink)] font-taha text-lg leading-loose whitespace-pre-wrap" dir="rtl">
                {arabic}
              </p>
            </div>
          )}
          
          {/* English text */}
          {(displayMode === 'both' || displayMode === 'english-only') && english && (
            <div className="p-4 border-l-2 border-[var(--color-stone)]">
              <p className="text-[var(--color-charcoal)] font-body leading-relaxed whitespace-pre-wrap">
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
  const tocUrl = `/${contentType}/details/${item.id}/toc${returnParams ? `?${returnParams}` : ''}`;

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
        const arabic = para.arabic 
          ? para.arabic.replace(/<center>|<\/center>/gi, '').replace(/<span[^>]*>|<\/span>/gi, '').replace(/&nbsp;/gi, ' ').trim()
          : '';
        const english = para.translations?.find(t => t.type === 'en')?.text || '';
        
        if (arabic || english) {
          results.push({ 
            number: para.number || '', 
            arabic, 
            english 
          });
        }
      }
    }
    
    return results;
  };

  const interleavedParagraphs = getInterleavedParagraphs();

  return (
    <div 
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

          {/* Content - Links to detail page */}
          <Link 
            href={detailUrl}
            className="flex-grow p-5 lg:p-6 min-w-0 hover:bg-[var(--color-cream)]/30 transition-colors"
          >
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
          </Link>

          {/* Expand Button */}
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleExpand();
              }}
              className="flex-shrink-0 w-12 lg:w-14 flex items-center justify-center border-l border-[var(--color-stone)] hover:bg-[var(--color-cream)] transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-[var(--color-primary)]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] transition-colors" />
              )}
            </button>
          )}

          {/* Arrow indicator (only show if no expand button) */}
          {!onToggleExpand && (
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
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-[var(--color-stone)] bg-[var(--color-parchment)]/50 p-6">
            {/* English Summary */}
            {(displayMode === 'both' || displayMode === 'english-only') && item.TocEnglish && (
              <div className="mb-6">
                <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] font-body mb-3">Summary</h4>
                <div className="bg-white p-4 border border-[var(--color-stone)]">
                  <p className="text-[var(--color-charcoal)] font-body leading-relaxed">
                    {item.TocEnglish}
                  </p>
                </div>
              </div>
            )}
            
            {/* Arabic Summary */}
            {(displayMode === 'both' || displayMode === 'arabic-only') && item.TocArabic && (
              <div className="mb-6">
                <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] font-body mb-3">ملخص</h4>
                <div className="bg-white p-4 border-r-2 border-[var(--color-primary)]">
                  <p className="text-[var(--color-ink)] font-taha text-xl leading-loose" dir="rtl">
                    {item.TocArabic}
                  </p>
                </div>
              </div>
            )}

            {/* Full Text - Interleaved Arabic & English */}
            {interleavedParagraphs.length > 0 && (
              <div className="mb-6">
                {/* Single section (letters) - simpler display */}
                {interleavedParagraphs.length === 1 ? (
                  <div className="border border-[var(--color-stone)]">
                    <div className="p-5">
                      {/* Arabic text */}
                      {(displayMode === 'both' || displayMode === 'arabic-only') && interleavedParagraphs[0].arabic && (
                        <div className="mb-4 p-4 bg-[var(--color-parchment)]/30 border-r-2 border-[var(--color-primary)]">
                          <p className="text-[var(--color-ink)] font-taha text-lg leading-loose whitespace-pre-wrap" dir="rtl">
                            {interleavedParagraphs[0].arabic}
                          </p>
                        </div>
                      )}
                      
                      {/* English text */}
                      {(displayMode === 'both' || displayMode === 'english-only') && interleavedParagraphs[0].english && (
                        <div className="p-4 bg-[var(--color-cream)]/50 border border-[var(--color-stone)]/50">
                          <p className="text-[var(--color-charcoal)] font-body leading-relaxed whitespace-pre-wrap">
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
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-stone)]">
              <Link
                href={detailUrl}
                className="btn-primary"
              >
                <BookOpen className="w-4 h-4" />
                Read Full {contentTypeLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={tocUrl}
                className="btn-outline"
              >
                View Table of Contents
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListViewItem;

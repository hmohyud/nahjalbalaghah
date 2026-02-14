'use client';
import React, { useState, useEffect } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { type Post } from '@/api/posts';
import { formatTextWithFootnotes, isArabicText } from '@/app/utils/text-formatting';
import { extractReferences, replaceReferencesWithSuperscripts } from '@/app/utils';
import { Select } from '@/app/components/ui';

interface ContentDescriptionProps {
  content: Post;
  contentType: 'orations' | 'letters' | 'sayings';
  highlightRef?: string | null;
  englishWord?: string | null;
  arabicWord?: string | null;
}

const ContentDescription = ({ content, contentType, highlightRef, englishWord, arabicWord }: ContentDescriptionProps) => {
  const [displayMode, setDisplayMode] = useState<'both' | 'english-only' | 'arabic-only'>('both');
  const [selectedTranslation, setSelectedTranslation] = useState('en');
  const [highlightedParagraphNumber, setHighlightedParagraphNumber] = useState<string | null>(null);

  let allReferences: string[] = [];
  const heading = content.heading;

  useEffect(() => {
    if (highlightRef) {
      setHighlightedParagraphNumber(highlightRef);
      
      const timer = setTimeout(() => {
        let element = document.querySelector(`[data-text-ref="${highlightRef}"]`);
        
        if (!element) {
          const allTextRefElements = document.querySelectorAll('[data-text-ref]');
          for (const el of allTextRefElements) {
            const refValue = el.getAttribute('data-text-ref');
            if (refValue && (refValue === highlightRef || refValue.startsWith(highlightRef + '.') || highlightRef.startsWith(refValue + '.'))) {
              element = el;
              break;
            }
          }
        }
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-text-ref');
          
          const wordToHighlight = englishWord || arabicWord;
          if (wordToHighlight) {
            const textElement = englishWord 
              ? element.querySelector('.font-brill') 
              : element.querySelector('.font-taha');
            if (textElement) {
              highlightWordInParagraph(textElement, wordToHighlight);
            } else {
              const anyTextElement = element.querySelector('p');
              if (anyTextElement) {
                highlightWordInParagraph(anyTextElement, wordToHighlight);
              }
            }
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [highlightRef, englishWord, arabicWord]);

  const highlightWordInParagraph = (paragraphDiv: Element, word: string) => {
    const walker = document.createTreeWalker(
      paragraphDiv,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: Array<{ node: Text; matches: Array<{ start: number; end: number }> }> = [];
    let textNode;
    const wordRegex = new RegExp(word, 'gi');

    while (textNode = walker.nextNode() as Text | null) {
      let match;
      const matches: Array<{ start: number; end: number }> = [];
      wordRegex.lastIndex = 0;
      
      while ((match = wordRegex.exec(textNode.textContent || '')) !== null) {
        matches.push({ start: match.index, end: wordRegex.lastIndex });
      }

      if (matches.length > 0) {
        nodesToReplace.push({ node: textNode, matches });
      }
    }

    for (const { node, matches } of nodesToReplace.reverse()) {
      for (const match of matches.reverse()) {
        const before = node.textContent?.substring(0, match.start) || '';
        const highlighted = node.textContent?.substring(match.start, match.end) || '';
        const after = node.textContent?.substring(match.end) || '';

        const span = document.createElement('span');
        span.className = 'highlight-word';
        span.textContent = highlighted;

        if (after) {
          node.textContent = before;
          const afterNode = document.createTextNode(after);
          node.parentNode?.insertBefore(span, node.nextSibling);
          node.parentNode?.insertBefore(afterNode, span.nextSibling);
        } else {
          node.textContent = before;
          node.parentNode?.insertBefore(span, node.nextSibling);
        }
      }
    }
  };

  const allFootnotes = [
    ...(content.footnotes || []),
    ...content.paragraphs.flatMap(p => p.footnotes || [])
  ];

  const sortedParagraphs = [...content.paragraphs].sort((a, b) => {
    const parseNumber = (num: string) => {
      return num.split('.').map(n => parseInt(n, 10));
    };

    const aNumbers = parseNumber(a.number);
    const bNumbers = parseNumber(b.number);

    for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
      const aNum = aNumbers[i] || 0;
      const bNum = bNumbers[i] || 0;
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }
    return 0;
  });

  const mainTranslation = content.translations?.find(t => t.type === selectedTranslation);

  const getContentLabel = () => {
    switch (contentType) {
      case 'orations':
        return 'Oration';
      case 'letters':
        return 'Letter';
      case 'sayings':
        return 'Saying';
      default:
        return 'Content';
    }
  };

  const displayOptions = [
    { value: 'both', label: 'English and Arabic' },
    { value: 'english-only', label: 'English Only' },
    { value: 'arabic-only', label: 'Arabic Only' },
  ];

  const availableTranslations = content.translations || [];
  const translationOptions = availableTranslations.map(t => ({
    value: t.type,
    label: t.type === 'en' ? 'English' : t.type.toUpperCase()
  }));

  const cleanArabicText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/<center>|<\/center>/gi, '')
      .replace(/<span[^>]*>|<\/span>/gi, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();
  };

  return (
    <div className="content-panel">
      {/* Corner accents */}
      <div className="content-panel__corner--tl" />
      <div className="content-panel__corner--br" />

      <div className="content-panel__inner">
        {/* Header */}
        <div className="content-panel__header">
          <h1 className="content-panel__title">
            {heading || `${getContentLabel()} Details`}
          </h1>
          
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-3 lg:mt-4">
              {content.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="content-tag"
                >
                  <TagIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Display Controls */}
          <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row gap-2 lg:gap-3">
            <Select
              options={displayOptions}
              value={displayMode}
              onChange={(value) => setDisplayMode(value as 'both' | 'english-only' | 'arabic-only')}
              placeholder="Display Mode"
              className="w-full sm:w-48"
            />
            {availableTranslations.length > 1 && (
              <Select
                options={translationOptions}
                value={selectedTranslation}
                onChange={setSelectedTranslation}
                placeholder="Translation"
                className="w-full sm:w-40"
              />
            )}
          </div>
        </div>

        {/* Sermon Number Badge */}
        {content.sermonNumber && (
          <div className="mb-4 lg:mb-6">
            <span className="content-number-badge">
              {content.sermonNumber}
            </span>
          </div>
        )}

        {/* Main Content */}
        {(content.title || mainTranslation) && (
          <div 
            className={`space-y-4 lg:space-y-6 mb-6 lg:mb-8 ${highlightedParagraphNumber === content.sermonNumber ? 'highlight-text-ref' : ''}`}
            data-text-ref={content.sermonNumber}
          >
            <div className="border-b border-[var(--color-stone)] pb-6 lg:pb-8">
              {/* Arabic Title */}
              {(displayMode === 'both' || displayMode === 'arabic-only') && content.title && (
                <div className="mb-4 lg:mb-6">
                  <div className="arabic-text-block text-right">
                    <p className="text-base lg:text-xl leading-loose text-[var(--color-ink)] font-taha whitespace-pre-wrap" dir="rtl">
                      {formatTextWithFootnotes(cleanArabicText(content.title), allFootnotes, true, content.sermonNumber || 'main')}
                    </p>
                  </div>
                </div>
              )}

              {/* English Translation */}
              {(displayMode === 'both' || displayMode === 'english-only') && mainTranslation && (
                (() => {
                  const refs = extractReferences(mainTranslation.text);
                  allReferences = allReferences.concat(refs);

                  return (
                    <div className="english-text-block">
                      <p className="text-sm lg:text-lg leading-relaxed text-[var(--color-charcoal)] font-brill whitespace-pre-wrap">
                        {formatTextWithFootnotes(mainTranslation.text, allFootnotes, false, content.sermonNumber || 'main')}
                      </p>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* Paragraphs */}
        {sortedParagraphs.length > 0 && (
          <div className="space-y-6 lg:space-y-8">
            {sortedParagraphs.map((paragraph) => {
              const englishTranslation = paragraph.translations?.find(t => t.type === selectedTranslation);
              return (
                <div 
                  key={paragraph.id} 
                  data-text-ref={paragraph.number}
                  className={`border-b border-[var(--color-stone)] pb-6 lg:pb-8 last:border-b-0 last:pb-0 ${highlightedParagraphNumber === paragraph.number ? 'highlight-text-ref' : ''}`}
                >
                  {/* Paragraph Number */}
                  {paragraph.number && (
                    <div className="mb-3 lg:mb-4">
                      <span className="content-number-badge">
                        {paragraph.number}
                      </span>
                    </div>
                  )}

                  {/* Arabic Text */}
                  {(displayMode === 'both' || displayMode === 'arabic-only') && paragraph.arabic && (() => {
                    const lines = paragraph.arabic.split(/\n+/).filter(Boolean);

                    return (
                      <div className="mb-4 lg:mb-6">
                        <div className="arabic-text-block">
                          {lines.map((line, index) => {
                            const isCentered = /<center>/i.test(line);
                            const cleanedLine = line
                              .replace(/<center>|<\/center>/gi, '')
                              .replace(/<span[^>]*>|<\/span>/gi, '')
                              .replace(/&nbsp;/gi, ' ')
                              .trim();

                            if (!cleanedLine) return null;

                            return (
                              <div key={index} className={isCentered ? 'text-center' : 'text-right'}>
                                <p
                                  className={`text-base lg:text-xl leading-loose text-[var(--color-ink)] font-taha whitespace-pre-wrap ${isCentered ? 'inline-block' : ''}`}
                                  dir="rtl"
                                >
                                  {formatTextWithFootnotes(cleanedLine, allFootnotes, true, paragraph.number)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* English Translation */}
                  {(displayMode === 'both' || displayMode === 'english-only') && englishTranslation && (() => {
                    const refs = extractReferences(englishTranslation.text);
                    allReferences = allReferences.concat(refs);

                    return (
                      <div className="english-text-block">
                        <p className="text-sm lg:text-lg leading-relaxed text-[var(--color-charcoal)] font-brill whitespace-pre-wrap">
                          {formatTextWithFootnotes(englishTranslation.text, allFootnotes, false, paragraph.number)}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {sortedParagraphs.length === 0 && !(content.title || mainTranslation) && (
          <div className="text-center py-8 lg:py-12">
            <p className="text-[var(--color-warm-gray)] font-body text-sm lg:text-base">No content available for this {contentType.slice(0, -1)}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDescription;

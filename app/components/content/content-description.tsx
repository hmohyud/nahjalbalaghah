'use client';
import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Book, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { type Post, type Footnote, type Edition } from '@/api/orations';
import { postsApi } from '@/api/posts';
import { glossaryEntriesApi } from '@/api/glossary-entries';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatTextWithFootnotes, isArabicText, normalizeArabic } from '@/app/utils/text-formatting';
import { extractReferences, replaceReferencesWithSuperscripts } from '@/app/utils';
import { Select } from '@/app/components/ui';
import { getPreference, setPreference, parseDisplayMode } from '@/app/utils/preferences';

interface ContentDescriptionProps {
  content: Post;
  contentType: 'orations' | 'letters' | 'sayings';
  highlightRef?: string | null;
  englishWord?: string | null;
  arabicWord?: string | null;
}

const ContentDescription = ({ content, contentType, highlightRef, englishWord, arabicWord }: ContentDescriptionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayMode, setDisplayMode] = useState<'both' | 'english-only' | 'arabic-only'>('both');
  const [selectedTranslation, setSelectedTranslation] = useState('en');
  const [selectedEditionId, setSelectedEditionId] = useState<string>('');
  const [editions, setEditions] = useState<Edition[]>([]);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);

  useEffect(() => {
    postsApi.getEditions().then(res => setEditions(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (content.post_base_documentId) {
      postsApi.getPostsByPostBaseDocumentId(content.post_base_documentId)
        .then(res => setAvailablePosts(res.data))
        .catch(console.error);
    }
  }, [content.post_base_documentId]);

  useEffect(() => {
    const saved = parseDisplayMode(getPreference('detailDisplay'));
    if (saved) setDisplayMode(saved);
  }, []);

  const handleDisplayModeChange = (value: 'both' | 'english-only' | 'arabic-only') => {
    setDisplayMode(value);
    setPreference('detailDisplay', value);
  };

  // The selected edition is always the edition of the post being shown
  useEffect(() => {
    if (content.editions && Array.isArray(content.editions) && content.editions.length > 0) {
      setSelectedEditionId(content.editions[0].id.toString());
    } else if (content.editions && content.editions.id) {
      setSelectedEditionId(content.editions.id.toString());
    }
  }, [content]);

  const handleEditionChange = (editionId: string) => {
    setSelectedEditionId(editionId);

    // The URL and saved preference use the edition title, same as the listing pages
    const editionTitle = editions.find(e => e.id.toString() === editionId)?.title;
    const params = new URLSearchParams(searchParams.toString());
    if (editionTitle) {
      params.set('edition', editionTitle);
      setPreference('edition', editionTitle);
    }

    if (availablePosts.length > 0) {
      const targetPost = availablePosts.find(p => {
        if (p.editions && Array.isArray(p.editions)) {
          return p.editions.some((e: any) => e.id.toString() === editionId);
        } else if (p.editions && p.editions.id) {
          return p.editions.id.toString() === editionId;
        }
        return false;
      });

      if (targetPost && targetPost.id !== content.id) {
        // preserve other params when navigating to a different post
        router.push(`/content/details/${contentType}/${targetPost.id}?${params.toString()}`);
      }
    }
  };
  const [highlightedParagraphNumber, setHighlightedParagraphNumber] = useState<string | null>(null);
  const [radisIntroduction, setRadisIntroduction] = useState<{ arabic: string; translation: string } | null>(null);
  const [hasPostLevelSources, setHasPostLevelSources] = useState(false);
  const [paragraphNumbersWithSources, setParagraphNumbersWithSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRadisBlurb = async () => {
      if (content.sermonNumber) {
        try {
          // Import radisApi dynamically or use it if available in context
          const { radisApi } = await import('@/api/posts');
          const radis = await radisApi.getRadisIntroductionByNumber(content.sermonNumber);
          if (radis) {
            setRadisIntroduction({ arabic: radis.arabic, translation: radis.translation });
          }
        } catch (error) {
          console.error('Failed to fetch Radi introduction:', error);
        }
      }
    };
    fetchRadisBlurb();
  }, [content.sermonNumber]);

  useEffect(() => {
    // Check if any paragraph has sources in the appendix
    const hasAppendixSources = content.paragraphs.some(p => {
      const s = p.appendix_of_sources || (p as any).sources;
      if (!s) return false;
      if (Array.isArray(s)) return s.length > 0;
      if ((s as any).data && Array.isArray((s as any).data)) return (s as any).data.length > 0;
      return false;
    });

    if (hasAppendixSources) {
      setHasPostLevelSources(true);
    }

    // The source relation is not consistently included in nested post
    // responses, so use the source endpoint as the authoritative fallback.
    if (content.sermonNumber) {
      glossaryEntriesApi.getGlossaryEntries({ postSermonNumber: content.sermonNumber, pageSize: 200 })
        .then(res => {
          setHasPostLevelSources(hasAppendixSources || res.data.length > 0);
          setParagraphNumbersWithSources(new Set(
            res.data.flatMap(source => source.paragraphs || [])
              .map(paragraph => paragraph.number)
              .filter(Boolean)
          ));
        })
        .catch(() => {
          setHasPostLevelSources(hasAppendixSources);
          setParagraphNumbersWithSources(new Set());
        });
    } else {
      setParagraphNumbersWithSources(new Set());
    }
  }, [content.paragraphs, content.sermonNumber]);

  let allReferences: string[] = [];
  const heading = content.heading;

  // Handle highlighting when component mounts or highlightRef changes
  useEffect(() => {
    if (highlightRef) {
      setHighlightedParagraphNumber(highlightRef);

      // Give DOM time to render and then scroll to it
      const timer = setTimeout(() => {
        const candidates: string[] = [];
        const addCandidate = (v?: string | null) => {
          if (!v) return;
          if (candidates.includes(v)) return;
          candidates.push(v);
        };

        addCandidate(highlightRef);

        const highlightParts = highlightRef.split('.').filter(Boolean);
        if (highlightParts.length >= 2) addCandidate(highlightParts.slice(1).join('.'));
        if (highlightParts.length >= 3) addCandidate(highlightParts.slice(2).join('.'));

        if (content.sermonNumber && highlightParts.length >= 3) {
          const last = highlightParts[highlightParts.length - 1];
          addCandidate(`${content.sermonNumber}.${last}`);
        }

        let element: Element | null = null;
        for (const candidate of candidates) {
          element = document.querySelector(`[data-text-ref="${candidate}"]`);
          if (element) break;
        }

        // If no exact match, try to find a partial match (paragraph that contains this ref)
        if (!element) {
          // Try matching with sermon number prefix
          const allTextRefElements = document.querySelectorAll('[data-text-ref]');
          for (const el of allTextRefElements) {
            const refValue = el.getAttribute('data-text-ref');
            if (
              refValue &&
              (candidates.includes(refValue) ||
                candidates.some((c) => refValue === c || refValue.startsWith(c + '.') || c.startsWith(refValue + '.')))
            ) {
              element = el;
              break;
            }
          }
        }

        const wordToHighlight = englishWord || arabicWord;
        // Transliterated names are often passed with a leading definite article
        // ("al-") that isn't always present verbatim in the source text, e.g.
        // "al-ʿAbbās ibn Mirdās al-Sulamī" vs. text reading "ʿAbbās ibn Mirdās al-Sulamī".
        const wordVariants = wordToHighlight
          ? Array.from(new Set([wordToHighlight, wordToHighlight.replace(/^al[-\s']+/i, '')]))
          : [];
        let matchedInParagraph = false;

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Add highlight class
          element.classList.add('highlight-text-ref');

          // If we have a word to highlight, do that too
          if (wordVariants.length > 0) {
            // Find the text container within this element
            // Look for the paragraph with font-brill class (English) or font-taha class (Arabic)
            const textElement = englishWord
              ? element.querySelector('.content-desc__english-text, .font-brill')
              : element.querySelector('.content-desc__arabic-line, .font-taha');
            if (textElement) {
              matchedInParagraph = wordVariants.some((variant) => highlightWordInParagraph(textElement, variant));
            }
            if (!matchedInParagraph) {
              // Try to find any text container
              const anyTextElement = element.querySelector('p');
              if (anyTextElement) {
                matchedInParagraph = wordVariants.some((variant) => highlightWordInParagraph(anyTextElement, variant));
              }
            }
          }
        }

        // If the word isn't part of the paragraph text itself, it may only appear
        // inside a footnote (e.g. a name explained in a footnote) - scroll/highlight that instead.
        if (wordVariants.length > 0 && !matchedInParagraph) {
          const isArabicMatch = !!arabicWord;
          const targets = wordVariants.map((variant) => (isArabicMatch ? normalizeArabic(variant) : variant.toLowerCase()));

          const matchingFootnote = allFootnotes.find((fn) => {
            const footnoteSection = fn.section?.replace(/^"|"$/g, '') || '';
            const inSection = !footnoteSection || candidates.includes(footnoteSection);
            if (!inSection) return false;

            const text = isArabicMatch ? fn.arabic_interpretation : fn.english_translation;
            const wordField = isArabicMatch ? fn.arabic_word : fn.english_word;
            const normalizedText = text ? (isArabicMatch ? normalizeArabic(text) : text.toLowerCase()) : '';
            const normalizedWordField = wordField ? (isArabicMatch ? normalizeArabic(wordField) : wordField.toLowerCase()) : '';

            return targets.some((target) => normalizedText.includes(target) || normalizedWordField.includes(target));
          });

          if (matchingFootnote) {
            const footnoteEl = document.getElementById(`footnote-${matchingFootnote.id}`);
            if (footnoteEl) {
              footnoteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              footnoteEl.classList.add('highlight-text-ref');

              const footnoteTextElement = isArabicMatch
                ? footnoteEl.querySelector('.font-taha')
                : footnoteEl.querySelector('.font-brill');
              if (footnoteTextElement) {
                wordVariants.some((variant) => highlightWordInParagraph(footnoteTextElement, variant));
              }
            }
          }
        }
      }, 500); // Increased timeout slightly to ensure rendering

      return () => clearTimeout(timer);
    }
  }, [highlightRef, englishWord, arabicWord, content.sermonNumber]);

  const isHighlightedTextRef = (refValue?: string | null) => {
    if (!highlightedParagraphNumber || !refValue) return false;
    if (refValue === highlightedParagraphNumber) return true;
    if (highlightedParagraphNumber.startsWith(refValue + '.') || refValue.startsWith(highlightedParagraphNumber + '.')) return true;

    const highlightParts = highlightedParagraphNumber.split('.').filter(Boolean);
    const suffix1 = highlightParts.length >= 2 ? highlightParts.slice(1).join('.') : null;
    const suffix2 = highlightParts.length >= 3 ? highlightParts.slice(2).join('.') : null;

    if (suffix1 && (refValue === suffix1 || suffix1.startsWith(refValue + '.') || refValue.startsWith(suffix1 + '.'))) return true;
    if (suffix2 && refValue === suffix2) return true;

    if (content.sermonNumber && highlightParts.length >= 3) {
      const last = highlightParts[highlightParts.length - 1];
      if (refValue === `${content.sermonNumber}.${last}`) return true;
    }

    return false;
  };

  // Function to highlight a word within a specific paragraph. Returns whether a match was found.
  const highlightWordInParagraph = (paragraphDiv: Element, word: string): boolean => {
    // Find all text nodes in the paragraph and wrap the matching word
    const walker = document.createTreeWalker(
      paragraphDiv,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: Array<{ node: Text; matches: Array<{ start: number; end: number }> }> = [];
    let textNode;
    // Use case-insensitive substring matching (not word boundaries)
    // This way "adder" matches "adders", "adder's", etc.
    const wordRegex = new RegExp(word, 'gi');

    // Collect all text nodes with the word
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

    if (nodesToReplace.length === 0) return false;

    // Replace nodes with highlighted spans
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

    return true;
  };

  const allFootnotesRaw = [
    ...(content.footnotes || []),
    ...content.paragraphs.flatMap(p => p.footnotes || [])
  ];

  // Deduplicate by ID
  const allFootnotes = Array.from(new Map(allFootnotesRaw.map(fn => [fn.id, fn])).values());

  // Filter footnotes based on displayMode and content presence
  const filteredFootnotes = allFootnotes.filter(fn => {
    const hasEnglish = fn.english_translation && fn.english_translation.trim().length > 0;
    const hasArabic = fn.arabic_interpretation && fn.arabic_interpretation.trim().length > 0;

    if (displayMode === 'english-only') return hasEnglish;
    if (displayMode === 'arabic-only') return hasArabic;
    return hasEnglish || hasArabic;
  });

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

  const mainTranslation =
    content.translations?.find((t: any) => t.type === selectedTranslation) ||
    content.translations?.find((t: any) => typeof t?.text === 'string' && t.text.trim().length > 0);

  const mainTranslationText = mainTranslation?.text?.trim() || '';

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

  const editionOptionsRaw = editions
    .filter((ed: Edition) => availablePosts.some((p: Post) => {
      if (p.editions && Array.isArray(p.editions)) {
        return p.editions.some((e: any) => e.id === ed.id);
      } else if (p.editions && p.editions.id) {
        return p.editions.id === ed.id;
      }
      return false;
    }))
    .map(ed => ({
      value: ed.id.toString(),
      label: ed.title
    }));

  // Deduplicate editions based on ID
  const editionOptions = Array.from(new Map(editionOptionsRaw.map(item => [item.value, item])).values());

  if (editionOptions.length === 0 && selectedEditionId) {
    const currentEd = editions.find(e => e.id.toString() === selectedEditionId);
    if (currentEd) {
      editionOptions.push({ value: currentEd.id.toString(), label: currentEd.title });
    }
  }

  // Utility: clean unwanted HTML tags and entities from Arabic text
  const cleanArabicText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/<center>|<\/center>/gi, '')   // remove center tags
      .replace(/<span[^>]*>|<\/span>/gi, '') // remove span tags
      .replace(/&nbsp;/gi, ' ')              // replace non-breaking spaces
      .trim();
  };


  const hasParagraphSources = (paragraph: any) => {
    const s = paragraph.appendix_of_sources || paragraph.sources;
    const hasSources = s && (Array.isArray(s) ? s.length > 0 : (s.data && Array.isArray(s.data) && s.data.length > 0));
    return !!hasSources || paragraphNumbersWithSources.has(paragraph.number);
  };

  const sourcesHref = (num: string) => `/content/details/${contentType}/${content.id}/sources?num=${num}`;

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
            <div className="content-desc__tags">
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
          <div className="content-desc__controls">
            <Select
              options={displayOptions}
              value={displayMode}
              onChange={(value) => handleDisplayModeChange(value as 'both' | 'english-only' | 'arabic-only')}
              placeholder="Display Mode"
              className="content-desc__select"
            />
            {availableTranslations.length > 1 && (
              <Select
                options={translationOptions}
                value={selectedTranslation}
                onChange={setSelectedTranslation}
                placeholder="Translation"
                className="content-desc__select--narrow"
              />
            )}
          </div>

          {/* al-Sharif al-Radi's introduction to this item */}
          {radisIntroduction && (
            <div className="content-desc__radi-intro">
              {(displayMode === 'both' || displayMode === 'arabic-only') && radisIntroduction.arabic && (
                <p className="content-desc__radi-intro-arabic font-taha" dir="rtl">
                  {radisIntroduction.arabic}
                </p>
              )}
              {(displayMode === 'both' || displayMode === 'english-only') && radisIntroduction.translation && (
                <p className="content-desc__radi-intro-english">
                  {radisIntroduction.translation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sermon Number Badge */}
        {content.sermonNumber && (
          <div className="content-desc__badge-wrapper content-desc__badge-row">
            <span className="content-number-badge">
              {content.sermonNumber}
            </span>
            {hasPostLevelSources && (
              <Link href={sourcesHref(content.sermonNumber)} className="content-desc__sources-link">
                <ScrollText className="w-3.5 h-3.5" />
                Sources
              </Link>
            )}
          </div>
        )}

        {/* Main Content */}
        {(content.title || mainTranslationText) && (
          <div
            className={`content-desc__main-block ${highlightedParagraphNumber === content.sermonNumber ? 'highlight-text-ref' : ''}`}
            data-text-ref={content.sermonNumber}
          >
            <div className="content-desc__section-divider">
              {/* Arabic Title */}
              {(displayMode === 'both' || displayMode === 'arabic-only') && content.title && (
                <div className="content-desc__arabic-wrapper">
                  <div className="arabic-text-block text-align-right">
                    <p className="content-desc__arabic-line" dir="rtl">
                      {formatTextWithFootnotes(cleanArabicText(content.title), allFootnotes, true, content.sermonNumber || 'main')}
                    </p>
                  </div>
                </div>
              )}

              {/* English Translation */}
              {(displayMode === 'both' || displayMode === 'english-only') && mainTranslationText && (
                (() => {
                  const refs = extractReferences(mainTranslationText);
                  allReferences = allReferences.concat(refs);

                  return (
                    <div className="english-text-block">
                      <p className="content-desc__english-text">
                        {formatTextWithFootnotes(mainTranslationText, allFootnotes, false, content.sermonNumber || 'main')}
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
          <div className="content-desc__paragraphs">
            {sortedParagraphs.map((paragraph) => {
              const englishTranslation =
                paragraph.translations?.find((t: any) => t.type === selectedTranslation) ||
                paragraph.translations?.find((t: any) => typeof t?.text === 'string' && t.text.trim().length > 0);
              const englishTranslationText = englishTranslation?.text?.trim() || '';

              return (
                <div
                  key={paragraph.id}
                  data-text-ref={paragraph.number}
                  className={`content-desc__paragraph ${isHighlightedTextRef(paragraph.number) ? 'highlight-text-ref' : ''}`}
                >
                  {/* Paragraph Number */}
                  {paragraph.number && (
                    <div className="content-desc__para-badge content-desc__badge-row">
                      <span className="content-number-badge">
                        {paragraph.number}
                      </span>
                      {hasParagraphSources(paragraph) && (
                        <Link href={sourcesHref(paragraph.number)} className="content-desc__sources-link">
                          <ScrollText className="w-3.5 h-3.5" />
                          Sources
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Arabic Text */}
                  {(displayMode === 'both' || displayMode === 'arabic-only') && paragraph.arabic && (() => {
                    const lines = paragraph.arabic.split(/\n+/).filter(Boolean);

                    return (
                      <div className="content-desc__arabic-wrapper">
                        <div className="arabic-text-block">
                          {lines.map((line: string, index: number) => {
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
                                  className={`content-desc__arabic-line ${isCentered ? 'content-desc__arabic-line--centered' : ''}`}
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
                  {(displayMode === 'both' || displayMode === 'english-only') && englishTranslationText && (() => {
                    const refs = extractReferences(englishTranslationText);
                    allReferences = allReferences.concat(refs);

                    return (
                      <div className="english-text-block">
                        <p className="content-desc__english-text">
                          {formatTextWithFootnotes(englishTranslationText, allFootnotes, false, paragraph.number)}
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
        {sortedParagraphs.length === 0 && !(content.title || mainTranslationText) && (
          <div className="content-desc__empty">
            <p className="content-desc__empty-text">No content available for this {contentType.slice(0, -1)}.</p>
          </div>
        )}

        {/* Footnotes */}
        {filteredFootnotes.length > 0 && (
          <div className="content-footnotes">
            <h2 className="content-footnotes__title">
              <Book className="w-5 h-5 content-footnotes__title-icon" />
              Footnotes
            </h2>
            <div className="content-footnotes__list">
              {filteredFootnotes
                .sort((a: Footnote, b: Footnote) => {
                  const parse = (s: string) => s.split('.').map(n => parseInt(n) || 0);
                  const ap = parse(a.number);
                  const bp = parse(b.number);
                  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
                    if ((ap[i] || 0) !== (bp[i] || 0)) return (ap[i] || 0) - (bp[i] || 0);
                  }
                  return 0;
                })
                .map((footnote: Footnote) => {
                  const hasEnglish = !!footnote.english_translation && footnote.english_translation.trim() !== '';
                  const hasArabic = !!footnote.arabic_interpretation && footnote.arabic_interpretation.trim() !== '';
                  return (
                    <div
                      key={footnote.id}
                      id={`footnote-${footnote.id}`}
                      className="content-footnotes__item group"
                      onClick={() => {
                        // Scroll to the footnote's marker in the text (English preferred, then Arabic)
                        const englishRef = document.getElementById(`footnote-ref-${footnote.id}-english`);
                        const arabicRef = document.getElementById(`footnote-ref-${footnote.id}-arabic`);
                        const target = englishRef || arabicRef || document.querySelector(`[data-text-ref="${footnote.number}"]`);

                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          if (englishRef || arabicRef) {
                            const pulseEl = (englishRef || arabicRef) as HTMLElement;
                            pulseEl.classList.add('content-footnotes__ref-pulse');
                            setTimeout(() => {
                              pulseEl.classList.remove('content-footnotes__ref-pulse');
                            }, 2000);
                          }
                        }
                      }}
                    >
                      <span className="content-footnotes__number">
                        {footnote.number.split('.').pop()}
                      </span>
                      <div className="content-footnotes__body">
                        {(displayMode === 'both' || displayMode === 'english-only') && hasEnglish && (
                          <p className="content-footnotes__english font-brill">
                            {footnote.english_translation}
                          </p>
                        )}
                        {(displayMode === 'both' || displayMode === 'arabic-only') && hasArabic && (
                          <p
                            className={`content-footnotes__arabic font-taha ${displayMode === 'both' && hasEnglish ? 'content-footnotes__arabic--divided' : ''}`}
                            dir="rtl"
                          >
                            {footnote.arabic_interpretation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDescription;

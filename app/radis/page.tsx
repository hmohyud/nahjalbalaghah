'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { radisApi, RadisIntroduction, RadisApiResponse } from '@/api/posts';
import { Search, GitCompare, Book } from 'lucide-react';
import { Button, Input } from '@/app/components/ui';
import { useTextRefHighlight } from '@/app/hooks/useTextRefHighlight';
import { ManuscriptComparisonModal } from '@/app/components/manuscripts';
import Link from 'next/link';

function RadisContent() {
  const [radisIntroductions, setRadisIntroductions] = useState<RadisIntroduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedRadisForComparison, setSelectedRadisForComparison] = useState<RadisIntroduction | null>(null);

  const { scrollToAndHighlight } = useTextRefHighlight({
    onHighlight: (ref) => {
      console.log('Highlighting ref:', ref);
    }
  });

  useEffect(() => {
    fetchRadisIntroductions();
  }, []);

  const fetchRadisIntroductions = async () => {
    try {
      setLoading(true);
      const response: RadisApiResponse = await radisApi.getRadisIntroductions();
      setRadisIntroductions(response.data);
      setError(null);

      const urlParams = new URLSearchParams(window.location.search);
      const highlightRef = urlParams.get('highlightRef');
      const word = urlParams.get('word');

      if (highlightRef) {
        setTimeout(() => {
          scrollToAndHighlight(highlightRef);
          if (word) {
            const element = document.querySelector(`[data-text-ref="${highlightRef}"]`);
            if (element) {
              const translationContainer = element.querySelector('.font-brill');
              if (translationContainer) {
                highlightWordInElement(translationContainer, word);
              }
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error('Error fetching radis introductions:', err);
      setError("Failed to load Radi's introductions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchRadisIntroductions();
      return;
    }

    try {
      setIsSearching(true);
      const response = await radisApi.searchRadisIntroductions(searchQuery);
      setRadisIntroductions(response.data);
    } catch (err) {
      console.error('Error searching radis introductions:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchRadisIntroductions();
  };

  const highlightWordInElement = (element: Element, word: string) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
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
          const afterNode = document.createTextNode(after);
          node.parentNode?.insertBefore(span, node.nextSibling);
          node.parentNode?.insertBefore(afterNode, span.nextSibling);
        } else {
          node.parentNode?.insertBefore(span, node.nextSibling);
        }
        node.textContent = before;
      }
    }
  };

  if (loading) {
    return (
      <div className="static-page">
        <div className="static-page__loading">
          <div className="static-page__loading-inner">
            <div className="static-page__spinner"></div>
            <p className="static-page__loading-text">Loading Radi's introductions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="static-page">
        <div className="static-page__loading">
          <div className="static-page__loading-inner">
            <p className="static-page__error-text">{error}</p>
            <Button onClick={fetchRadisIntroductions}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="static-page">
      {/* Hero Section */}
      <div className="static-page__hero">
        {/* Decorative corners */}
        <div className="static-page__hero-corner static-page__hero-corner--tl" />
        <div className="static-page__hero-corner static-page__hero-corner--tr" />
        <div className="static-page__hero-corner static-page__hero-corner--bl" />
        <div className="static-page__hero-corner static-page__hero-corner--br" />

        <div className="static-page__hero-inner">
          {/* Arabic Title */}
          <div className="static-page__arabic-title">
            مقدمة الرضي
          </div>

          {/* Decorative Ornament */}
          <div className="static-page__ornament">
            <div className="static-page__ornament-line--right" />
            <div className="static-page__ornament-diamond" />
            <div className="static-page__ornament-line--left" />
          </div>

          <h1 className="static-page__title">
            Radi's Introduction
          </h1>

          <p className="static-page__subtitle static-page__subtitle--white">
            The enlightening introduction by al-Sharif al-Radi, compiler of Nahj al-Balaghah,
            explaining his methodology and the profound wisdom contained within.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="static-page__search">
        <form onSubmit={handleSearch} className="static-page__search-form">
          <div className="static-page__search-input">
            <Input
              type="text"
              placeholder="Search in Arabic or English..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button type="submit" disabled={isSearching} icon={<Search size={16} />}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {searchQuery && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Content Section */}
      <div className="static-page__content">
        {radisIntroductions.length === 0 ? (
          <div className="static-page__content-empty">
            <p className="static-page__content-empty-text">
              {searchQuery ? 'No results found for your search.' : 'No introductions available.'}
            </p>
          </div>
        ) : (
          <div className="static-page__content-list">
            {radisIntroductions.map((radis) => (
              <div
                key={radis.id}
                id={`radis-${radis.number}`}
                data-text-ref={radis.number}
                className="group static-page__card"
              >
                {/* Corner accents on hover */}
                <div className="static-page__card-corner static-page__card-corner--tl" />
                <div className="static-page__card-corner static-page__card-corner--br" />

                <div className="static-page__card-inner">
                  {/* Header */}
                  <div className="static-page__card-header">
                    <div className="static-page__card-title-group">
                      <div className="static-page__card-number">
                        {radis.number}
                      </div>
                      <h3 className="static-page__card-title">
                        Introduction {radis.number}
                      </h3>
                    </div>
                    <div className="static-page__card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<GitCompare className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedRadisForComparison(radis);
                          setIsComparisonModalOpen(true);
                        }}
                      >
                        Compare Manuscripts
                      </Button>
                      <Link href={`/manuscripts?section=${radis.number.startsWith('0.') ? radis.number : `0.${radis.number}`}`}>
                        <Button variant="outline" size="sm" icon={<Book className="w-4 h-4" />}>
                          View Manuscripts
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="static-page__card-arabic">
                    <div
                      className="static-page__card-arabic-text"
                      dir="rtl"
                    >
                      {radis.arabic}
                    </div>
                  </div>

                  {/* Translation */}
                  {radis.translation && (
                    <div className="static-page__card-translation">
                      <div className="static-page__card-translation-text">
                        {radis.translation.split('<center>').map((part, idx) => {
                          if (part.includes('</center>')) {
                            const [centeredText, rest] = part.split('</center>');
                            return (
                              <React.Fragment key={idx}>
                                <div className="static-page__card-centered-text">{centeredText.trim()}</div>
                                {rest && <div className="static-page__card-paragraph">{rest.trim()}</div>}
                              </React.Fragment>
                            );
                          } else {
                            return <div key={idx} className="static-page__card-paragraph">{part.trim()}</div>;
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manuscript Comparison Modal */}
      {selectedRadisForComparison && (
        <ManuscriptComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => {
            setIsComparisonModalOpen(false);
            setSelectedRadisForComparison(null);
          }}
          content={{
            id: selectedRadisForComparison.id,
            number: selectedRadisForComparison.number,
            arabic: selectedRadisForComparison.arabic,
            translation: selectedRadisForComparison.translation,
            heading: `Introduction ${selectedRadisForComparison.number}`,
            sermonNumber: `0.${selectedRadisForComparison.number}`,
            paragraphs: [],
            title: undefined,
            translations: undefined,
            footnotes: []
          }}
          contentType="radis"
        />
      )}
    </div>
  );
}

export default function RadisPage() {
  return (
    <Suspense fallback={
      <div className="static-page__fallback">
        <div className="static-page__spinner"></div>
      </div>
    }>
      <RadisContent />
    </Suspense>
  );
}

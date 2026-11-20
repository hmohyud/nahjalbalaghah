'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { conclusionsApi, Conclusion } from '@/api/posts';
import { Search, GitCompare, Book } from 'lucide-react';
import { Button, Input } from '@/app/components/ui';
import { useTextRefHighlight } from '@/app/hooks/useTextRefHighlight';
import { ManuscriptComparisonModal } from '@/app/components/manuscripts';
import Link from 'next/link';

function ConclusionsContent() {
  const [conclusions, setConclusions] = useState<Conclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [selectedConclusionForComparison, setSelectedConclusionForComparison] = useState<Conclusion | null>(null);

  const { scrollToAndHighlight } = useTextRefHighlight({
    onHighlight: (ref) => {
      console.log('Highlighting ref:', ref);
    }
  });

  useEffect(() => {
    fetchConclusions();
  }, []);

  const fetchConclusions = async () => {
    try {
      setLoading(true);
      const response = await conclusionsApi.getConclusions();
      setConclusions(response.data);
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
      console.error('Error fetching conclusions:', err);
      setError("Failed to load conclusions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchConclusions();
      return;
    }

    try {
      setIsSearching(true);
      const response = await conclusionsApi.searchConclusions(searchQuery);
      setConclusions(response.data);
    } catch (err) {
      console.error('Error searching conclusions:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchConclusions();
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
            <p className="static-page__loading-text">Loading conclusions...</p>
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
            <Button onClick={fetchConclusions}>Try Again</Button>
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
          <div className="static-page__arabic-title" dir="rtl">
            خاتمة
          </div>

          {/* Decorative Ornament */}
          <div className="static-page__ornament">
            <div className="static-page__ornament-line--right" />
            <div className="static-page__ornament-diamond" />
            <div className="static-page__ornament-line--left" />
          </div>

          <h1 className="static-page__title">
            Conclusion
          </h1>

          <p className="static-page__subtitle static-page__subtitle--white">
            Al-Sharīf al-Raḍī's closing words to his compilation of Nahj al-Balaghah.
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
        {conclusions.length === 0 ? (
          <div className="static-page__content-empty">
            <p className="static-page__content-empty-text">
              {searchQuery ? 'No results found for your search.' : 'No conclusions available.'}
            </p>
          </div>
        ) : (
          <div className="static-page__content-list">
            {conclusions.map((conclusion) => (
              <div
                key={conclusion.id}
                id={`conclusion-${conclusion.number}`}
                data-text-ref={conclusion.number}
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
                        {conclusion.number}
                      </div>
                      <h3 className="static-page__card-title">
                        Conclusion {conclusion.number}
                      </h3>
                    </div>
                    <div className="static-page__card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<GitCompare className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedConclusionForComparison(conclusion);
                          setIsComparisonModalOpen(true);
                        }}
                      >
                        Compare Manuscripts
                      </Button>
                      <Link href={`/manuscripts/view?section=${conclusion.number.startsWith('0.') ? conclusion.number : `0.${conclusion.number}`}`}>
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
                      {conclusion.arabic.split('\n').map((line, idx) => (
                        <div key={idx} className={idx > 0 ? 'static-page__card-paragraph' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Translation */}
                  {conclusion.translation && (
                    <div className="static-page__card-translation">
                      <div className="static-page__card-translation-text">
                        {conclusion.translation.split('\n').map((line, idx) => {
                          // Closing invocation lines are rendered with a hanging indent
                          const isIndentedText = line.includes('I seek my direction from God') ||
                            line.includes('I write this in the month of Rajab');
                          return (
                            <div
                              key={idx}
                              className={idx > 0 ? 'static-page__card-paragraph' : ''}
                              style={isIndentedText ? { marginLeft: '2rem', textIndent: '-2rem' } : undefined}
                            >
                              {line}
                            </div>
                          );
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
      {selectedConclusionForComparison && (
        <ManuscriptComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => {
            setIsComparisonModalOpen(false);
            setSelectedConclusionForComparison(null);
          }}
          content={{
            id: selectedConclusionForComparison.id,
            number: selectedConclusionForComparison.number,
            arabic: selectedConclusionForComparison.arabic,
            translation: selectedConclusionForComparison.translation,
            heading: `Conclusion ${selectedConclusionForComparison.number}`,
            sermonNumber: `0.${selectedConclusionForComparison.number}`,
            paragraphs: [],
            title: undefined,
            translations: undefined,
            footnotes: []
          }}
          contentType="conclusion"
        />
      )}
    </div>
  );
}

export default function ConclusionsPage() {
  return (
    <Suspense fallback={
      <div className="static-page__fallback">
        <div className="static-page__spinner"></div>
      </div>
    }>
      <ConclusionsContent />
    </Suspense>
  );
}

'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { radisApi, RadisIntroduction, RadisApiResponse } from '@/api/posts';
import { Search, GitCompare, Book } from 'lucide-react';
import Button from '@/app/components/button';
import Input from '@/app/components/input';
import { useTextRefHighlight } from '@/app/hooks/useTextRefHighlight';
import ManuscriptComparisonModal from '@/app/components/manuscript-comparison-modal';
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
      <div className="min-h-screen bg-[var(--color-parchment)]">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-warm-gray)] font-body">Loading Radi's introductions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)]">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center">
            <p className="text-red-600 mb-4 font-body">{error}</p>
            <Button onClick={fetchRadisIntroductions}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      {/* Hero Section */}
      <div className="relative bg-[var(--color-primary)] text-white overflow-hidden pt-32 lg:pt-36">
        {/* Decorative corners */}
        <div className="absolute top-32 lg:top-36 left-8 w-16 h-16 border-l border-t border-[var(--color-accent)]/30" />
        <div className="absolute top-32 lg:top-36 right-8 w-16 h-16 border-r border-t border-[var(--color-accent)]/30" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-[var(--color-accent)]/30" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[var(--color-accent)]/30" />
        
        <div className="max-w-5xl mx-auto px-6 py-16 lg:py-20 text-center relative">
          {/* Arabic Title */}
          <div className="font-taha text-4xl lg:text-5xl mb-4 text-white/90">
            مقدمة الرضي
          </div>
          
          {/* Decorative Ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>

          <h1 className="font-display text-4xl lg:text-6xl font-light mb-6">
            Radi's Introduction
          </h1>
          
          <p className="font-body text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            The enlightening introduction by al-Sharif al-Radi, compiler of Nahj al-Balaghah,
            explaining his methodology and the profound wisdom contained within.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
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
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {radisIntroductions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-warm-gray)] font-body text-lg">
              {searchQuery ? 'No results found for your search.' : 'No introductions available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {radisIntroductions.map((radis) => (
              <div
                key={radis.id}
                id={`radis-${radis.number}`}
                data-text-ref={radis.number}
                className="group relative bg-white border border-[var(--color-stone)] transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-lg"
              >
                {/* Corner accents on hover */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />

                <div className="p-8 lg:p-10">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--color-primary)] text-white flex items-center justify-center font-display text-lg">
                        {radis.number}
                      </div>
                      <h3 className="font-display text-2xl text-[var(--color-ink)]">
                        Introduction {radis.number}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
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
                  <div className="mb-8">
                    <div
                      className="text-right text-xl lg:text-2xl leading-[2] text-[var(--color-ink)] font-taha"
                      dir="rtl"
                    >
                      {radis.arabic}
                    </div>
                  </div>

                  {/* Translation */}
                  {radis.translation && (
                    <div className="border-t border-[var(--color-stone)] pt-8">
                      <div className="text-[var(--color-charcoal)] text-base lg:text-lg leading-relaxed font-body">
                        {radis.translation.split('<center>').map((part, idx) => {
                          if (part.includes('</center>')) {
                            const [centeredText, rest] = part.split('</center>');
                            return (
                              <React.Fragment key={idx}>
                                <div className="my-8 text-center italic font-display text-lg">{centeredText.trim()}</div>
                                {rest && <div className="my-4">{rest.trim()}</div>}
                              </React.Fragment>
                            );
                          } else {
                            return <div key={idx} className="my-4">{part.trim()}</div>;
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
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    }>
      <RadisContent />
    </Suspense>
  );
}

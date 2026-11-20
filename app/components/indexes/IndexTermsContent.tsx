'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Book, ArrowRight, Languages } from 'lucide-react';
import { indexTermsApi, IndexTerm, IndexTermsFilters } from '@/api';
import { Button, Input } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';
import { normalizeForSort } from '@/app/utils/text-formatting';

export default function IndexTermsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedFilters: IndexTermsFilters = {
    word_english: searchParams.get('word_english') || '',
    startsWith_english: searchParams.get('startsWith_english') || '',
    language: 'English',
  };

  const [allTerms, setAllTerms] = useState<IndexTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<IndexTermsFilters>(appliedFilters);

  useEffect(() => {
    setFilters({
      word_english: searchParams.get('word_english') || '',
      startsWith_english: searchParams.get('startsWith_english') || '',
      language: 'English',
    });
  }, [searchParams]);

  const pageSize = 20;

  // Initialize: Fetch ALL items once
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await indexTermsApi.getAllIndexTerms();
        setAllTerms(data);
      } catch (err) {
        setError('Failed to load index terms. Please try again later.');
        console.error('Error fetching index terms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Local Filter Logic
  const filteredTerms = React.useMemo(() => {
    let result = [...allTerms];

    const { word_english, startsWith_english } = appliedFilters;

    result = result.filter(item => item.word_english && item.word_english.trim() !== '');

    // Search Filter
    if (word_english) {
      const q = word_english.toLowerCase();
      result = result.filter(item => item.word_english.toLowerCase().includes(q));
    }

    // Alphabet Filter
    if (startsWith_english) {
      const letter = startsWith_english.toLowerCase();
      result = result.filter(item => {
        return normalizeForSort(item.word_english).startsWith(letter);
      });
    }

    // Sort Alphabetically
    result.sort((a, b) => {
      const wordA = a.word_english || '';
      const wordB = b.word_english || '';
      return normalizeForSort(wordA).localeCompare(normalizeForSort(wordB));
    });

    return result;
  }, [allTerms, appliedFilters]);

  // Pagination totals
  const total = filteredTerms.length;
  const totalPages = Math.ceil(total / pageSize);
  const terms = filteredTerms.slice((page - 1) * pageSize, page * pageSize);

  const handleApplyFilters = (newFilters?: IndexTermsFilters) => {
    const filtersToUse = newFilters || filters;
    const params = new URLSearchParams();
    if (filtersToUse.word_english) params.set('word_english', filtersToUse.word_english);
    if (filtersToUse.startsWith_english) params.set('startsWith_english', filtersToUse.startsWith_english);

    params.set('page', '1');
    if (params.toString() !== searchParams.toString()) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    // Only reset to page 1 when a filter actually changed (not on page changes)
    const filtersChanged = (Object.keys(filters) as (keyof typeof filters)[])
      .some(key => (filters[key] ?? "") !== (appliedFilters[key] ?? ""));
    if (!filtersChanged) return;

    const timeout = window.setTimeout(() => {
      handleApplyFilters(filters);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      word_english: '',
      startsWith_english: '',
      language: 'English',
    });
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = appliedFilters.word_english || appliedFilters.startsWith_english;

  const handleLetterSelect = (letter: string) => {
    const updatedFilters = { ...filters, startsWith_english: letter };
    setFilters(updatedFilters);
    handleApplyFilters(updatedFilters);
  };

  return (
    <div className="index-content">
      {/* Hero Section */}
      <div className="index-content__hero">
        <div className="index-content__container">
          <div className="index-content__header">
            <div className="index-content__icon-box">
              <Languages className="w-6 h-6" />
            </div>
            <h1 className="index-content__title">
              Index of Terms (English)
            </h1>
          </div>
          <p className="index-content__subtitle">
            Discover the rich vocabulary and terminology used by Imam Ali (AS) in Nahj al-Balaghah
          </p>
        </div>
      </div>

      <div className="index-content__body">
        {/* Filter Section */}
        <div className="index-content__filter-wrapper">
          <div className="index-content__filter-panel">
            <div className="index-content__corner-tl" />
            <div className="index-content__corner-br" />

            <div className="index-content__filter-inner">
              <div className="index-content__filter-header">
                <h2 className="index-content__filter-title">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant='danger'
                    icon={<X className="w-4 h-4" />}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="index-content__filter-grid-2">
                <Input
                  label="English Word"
                  placeholder="Search English word..."
                  value={filters.word_english}
                  onChange={(e) => setFilters({ ...filters, word_english: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alphabet Chips */}
        <div className="index-content__alphabet">
          <AlphabetChips
            selectedLetter={filters.startsWith_english || ''}
            onSelectLetter={handleLetterSelect}
            language="English"
          />
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <>
              {/* Desktop Loading */}
              <div className="index-content__desktop-only">
                <div className="index-content__table-card">
                  <div className="index-content__corner-tl" />
                  <div className="index-content__corner-br" />
                  <table className="index-content__table">
                    <colgroup>
                      <col className="index-content__col-sm" />
                      <col className="index-content__col-quarter" />
                      <col />
                    </colgroup>
                    <thead className="index-content__thead">
                      <tr>
                        <th className="index-content__th">Section</th>
                        <th className="index-content__th">English Word</th>
                        <th className="index-content__th index-content__th--center">Text References</th>
                      </tr>
                    </thead>
                    <tbody className="index-content__tbody">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="index-content__tr--pulse">
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1.25rem', width: '8rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton-refs">
                              <div className="index-content__skeleton" style={{ height: '1.75rem', width: '4rem' }}></div>
                              <div className="index-content__skeleton" style={{ height: '1.75rem', width: '4rem' }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Loading */}
              <div className="index-content__mobile-only">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="index-content__skeleton-card">
                    <div className="index-content__corner-tl--sm" />
                    <div className="index-content__corner-br--sm" />
                    <div className="index-content__skeleton-card-inner">
                      <div className="index-content__skeleton" style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0 }}></div>
                      <div className="index-content__mobile-card-content">
                        <div className="index-content__skeleton" style={{ height: '1.25rem', width: '8rem', marginBottom: '0.5rem' }}></div>
                        <div className="index-content__skeleton" style={{ height: '1rem', width: '6rem' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : error ? (
            <div className="index-content__state-wrapper">
              <div className="index-content__state-card">
                <div className="index-content__corner-tl" />
                <div className="index-content__corner-br" />
                <div className="index-content__error-icon">
                  <X className="w-12 h-12" />
                </div>
                <h3 className="index-content__state-heading">Error</h3>
                <p className="index-content__state-text">{error}</p>
                <Button onClick={() => window.location.reload()} variant='solid' className="index-content__retry-btn">
                  Try Again
                </Button>
              </div>
            </div>
          ) : terms.length === 0 ? (
            <div className="index-content__state-wrapper">
              <div className="index-content__state-card">
                <div className="index-content__corner-tl" />
                <div className="index-content__corner-br" />
                <div className="index-content__empty-icon">
                  <Book className="w-16 h-16" />
                </div>
                <h3 className="index-content__state-heading">No terms found</h3>
                <p className="index-content__state-text--sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <>
              <div className="index-content__results-bar">
                <div className="index-content__results-count">
                  Showing <span className="index-content__results-count-bold">{(page - 1) * pageSize + 1}</span>-<span className="index-content__results-count-bold">{Math.min(page * pageSize, total)}</span> of <span className="index-content__results-count-bold">{total}</span> terms
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                )}
              </div>

              {/* Desktop Table */}
              <div className="index-content__desktop-only">
                <div className="index-content__table-card">
                  <div className="index-content__corner-tl" />
                  <div className="index-content__corner-br" />
                  <div className="index-content__table-scroll">
                    <table className="index-content__table" dir="ltr">
                      <colgroup>
                        <col className="index-content__col-sm" />
                        <col className="index-content__col-quarter" />
                        <col />
                      </colgroup>
                      <thead className="index-content__thead">
                        <tr>
                          <th className="index-content__th">Section</th>
                          <th className="index-content__th">English Word</th>
                          <th className="index-content__th index-content__th--center">Text References</th>
                        </tr>
                      </thead>
                      <tbody className="index-content__tbody">
                        {terms.map((term) => {
                          const word = term.word_english;
                          const refs = term.text_numbers?.map(t => t.value).join(',') || '';
                          const targetUrl = word
                            ? `/indexes/terms/${encodeURIComponent(word)}?${new URLSearchParams({
                                ...(refs ? { refs } : {}),
                                entry: term.documentId,
                              }).toString()}`
                            : '#';

                          return (
                            <tr
                              key={term.id}
                              className="index-content__tr"
                              onClick={() => word && router.push(targetUrl)}
                            >
                              <td className="index-content__td">
                                <span className="index-content__section-badge">
                                  {term.section}
                                </span>
                              </td>
                              <td className="index-content__td--hoverable">
                                {term.word_english || '-'}
                              </td>
                              <td className="index-content__td">
                                <div className="index-content__arrow-cell">
                                  <div className="index-content__arrow-btn">
                                    <ArrowRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="index-content__mobile-only">
                {terms.map((term) => {
                  const word = term.word_english;
                  const refs = term.text_numbers?.map(t => t.value).join(',') || '';
                  const targetUrl = word
                    ? `/indexes/terms/${encodeURIComponent(word)}?${new URLSearchParams({
                        ...(refs ? { refs } : {}),
                        entry: term.documentId,
                      }).toString()}`
                    : '#';

                  return (
                    <div
                      key={term.id}
                      className="index-content__mobile-card"
                      onClick={() => word && router.push(targetUrl)}
                      dir="ltr"
                    >
                      <div className="index-content__corner-tl--hover" />
                      <div className="index-content__corner-br--hover" />
                      <div className="index-content__mobile-card-inner">
                        <span className="index-content__section-badge--inline">
                          {term.section}
                        </span>
                        <div className="index-content__mobile-card-content">
                          <div className="index-content__mobile-card-word">
                            {term.word_english || '-'}
                          </div>
                        </div>
                        <div className="index-content__arrow-btn">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="index-content__pagination">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

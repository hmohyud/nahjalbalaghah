'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Book, ArrowRight, Scale } from 'lucide-react';
import { religiousConceptsApi, ReligiousConcept, ReligiousConceptsFilters } from '@/api';
import { Button, Input, Select } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';

export default function ReligiousConceptsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedFilters: ReligiousConceptsFilters = {
    word_english: searchParams.get('word_english') || '',
    word_arabic: searchParams.get('word_arabic') || '',
    startsWith_english: searchParams.get('startsWith_english') || '',
    startsWith_arabic: searchParams.get('startsWith_arabic') || '',
    language: (searchParams.get('language') as 'English' | 'Arabic') || 'Arabic',
  };

  const [items, setItems] = useState<ReligiousConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<ReligiousConceptsFilters>(appliedFilters);

  useEffect(() => {
    setFilters({
      word_english: searchParams.get('word_english') || '',
      word_arabic: searchParams.get('word_arabic') || '',
      startsWith_english: searchParams.get('startsWith_english') || '',
      startsWith_arabic: searchParams.get('startsWith_arabic') || '',
      language: (searchParams.get('language') as 'English' | 'Arabic') || 'Arabic',
    });
  }, [searchParams]);

  const pageSize = 20;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterParams: ReligiousConceptsFilters = {};
        if (appliedFilters.word_english) filterParams.word_english = appliedFilters.word_english;
        if (appliedFilters.word_arabic) filterParams.word_arabic = appliedFilters.word_arabic;
        if (appliedFilters.startsWith_english) filterParams.startsWith_english = appliedFilters.startsWith_english;
        if (appliedFilters.startsWith_arabic) filterParams.startsWith_arabic = appliedFilters.startsWith_arabic;
        if (appliedFilters.language) filterParams.language = appliedFilters.language;

        const response = await religiousConceptsApi.getReligiousConcepts(page, pageSize, filterParams);
        setItems(response.data);
        setTotalPages(response.meta.pagination.pageCount);
        setTotal(response.meta.pagination.total);
      } catch (err) {
        setError('Failed to load religious concepts. Please try again later.');
        console.error('Error fetching religious concepts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, appliedFilters.word_english, appliedFilters.word_arabic, appliedFilters.startsWith_english, appliedFilters.startsWith_arabic, appliedFilters.language]);

  const handleApplyFilters = (newFilters?: ReligiousConceptsFilters) => {
    const filtersToUse = newFilters || filters;
    const params = new URLSearchParams();
    if (filtersToUse.word_english) params.set('word_english', filtersToUse.word_english);
    if (filtersToUse.word_arabic) params.set('word_arabic', filtersToUse.word_arabic);
    if (filtersToUse.startsWith_english) params.set('startsWith_english', filtersToUse.startsWith_english);
    if (filtersToUse.startsWith_arabic) params.set('startsWith_arabic', filtersToUse.startsWith_arabic);
    if (filtersToUse.language && filtersToUse.language !== 'Arabic') params.set('language', filtersToUse.language);

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      word_english: '',
      word_arabic: '',
      startsWith_english: '',
      startsWith_arabic: '',
      language: 'Arabic',
    });
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = appliedFilters.word_english || appliedFilters.word_arabic || appliedFilters.startsWith_english || appliedFilters.startsWith_arabic || appliedFilters.language !== 'Arabic';

  const handleLetterSelect = (letter: string) => {
    const updatedFilters = { ...filters };
    if (filters.language === 'English') {
      updatedFilters.startsWith_english = letter;
      updatedFilters.startsWith_arabic = '';
    } else {
      updatedFilters.startsWith_arabic = letter;
      updatedFilters.startsWith_english = '';
    }
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
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="index-content__title">
              Index of Religious &amp; Ethical Concepts
            </h1>
          </div>
          <p className="index-content__subtitle">
            Explore the religious and ethical concepts found in Nahj al-Balaghah
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
                <div>
                  <label className="index-content__filter-label">Language</label>
                  <Select
                    value={filters.language || 'Arabic'}
                    onChange={(value) => setFilters({ ...filters, language: value as 'English' | 'Arabic' })}
                    options={[
                      { value: 'Arabic', label: 'Arabic' }
                    ]}
                    placeholder="Select Language"
                  />
                </div>
                {filters.language === 'English' ? (
                  <Input
                    label="English Word"
                    placeholder="Search English..."
                    value={filters.word_english}
                    onChange={(e) => setFilters({ ...filters, word_english: e.target.value })}
                  />
                ) : (
                  <Input
                    label="Arabic Word"
                    placeholder="Search Arabic..."
                    value={filters.word_arabic}
                    onChange={(e) => setFilters({ ...filters, word_arabic: e.target.value })}
                    className="text-align-right"
                    dir="rtl"
                  />
                )}
              </div>
              <div className="index-content__filter-actions">
                <Button
                  onClick={() => handleApplyFilters()}
                  variant='outlined'
                  icon={<Search className="w-4 h-4" />}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Alphabet Chips */}
        <div className="index-content__alphabet">
          <AlphabetChips
            selectedLetter={filters.language === 'English' ? (filters.startsWith_english || '') : (filters.startsWith_arabic || '')}
            onSelectLetter={handleLetterSelect}
            language={filters.language || 'English'}
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
                      {appliedFilters.language === 'English' && <col className="index-content__col-quarter" />}
                      {appliedFilters.language === 'Arabic' && <col className="index-content__col-fifth" />}
                      <col />
                    </colgroup>
                    <thead className="index-content__thead">
                      <tr>
                        <th className="index-content__th">Section</th>
                        {appliedFilters.language === 'English' && <th className="index-content__th">English</th>}
                        {appliedFilters.language === 'Arabic' && <th className="index-content__th index-content__th--right index-content__th--nowrap">Arabic</th>}
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
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '75%' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton-refs--wrap">
                              <div className="index-content__skeleton" style={{ height: '1.5rem', width: '3rem' }}></div>
                              <div className="index-content__skeleton" style={{ height: '1.5rem', width: '3rem' }}></div>
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
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="index-content__skeleton-card">
                    <div className="index-content__corner-tl--sm" />
                    <div className="index-content__corner-br--sm" />
                    <div className="index-content__skeleton-card-row">
                      <div className="index-content__mobile-card-content">
                        <div className="index-content__skeleton" style={{ height: '1.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
                        <div className="index-content__skeleton" style={{ height: '1rem', width: '50%' }}></div>
                      </div>
                      <div className="index-content__skeleton" style={{ width: '2rem', height: '2rem' }}></div>
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
          ) : items.length === 0 ? (
            <div className="index-content__state-wrapper">
              <div className="index-content__state-card">
                <div className="index-content__corner-tl" />
                <div className="index-content__corner-br" />
                <div className="index-content__empty-icon">
                  <Book className="w-16 h-16" />
                </div>
                <h3 className="index-content__state-heading">No Results Found</h3>
                <p className="index-content__state-text">Try adjusting your filters or search criteria.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="index-content__results-count">
                Showing {items.length} of {total} results
              </div>
              {/* Desktop Table */}
              <div className="index-content__desktop-only">
                <div className="index-content__table-card">
                  <div className="index-content__corner-tl" />
                  <div className="index-content__corner-br" />
                  <div className="index-content__table-scroll">
                    <table className="index-content__table">
                      <colgroup>
                        <col className="index-content__col-sm" />
                        {appliedFilters.language === 'English' && <col className="index-content__col-quarter" />}
                        {appliedFilters.language === 'Arabic' && <col className="index-content__col-fifth" />}
                        <col />
                      </colgroup>
                      <thead className="index-content__thead">
                        <tr>
                          <th className="index-content__th">Section</th>
                          {appliedFilters.language === 'English' && <th className="index-content__th">English</th>}
                          {appliedFilters.language === 'Arabic' && <th className="index-content__th index-content__th--right index-content__th--nowrap">Arabic</th>}
                          <th className="index-content__th index-content__th--center">Text References</th>
                        </tr>
                      </thead>
                      <tbody className="index-content__tbody">
                        {items.map((item) => {
                          const name = appliedFilters.language === 'Arabic' ? item.word_arabic : item.word_english;
                          const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                          const targetUrl = name
                            ? `/indexes/religious-concepts/${encodeURIComponent(name)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`
                            : '#';

                          return (
                            <tr
                              key={item.id}
                              className="index-content__tr"
                              onClick={() => name && router.push(targetUrl)}
                            >
                              <td className="index-content__td">
                                <div className="index-content__section-badge--alt">
                                  {item.section || '-'}
                                </div>
                              </td>
                              {appliedFilters.language === 'English' && (
                                <td className="index-content__td">
                                  <span className="index-content__cell-word">
                                    {item.word_english || '-'}
                                  </span>
                                </td>
                              )}
                              {appliedFilters.language === 'Arabic' && (
                                <td className="index-content__td index-content__td--right" dir="rtl">
                                  <span className="index-content__cell-word">
                                    {item.word_arabic || '-'}
                                  </span>
                                </td>
                              )}
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
                {items.map((item) => {
                  const name = appliedFilters.language === 'Arabic' ? item.word_arabic : item.word_english;
                  const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                  const targetUrl = name
                    ? `/indexes/religious-concepts/${encodeURIComponent(name)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`
                    : '#';

                  return (
                    <div
                      key={item.id}
                      className="index-content__mobile-card"
                      onClick={() => name && router.push(targetUrl)}
                    >
                      <div className="index-content__corner-tl--hover" />
                      <div className="index-content__corner-br--hover" />
                      <div className="index-content__mobile-card-inner">
                        <div className="index-content__mobile-card-content">
                          {appliedFilters.language === 'English' && (
                            <div className="index-content__mobile-card-word">
                              {item.word_english || '-'}
                            </div>
                          )}
                          {appliedFilters.language === 'Arabic' && (
                            <div className="index-content__mobile-card-word" dir="rtl">
                              {item.word_arabic || '-'}
                            </div>
                          )}
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

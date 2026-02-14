'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Book, ArrowRight, MapPin } from 'lucide-react';
import { namePlacesApi, NamePlace, NamePlacesFilters } from '@/api';
import { Button, Input, Select } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';

export default function NamesPlacesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedFilters: NamePlacesFilters = {
    word_english: searchParams.get('word_english') || '',
    word_arabic: searchParams.get('word_arabic') || '',
    startsWith_english: searchParams.get('startsWith_english') || '',
    startsWith_arabic: searchParams.get('startsWith_arabic') || '',
    language: (searchParams.get('language') as 'English' | 'Arabic') || 'English',
  };

  const [items, setItems] = useState<NamePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<NamePlacesFilters>(appliedFilters);

  useEffect(() => {
    setFilters({
      word_english: searchParams.get('word_english') || '',
      word_arabic: searchParams.get('word_arabic') || '',
      startsWith_english: searchParams.get('startsWith_english') || '',
      startsWith_arabic: searchParams.get('startsWith_arabic') || '',
      language: (searchParams.get('language') as 'English' | 'Arabic') || 'English',
    });
  }, [searchParams]);

  const pageSize = 20;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterParams: NamePlacesFilters = {};
        if (appliedFilters.word_english) filterParams.word_english = appliedFilters.word_english;
        if (appliedFilters.word_arabic) filterParams.word_arabic = appliedFilters.word_arabic;
        if (appliedFilters.startsWith_english) filterParams.startsWith_english = appliedFilters.startsWith_english;
        if (appliedFilters.startsWith_arabic) filterParams.startsWith_arabic = appliedFilters.startsWith_arabic;
        if (appliedFilters.language) filterParams.language = appliedFilters.language;

        const response = await namePlacesApi.getNamePlaces(page, pageSize, filterParams);
        setItems(response.data);
        setTotalPages(response.meta.pagination.pageCount);
        setTotal(response.meta.pagination.total);
      } catch (err) {
        setError('Failed to load names and places. Please try again later.');
        console.error('Error fetching names and places:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, appliedFilters.word_english, appliedFilters.word_arabic, appliedFilters.startsWith_english, appliedFilters.startsWith_arabic, appliedFilters.language]);

  const handleApplyFilters = (newFilters?: NamePlacesFilters) => {
    const filtersToUse = newFilters || filters;
    const params = new URLSearchParams();
    if (filtersToUse.word_english) params.set('word_english', filtersToUse.word_english);
    if (filtersToUse.word_arabic) params.set('word_arabic', filtersToUse.word_arabic);
    if (filtersToUse.startsWith_english) params.set('startsWith_english', filtersToUse.startsWith_english);
    if (filtersToUse.startsWith_arabic) params.set('startsWith_arabic', filtersToUse.startsWith_arabic);
    if (filtersToUse.language && filtersToUse.language !== 'English') params.set('language', filtersToUse.language);

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      word_english: '',
      word_arabic: '',
      startsWith_english: '',
      startsWith_arabic: '',
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

  const hasActiveFilters = appliedFilters.word_english || appliedFilters.word_arabic || appliedFilters.startsWith_english || appliedFilters.startsWith_arabic || appliedFilters.language !== 'English';

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
    <div className="min-h-screen bg-[var(--color-parchment)]">
      {/* Hero Section */}
      <div className="pt-28 lg:pt-32 pb-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-[var(--color-primary)] flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl lg:text-3xl text-[var(--color-primary)]">
              Index of Names & Places
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-12">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="relative bg-white border border-[var(--color-stone)]">
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[var(--color-ink)]">Filters</h2>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">Language</label>
                  <Select
                    value={filters.language || 'English'}
                    onChange={(value) => setFilters({ ...filters, language: value as 'English' | 'Arabic' })}
                    options={[
                      { value: 'English', label: 'English' },
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
                    className="text-right"
                    dir="rtl"
                  />
                )}
              </div>
              <div className="mt-4 flex justify-end">
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
        <div className="mb-6">
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
              <div className="hidden md:block">
                <div className="relative bg-white border border-[var(--color-stone)] overflow-hidden">
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-24" />
                      {appliedFilters.language === 'English' && <col className="w-1/4" />}
                      {appliedFilters.language === 'Arabic' && <col className="w-1/5" />}
                      <col />
                    </colgroup>
                    <thead className="bg-[var(--color-cream)] border-b border-[var(--color-stone)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Section</th>
                        {appliedFilters.language === 'English' && <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">English</th>}
                        {appliedFilters.language === 'Arabic' && <th className="px-6 py-4 text-right text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body whitespace-nowrap">Arabic</th>}
                        <th className="px-6 py-4 text-center text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Text References</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-stone)]">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="w-10 h-10 bg-[var(--color-stone)] opacity-50"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-[var(--color-stone)] opacity-50 w-3/4"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2 justify-center">
                              <div className="h-6 bg-[var(--color-stone)] opacity-50 w-12"></div>
                              <div className="h-6 bg-[var(--color-stone)] opacity-50 w-12"></div>
                              <div className="h-6 bg-[var(--color-stone)] opacity-50 w-12"></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Mobile Loading */}
              <div className="md:hidden space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="relative bg-white border border-[var(--color-stone)] p-4 animate-pulse">
                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--color-accent)]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)]" />
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-5 bg-[var(--color-stone)] opacity-50 w-3/4 mb-2"></div>
                        <div className="h-4 bg-[var(--color-stone)] opacity-50 w-1/2"></div>
                      </div>
                      <div className="w-8 h-8 bg-[var(--color-stone)] opacity-50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : error ? (
            <div className="text-center py-12">
              <div className="relative bg-white border border-[var(--color-stone)] p-8 max-w-md mx-auto">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                <div className="text-red-600 mb-4">
                  <X className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-display text-lg text-[var(--color-ink)] mb-2">Error</h3>
                <p className="text-[var(--color-warm-gray)] font-body">{error}</p>
                <Button onClick={() => window.location.reload()} variant='solid' className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative bg-white border border-[var(--color-stone)] p-8 max-w-md mx-auto">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                <div className="text-[var(--color-stone)] mb-4">
                  <Book className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-display text-lg text-[var(--color-ink)] mb-2">No Results Found</h3>
                <p className="text-[var(--color-warm-gray)] font-body">Try adjusting your filters or search criteria.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-[var(--color-warm-gray)] font-body">
                Showing {items.length} of {total} results
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="relative bg-white border border-[var(--color-stone)] overflow-hidden">
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-24" />
                        {appliedFilters.language === 'English' && <col className="w-1/4" />}
                        {appliedFilters.language === 'Arabic' && <col className="w-1/5" />}
                        <col />
                      </colgroup>
                      <thead className="bg-[var(--color-cream)] border-b border-[var(--color-stone)]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Section</th>
                          {appliedFilters.language === 'English' && <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">English</th>}
                          {appliedFilters.language === 'Arabic' && <th className="px-6 py-4 text-right text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body whitespace-nowrap">Arabic</th>}
                          <th className="px-6 py-4 text-center text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Text References</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-stone)]">
                        {items.map((item) => {
                          const name = appliedFilters.language === 'Arabic' ? item.word_arabic : item.word_english;
                          const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                          const targetUrl = name
                            ? `/indexes/names-places/${encodeURIComponent(name)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`
                            : '#';

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-[var(--color-cream)] cursor-pointer transition-colors group"
                              onClick={() => name && router.push(targetUrl)}
                            >
                              <td className="px-6 py-4">
                                <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-display font-semibold">
                                  {item.section || '-'}
                                </div>
                              </td>
                              {appliedFilters.language === 'English' && (
                                <td className="px-6 py-4">
                                  <span className="text-[var(--color-ink)] font-body font-medium group-hover:text-[var(--color-primary)] transition-colors">
                                    {item.word_english || '-'}
                                  </span>
                                </td>
                              )}
                              {appliedFilters.language === 'Arabic' && (
                                <td className="px-6 py-4 text-right" dir="rtl">
                                  <span className="text-[var(--color-ink)] font-body font-medium group-hover:text-[var(--color-primary)] transition-colors">
                                    {item.word_arabic || '-'}
                                  </span>
                                </td>
                              )}
                              <td className="px-6 py-4">
                                <div className="flex justify-center">
                                  <div className="w-8 h-8 bg-[var(--color-stone)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
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
              <div className="md:hidden space-y-4">
                {items.map((item) => {
                  const name = appliedFilters.language === 'Arabic' ? item.word_arabic : item.word_english;
                  const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                  const targetUrl = name
                    ? `/indexes/names-places/${encodeURIComponent(name)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`
                    : '#';

                  return (
                    <div
                      key={item.id}
                      className="relative bg-white border border-[var(--color-stone)] p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors group"
                      onClick={() => name && router.push(targetUrl)}
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          {appliedFilters.language === 'English' && (
                            <div className="text-base font-display font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors">
                              {item.word_english || '-'}
                            </div>
                          )}
                          {appliedFilters.language === 'Arabic' && (
                            <div className="text-base font-display font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors" dir="rtl">
                              {item.word_arabic || '-'}
                            </div>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-[var(--color-stone)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
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

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Book, ArrowRight, Bookmark } from 'lucide-react';
import { quranHadithApi, QuranHadith, QuranHadithFilters } from '@/api';
import { Button, Input, Select } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';

export default function QuranHadithContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedFilters: QuranHadithFilters = {
    surah_name: searchParams.get('surah_name') || '',
    surah_number: searchParams.get('surah_number') || '',
    verse_translation: searchParams.get('verse_translation') || '',
    verse_text: searchParams.get('verse_text') || '',
    startsWith_surah: searchParams.get('startsWith_surah') || '',
    startsWith_verse: searchParams.get('startsWith_verse') || '',
    language: (searchParams.get('language') as 'English' | 'Arabic') || 'English',
  };

  const [items, setItems] = useState<QuranHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [surahNames, setSurahNames] = useState<string[]>([]);

  const [filters, setFilters] = useState<QuranHadithFilters>(appliedFilters);

  useEffect(() => {
    setFilters({
      surah_name: searchParams.get('surah_name') || '',
      surah_number: searchParams.get('surah_number') || '',
      verse_translation: searchParams.get('verse_translation') || '',
      verse_text: searchParams.get('verse_text') || '',
      startsWith_surah: searchParams.get('startsWith_surah') || '',
      startsWith_verse: searchParams.get('startsWith_verse') || '',
      language: (searchParams.get('language') as 'English' | 'Arabic') || 'English',
    });
  }, [searchParams]);

  const pageSize = 20;

  useEffect(() => {
    const fetchSurahNames = async () => {
      try {
        const namesData = await quranHadithApi.getSurahNames();
        setSurahNames(namesData);
      } catch (err) {
        console.error('Error fetching surah names:', err);
      }
    };
    fetchSurahNames();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterParams: QuranHadithFilters = {};
        if (appliedFilters.surah_name) filterParams.surah_name = appliedFilters.surah_name;
        if (appliedFilters.surah_number) filterParams.surah_number = appliedFilters.surah_number;
        if (appliedFilters.verse_translation) filterParams.verse_translation = appliedFilters.verse_translation;
        if (appliedFilters.verse_text) filterParams.verse_text = appliedFilters.verse_text;
        if (appliedFilters.startsWith_surah) filterParams.startsWith_surah = appliedFilters.startsWith_surah;
        if (appliedFilters.startsWith_verse) filterParams.startsWith_verse = appliedFilters.startsWith_verse;
        if (appliedFilters.language) filterParams.language = appliedFilters.language;

        const response = await quranHadithApi.getQuranHadiths(page, pageSize, filterParams);
        setItems(response.data);
        setTotalPages(response.meta.pagination.pageCount);
        setTotal(response.meta.pagination.total);
      } catch (err) {
        setError('Failed to load Qur\'an and Hadith references. Please try again later.');
        console.error('Error fetching quran and hadith:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, appliedFilters.surah_name, appliedFilters.surah_number, appliedFilters.verse_translation, appliedFilters.verse_text, appliedFilters.startsWith_surah, appliedFilters.startsWith_verse, appliedFilters.language]);

  const handleApplyFilters = (newFilters?: QuranHadithFilters) => {
    const filtersToUse = newFilters || filters;
    const params = new URLSearchParams();
    if (filtersToUse.surah_name) params.set('surah_name', filtersToUse.surah_name);
    if (filtersToUse.surah_number) params.set('surah_number', filtersToUse.surah_number);
    if (filtersToUse.verse_translation) params.set('verse_translation', filtersToUse.verse_translation);
    if (filtersToUse.verse_text) params.set('verse_text', filtersToUse.verse_text);
    if (filtersToUse.startsWith_surah) params.set('startsWith_surah', filtersToUse.startsWith_surah);
    if (filtersToUse.startsWith_verse) params.set('startsWith_verse', filtersToUse.startsWith_verse);
    if (filtersToUse.language && filtersToUse.language !== 'English') params.set('language', filtersToUse.language);

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      surah_name: '',
      surah_number: '',
      verse_translation: '',
      verse_text: '',
      startsWith_surah: '',
      startsWith_verse: '',
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

  const hasActiveFilters = appliedFilters.surah_name || appliedFilters.surah_number || appliedFilters.verse_translation || appliedFilters.verse_text || appliedFilters.startsWith_surah || appliedFilters.startsWith_verse || appliedFilters.language !== 'English';

  const handleLetterSelect = (letter: string) => {
    const updatedFilters = { ...filters };
    if (filters.language === 'English') {
      updatedFilters.startsWith_surah = letter;
      updatedFilters.startsWith_verse = '';
    } else {
      updatedFilters.startsWith_verse = letter;
      updatedFilters.startsWith_surah = '';
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
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl lg:text-3xl text-[var(--color-primary)]">
              Index of Qur&apos;an &amp; Hadith
            </h1>
          </div>
          <p className="text-[var(--color-warm-gray)] font-body mt-2 ml-16">
            Discover references to the Holy Qur&apos;an and prophetic traditions in Nahj al-Balaghah
          </p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">Surah Name</label>
                  <Select
                    value={filters.surah_name}
                    onChange={(value) => setFilters({ ...filters, surah_name: value })}
                    options={[
                      { value: '', label: 'All Surahs' },
                      ...surahNames.map(name => ({ value: name, label: name }))
                    ]}
                    placeholder="Select a Surah"
                  />
                </div>
                {filters.language === 'English' ? (
                  <Input
                    label="Search Translation"
                    placeholder="Search translation..."
                    value={filters.verse_translation}
                    onChange={(e) => setFilters({ ...filters, verse_translation: e.target.value })}
                  />
                ) : (
                  <Input
                    label="Search Arabic Text"
                    placeholder="Search Arabic..."
                    value={filters.verse_text}
                    onChange={(e) => setFilters({ ...filters, verse_text: e.target.value })}
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
            selectedLetter={filters.language === 'English' ? (filters.startsWith_surah || '') : (filters.startsWith_verse || '')}
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
                      <col className="w-32" />
                      <col className="w-20" />
                      <col />
                      <col className="w-32" />
                    </colgroup>
                    <thead className="bg-[var(--color-cream)] border-b border-[var(--color-stone)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Surah</th>
                        <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Verse</th>
                        {appliedFilters.language === 'English' && <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Translation</th>}
                        {appliedFilters.language === 'Arabic' && <th className="px-6 py-4 text-right text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Arabic Text</th>}
                        <th className="px-6 py-4 text-center text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">References</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-stone)]">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-[var(--color-stone)] opacity-50 w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-[var(--color-stone)] opacity-50 w-12"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-[var(--color-stone)] opacity-50 w-3/4"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
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
                <Book className="w-16 h-16 text-[var(--color-stone)] mx-auto mb-4" />
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
                        <col className="w-32" />
                        <col className="w-20" />
                        <col />
                        <col className="w-32" />
                      </colgroup>
                      <thead className="bg-[var(--color-cream)] border-b border-[var(--color-stone)]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Surah</th>
                          <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Verse</th>
                          {appliedFilters.language === 'English' && <th className="px-6 py-4 text-left text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Translation</th>}
                          {appliedFilters.language === 'Arabic' && <th className="px-6 py-4 text-right text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">Arabic Text</th>}
                          <th className="px-6 py-4 text-center text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">References</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-stone)]">
                        {items.map((item) => {
                          const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                          const urlSlug = item.verse_translation 
                            ? item.verse_translation.slice(0, 50).trim()
                            : item.surah_name || item.documentId;
                          const targetUrl = `/indexes/quran-hadith/${encodeURIComponent(urlSlug)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`;

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-[var(--color-cream)] cursor-pointer transition-colors group"
                              onClick={() => router.push(targetUrl)}
                            >
                              <td className="px-6 py-4">
                                <span className="text-[var(--color-ink)] font-body font-medium">
                                  {item.surah_name || '-'}
                                </span>
                                {item.surah_number && (
                                  <span className="text-[var(--color-warm-gray)] text-sm ml-1">
                                    ({item.surah_number})
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[var(--color-charcoal)] font-body">
                                  {item.verse_numbers || '-'}
                                </span>
                              </td>
                              {appliedFilters.language === 'English' && (
                                <td className="px-6 py-4">
                                  <span className="text-[var(--color-ink)] font-body group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                    {item.verse_translation || '-'}
                                  </span>
                                </td>
                              )}
                              {appliedFilters.language === 'Arabic' && (
                                <td className="px-6 py-4 text-right" dir="rtl">
                                  <span className="text-[var(--color-ink)] font-body group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                    {item.verse_text || '-'}
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
                  const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                  const urlSlug = item.verse_translation 
                    ? item.verse_translation.slice(0, 50).trim()
                    : item.surah_name || item.documentId;
                  const targetUrl = `/indexes/quran-hadith/${encodeURIComponent(urlSlug)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`;

                  return (
                    <div
                      key={item.id}
                      className="relative bg-white border border-[var(--color-stone)] p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors group"
                      onClick={() => router.push(targetUrl)}
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-display font-semibold text-[var(--color-primary)]">
                              {item.surah_name}
                            </span>
                            {item.verse_numbers && (
                              <span className="text-sm text-[var(--color-warm-gray)] font-body">
                                Verse {item.verse_numbers}
                              </span>
                            )}
                          </div>
                          {appliedFilters.language === 'English' && (
                            <div className="text-sm text-[var(--color-ink)] font-body line-clamp-2">
                              {item.verse_translation || '-'}
                            </div>
                          )}
                          {appliedFilters.language === 'Arabic' && (
                            <div className="text-sm text-[var(--color-ink)] font-body line-clamp-2" dir="rtl">
                              {item.verse_text || '-'}
                            </div>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-[var(--color-stone)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors shrink-0">
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

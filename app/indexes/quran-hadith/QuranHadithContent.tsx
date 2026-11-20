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
    <div className="index-content">
      {/* Hero Section */}
      <div className="index-content__hero">
        <div className="index-content__container">
          <div className="index-content__header">
            <div className="index-content__icon-box">
              <Bookmark className="w-6 h-6" />
            </div>
            <h1 className="index-content__title">
              Index of Qur&apos;an &amp; Hadith
            </h1>
          </div>
          <p className="index-content__subtitle">
            Discover references to the Holy Qur&apos;an and prophetic traditions in Nahj al-Balaghah
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

              <div className="index-content__filter-grid-3">
                <div>
                  <label className="index-content__filter-label">Language</label>
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
                  <label className="index-content__filter-label">Surah Name</label>
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
              <div className="index-content__desktop-only">
                <div className="index-content__table-card">
                  <div className="index-content__corner-tl" />
                  <div className="index-content__corner-br" />
                  <table className="index-content__table">
                    <colgroup>
                      <col className="index-content__col-md" />
                      <col className="index-content__col-xs" />
                      <col />
                      <col className="index-content__col-md" />
                    </colgroup>
                    <thead className="index-content__thead">
                      <tr>
                        <th className="index-content__th">Surah</th>
                        <th className="index-content__th">Verse</th>
                        {appliedFilters.language === 'English' && <th className="index-content__th">Translation</th>}
                        {appliedFilters.language === 'Arabic' && <th className="index-content__th index-content__th--right">Arabic Text</th>}
                        <th className="index-content__th index-content__th--center">References</th>
                      </tr>
                    </thead>
                    <tbody className="index-content__tbody">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="index-content__tr--pulse">
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '6rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '3rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '75%' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton-refs">
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
                        <col className="index-content__col-md" />
                        <col className="index-content__col-xs" />
                        <col />
                        <col className="index-content__col-md" />
                      </colgroup>
                      <thead className="index-content__thead">
                        <tr>
                          <th className="index-content__th">Surah</th>
                          <th className="index-content__th">Verse</th>
                          {appliedFilters.language === 'English' && <th className="index-content__th">Translation</th>}
                          {appliedFilters.language === 'Arabic' && <th className="index-content__th index-content__th--right">Arabic Text</th>}
                          <th className="index-content__th index-content__th--center">References</th>
                        </tr>
                      </thead>
                      <tbody className="index-content__tbody">
                        {items.map((item) => {
                          const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                          const urlSlug = item.verse_translation
                            ? item.verse_translation.slice(0, 50).trim()
                            : item.surah_name || item.documentId;
                          const targetUrl = `/indexes/quran-hadith/${encodeURIComponent(urlSlug)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`;

                          return (
                            <tr
                              key={item.id}
                              className="index-content__tr"
                              onClick={() => router.push(targetUrl)}
                            >
                              <td className="index-content__td">
                                <span className="index-content__cell-primary">
                                  {item.surah_name || '-'}
                                </span>
                                {item.surah_number && (
                                  <span className="index-content__cell-secondary">
                                    ({item.surah_number})
                                  </span>
                                )}
                              </td>
                              <td className="index-content__td">
                                <span className="index-content__cell-text">
                                  {item.verse_numbers || '-'}
                                </span>
                              </td>
                              {appliedFilters.language === 'English' && (
                                <td className="index-content__td">
                                  <span className="index-content__cell-text--hoverable">
                                    {item.verse_translation || '-'}
                                  </span>
                                </td>
                              )}
                              {appliedFilters.language === 'Arabic' && (
                                <td className="index-content__td index-content__td--right" dir="rtl">
                                  <span className="index-content__cell-text--hoverable">
                                    {item.verse_text || '-'}
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
                  const refs = item.text_numbers?.map(t => t.value).join(',') || '';
                  const urlSlug = item.verse_translation
                    ? item.verse_translation.slice(0, 50).trim()
                    : item.surah_name || item.documentId;
                  const targetUrl = `/indexes/quran-hadith/${encodeURIComponent(urlSlug)}${refs ? `?refs=${encodeURIComponent(refs)}` : ''}`;

                  return (
                    <div
                      key={item.id}
                      className="index-content__mobile-card"
                      onClick={() => router.push(targetUrl)}
                    >
                      <div className="index-content__corner-tl--hover" />
                      <div className="index-content__corner-br--hover" />
                      <div className="index-content__mobile-card-inner--top">
                        <div className="index-content__mobile-card-content">
                          <div className="index-content__mobile-card-title-row">
                            <span className="index-content__mobile-card-surah">
                              {item.surah_name}
                            </span>
                            {item.verse_numbers && (
                              <span className="index-content__mobile-card-verse">
                                Verse {item.verse_numbers}
                              </span>
                            )}
                          </div>
                          {appliedFilters.language === 'English' && (
                            <div className="index-content__mobile-card-text">
                              {item.verse_translation || '-'}
                            </div>
                          )}
                          {appliedFilters.language === 'Arabic' && (
                            <div className="index-content__mobile-card-text" dir="rtl">
                              {item.verse_text || '-'}
                            </div>
                          )}
                        </div>
                        <div className="index-content__arrow-btn index-content__arrow-btn--shrink">
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

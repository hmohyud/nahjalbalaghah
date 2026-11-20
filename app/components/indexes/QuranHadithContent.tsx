'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Book, ArrowRight, Bookmark } from 'lucide-react';
import { quranHadithApi, QuranHadith, QuranHadithFilters } from '@/api';
import { Button, Input, Select } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';
import { normalizeForSort } from '@/app/utils/text-formatting';

export default function QuranHadithContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedFilters: QuranHadithFilters = {
    reference_type: (searchParams.get('reference_type') as any) || 'Quran',
    surah_name: searchParams.get('surah_name') || '',
    surah_number: searchParams.get('surah_number') || '',
    verse_translation: searchParams.get('verse_translation') || '',
    verse_text: searchParams.get('verse_text') || '',
    startsWith_surah: searchParams.get('startsWith_surah') || '',
    startsWith_verse: searchParams.get('startsWith_verse') || '',
    language: (searchParams.get('language') as 'English' | 'Arabic') || 'English',
  };

  const [allItems, setAllItems] = useState<QuranHadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surahNames, setSurahNames] = useState<{ name: string; arabicName: string }[]>([]);

  const [filters, setFilters] = useState<QuranHadithFilters>(appliedFilters);
  const isArabic = filters.language === 'Arabic';

  // Sync filters with URL params when they change (e.g. back button)
  useEffect(() => {
    setFilters({
      reference_type: (searchParams.get('reference_type') as any) || 'Quran',
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

  const getReferenceLabel = (item: QuranHadith) => {
    if (appliedFilters.language === 'Arabic') {
      return item.arabic_name || item.surah_name_arabic || '-';
    }
    return item.reference || item.surah_name || item.title || '-';
  };

  const getTitleLabel = (item: QuranHadith) => item.title || '-';

  const getDetailText = (item: QuranHadith) =>
    appliedFilters.language === 'Arabic' ? (item.verse_text || item.arabic_text || '-') : (item.verse_translation || item.english_translation || '-');

  const getArabicDetailText = (item: QuranHadith) => item.verse_text || item.arabic_text || '';

  const getPoetLabel = (item: QuranHadith) => item.poet || '';

  const getTextNumbers = (item: QuranHadith) => item.text_numbers?.map(t => t.value).filter(Boolean) || [];

  const getTargetUrl = (item: QuranHadith) => {
    const refs = item.text_numbers?.map(t => t.value).join(',') || '';
    const urlSlug = item.title || item.reference || item.surah_name || item.documentId;
    const params = new URLSearchParams({
      ...(refs ? { refs } : {}),
      entry: item.documentId,
    });
    return `/indexes/quran-hadith/${encodeURIComponent(urlSlug)}?${params.toString()}`;
  };

  // Initialize: Fetch ALL items once
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, namesData] = await Promise.all([
          quranHadithApi.getAllQuranHadiths(),
          quranHadithApi.getSurahNames()
        ]);
        setAllItems(data);
        setSurahNames(namesData);
      } catch (err) {
        setError('Failed to load Qur\'an and Hadith references. Please try again later.');
        console.error('Error fetching quran and hadith:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Local Filter Logic
  const filteredItems = React.useMemo(() => {
    let result = [...allItems];

    const { reference_type, surah_name, surah_number, verse_translation, verse_text, startsWith_surah, startsWith_verse, language } = appliedFilters;

    // Filter by Reference Type
    if (reference_type) {
      result = result.filter(item => (item as any).reference_type === reference_type);
    }

    // Filter by Surah Name (if selected and reference type is Quran)
    if (surah_name && (!reference_type || reference_type === 'Quran')) {
      result = result.filter(item => item.surah_name === surah_name);
    }

    // Language Filter
    if (language === 'English') {
      result = result.filter(item => item.verse_translation && item.verse_translation.trim() !== '');
    } else {
      result = result.filter(item => item.verse_text && item.verse_text.trim() !== '');
    }

    // Search Filter
    if (language === 'English' && verse_translation) {
      const q = verse_translation.toLowerCase();
      result = result.filter(item => item.verse_translation.toLowerCase().includes(q));
    } else if (language === 'Arabic' && verse_text) {
      result = result.filter(item => item.verse_text.includes(verse_text));
    }

    // Alphabet Filter
    if (language === 'English' && startsWith_surah) {
      const letter = startsWith_surah.toLowerCase();
      result = result.filter(item => {
        return normalizeForSort(item.surah_name).startsWith(letter);
      });
    } else if (language === 'Arabic' && startsWith_verse) {
      result = result.filter(item => item.verse_text.startsWith(startsWith_verse));
    }

    // Sort Alphabetically
    result.sort((a, b) => {
      const isArabic = appliedFilters.language === 'Arabic';
      const wordA = (isArabic && a.surah_name_arabic) ? a.surah_name_arabic : (a.surah_name || '');
      const wordB = (isArabic && b.surah_name_arabic) ? b.surah_name_arabic : (b.surah_name || '');
      
      if (isArabic) {
        return wordA.localeCompare(wordB, 'ar');
      }
      return normalizeForSort(wordA).localeCompare(normalizeForSort(wordB));
    });

    return result;
  }, [allItems, appliedFilters]);

  // Pagination totals
  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const items = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handleApplyFilters = (newFilters?: QuranHadithFilters) => {
    const filtersToUse = newFilters || filters;
    const params = new URLSearchParams();
    if (filtersToUse.reference_type) params.set('reference_type', filtersToUse.reference_type);
    if (filtersToUse.surah_name) params.set('surah_name', filtersToUse.surah_name);
    if (filtersToUse.surah_number) params.set('surah_number', filtersToUse.surah_number);
    if (filtersToUse.verse_translation) params.set('verse_translation', filtersToUse.verse_translation);
    if (filtersToUse.verse_text) params.set('verse_text', filtersToUse.verse_text);
    if (filtersToUse.startsWith_surah) params.set('startsWith_surah', filtersToUse.startsWith_surah);
    if (filtersToUse.startsWith_verse) params.set('startsWith_verse', filtersToUse.startsWith_verse);
    if (filtersToUse.language && filtersToUse.language !== 'English') params.set('language', filtersToUse.language);

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
      reference_type: 'Quran',
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

  const isArabicResults = appliedFilters.language === 'Arabic';

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
                <h2 className="index-content__filter-title">{isArabic ? 'عوامل التصفية' : 'Filters'}</h2>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant='danger'
                    icon={<X className="w-4 h-4" />}
                  >
                    {isArabic ? 'مسح عوامل التصفية' : 'Clear Filters'}
                  </Button>
                )}
              </div>

              <div className="index-content__filter-grid-4">
                <div>
                  <label className="index-content__filter-label">{isArabic ? 'اللغة' : 'Language'}</label>
                  <Select
                    value={filters.language || 'English'}
                    onChange={(value) => setFilters({ ...filters, language: value as 'English' | 'Arabic' })}
                    options={[
                      { value: 'English', label: isArabic ? 'الإنجليزية' : 'English' },
                      { value: 'Arabic', label: isArabic ? 'العربية' : 'Arabic' }
                    ]}
                    placeholder={isArabic ? 'اختر اللغة' : 'Select Language'}
                  />
                </div>
                <div>
                  <label className="index-content__filter-label">{isArabic ? 'المرجع' : 'Reference'}</label>
                  <Select
                    value={filters.reference_type || ''}
                    onChange={(value) => {
                      const newFilters = { ...filters, reference_type: value as any };
                      if (value !== 'Quran') newFilters.surah_name = '';
                      setFilters(newFilters);
                    }}
                    options={[
                      { value: 'Quran', label: isArabic ? 'القرآن' : "Qur'an" },
                      { value: 'Hadith', label: isArabic ? 'الحديث' : 'Hadith' },
                      { value: 'Poetry', label: isArabic ? 'الشعر' : 'Poetry' },
                      { value: 'Proverbs', label: isArabic ? 'الأمثال' : 'Proverbs' }
                    ]}
                    placeholder={isArabic ? 'اختر المرجع' : 'Select Reference'}
                  />
                </div>
                {(filters.reference_type === 'Quran' || !filters.reference_type) && (
                  <div>
                    <label className="index-content__filter-label">{isArabic ? 'السورة' : 'Surah'}</label>
                    <Select
                      value={filters.surah_name}
                      onChange={(value) => setFilters({ ...filters, surah_name: value })}
                      options={[
                        { value: '', label: isArabic ? 'جميع السور' : 'All Surahs' },
                        ...surahNames.map(surah => ({
                          value: surah.name,
                          label: filters.language === 'Arabic' && surah.arabicName ? surah.arabicName : surah.name
                        }))
                      ]}
                      placeholder={isArabic ? 'اختر السورة' : 'Select a Surah'}
                    />
                  </div>
                )}
                {filters.language === 'English' ? (
                  <Input
                    label="Search Translation"
                    placeholder="Search translation..."
                    value={filters.verse_translation}
                    onChange={(e) => setFilters({ ...filters, verse_translation: e.target.value })}
                  />
                ) : (
                  <Input
                    label="البحث في النص العربي"
                    placeholder="ابحث بالعربية..."
                    value={filters.verse_text}
                    onChange={(e) => setFilters({ ...filters, verse_text: e.target.value })}
                    className="text-align-right font-taha"
                    dir="rtl"
                  />
                )}
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
                      <col className="index-content__col-source" />
                      <col />
                      {!isArabicResults && <col />}
                      <col className="index-content__col-numbers" />
                    </colgroup>
                    <thead className="index-content__thead">
                      <tr>
                        <th className="index-content__th">Source</th>
                        {!isArabicResults && <th className="index-content__th">English Translation</th>}
                        <th className="index-content__th index-content__th--right">Arabic Text</th>
                        <th className="index-content__th">Text Number(s)</th>
                      </tr>
                    </thead>
                    <tbody className="index-content__tbody">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="index-content__tr--pulse">
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '8rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '75%' }}></div>
                          </td>
                          {!isArabicResults && (
                            <td className="index-content__td">
                              <div className="index-content__skeleton" style={{ height: '1rem', width: '75%', marginLeft: 'auto' }}></div>
                            </td>
                          )}
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1rem', width: '4rem' }}></div>
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
              <div className="index-content__results-bar">
                <div className="index-content__results-count">
                  {isArabicResults ? (
                    <>
                      عرض <span className="index-content__results-count-bold">{items.length}</span> من <span className="index-content__results-count-bold">{total}</span> نتائج
                    </>
                  ) : (
                    <>
                      Showing <span className="index-content__results-count-bold">{items.length}</span> of <span className="index-content__results-count-bold">{total}</span> results
                    </>
                  )}
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
                    <table className="index-content__table" dir={isArabicResults ? 'rtl' : 'ltr'}>
                      <colgroup>
                        <col className="index-content__col-source" />
                        <col />
                        {!isArabicResults && <col />}
                        <col className="index-content__col-numbers" />
                      </colgroup>
                      <thead className="index-content__thead">
                        <tr>
                          <th className={`index-content__th ${isArabicResults ? 'index-content__th--right' : ''}`}>
                            {appliedFilters.reference_type === 'Poetry'
                              ? (isArabicResults ? 'الشاعر' : 'Poet')
                              : (isArabicResults ? 'المصدر' : 'Source')}
                          </th>
                          {!isArabicResults && <th className="index-content__th">English Translation</th>}
                          <th className="index-content__th index-content__th--right">{isArabicResults ? 'النص العربي' : 'Arabic Text'}</th>
                          <th className={`index-content__th ${isArabicResults ? 'index-content__th--right' : ''}`}>
                            {isArabicResults ? 'أرقام النص' : 'Text Number(s)'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="index-content__tbody">
                        {items.map((item) => {
                          const displayText = getDetailText(item);
                          const arabicDetailText = getArabicDetailText(item);
                          const poetLabel = getPoetLabel(item);
                          const textNumbers = getTextNumbers(item);
                          const targetUrl = getTargetUrl(item);

                          return (
                            <tr
                              key={item.id}
                              className="index-content__tr"
                              onClick={() => router.push(targetUrl)}
                            >
                              <td className={`index-content__td ${isArabicResults ? 'index-content__td--right' : ''}`}>
                                {appliedFilters.reference_type === 'Poetry' ? (
                                  <span className="index-content__cell-primary">
                                    {poetLabel || '-'}
                                  </span>
                                ) : (
                                  <div className="index-content__source-cell">
                                    <span className={`index-content__cell-primary ${isArabicResults ? 'font-taha' : ''}`}>
                                      {getReferenceLabel(item)}
                                    </span>
                                    {!isArabicResults && getTitleLabel(item) !== '-' && (
                                      <span className="index-content__cell-secondary">
                                        {getTitleLabel(item)}
                                      </span>
                                    )}
                                    {item.category && !['Quran', 'Hadith', 'Proverbs'].includes(item.category) && (
                                      <span className="index-content__category-pill">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              {!isArabicResults && (
                                <td className="index-content__td">
                                  <span className="index-content__cell-text--hoverable">
                                    {displayText}
                                  </span>
                                </td>
                              )}
                              {!isArabicResults ? (
                                <td className="index-content__td index-content__td--right">
                                  {arabicDetailText && (
                                    <span className="index-content__cell-arabic--muted font-taha" dir="rtl">
                                      {arabicDetailText}
                                    </span>
                                  )}
                                </td>
                              ) : (
                                <td className="index-content__td index-content__td--right">
                                  <span className="index-content__cell-text--hoverable font-taha" dir="rtl">
                                    {displayText}
                                  </span>
                                </td>
                              )}
                              <td className={`index-content__td ${isArabicResults ? 'index-content__td--right' : ''}`}>
                                {textNumbers.length > 0 && (
                                  <div className="index-content__text-numbers">
                                    {textNumbers.map((num, idx) => (
                                      <span key={idx} className="index-content__text-number">
                                        {num}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
                  const displayText = getDetailText(item);
                  const arabicDetailText = getArabicDetailText(item);
                  const poetLabel = getPoetLabel(item);
                  const targetUrl = getTargetUrl(item);

                  return (
                    <div
                      key={item.id}
                      className="index-content__mobile-card"
                      onClick={() => router.push(targetUrl)}
                      dir={isArabicResults ? 'rtl' : 'ltr'}
                    >
                      <div className="index-content__corner-tl--hover" />
                      <div className="index-content__corner-br--hover" />
                      <div className="index-content__mobile-card-inner--top">
                        <div className="index-content__mobile-card-content">
                          <div className="index-content__mobile-card-title-row">
                            <span className={`index-content__mobile-card-surah ${isArabicResults ? 'font-taha' : ''}`}>
                              {getReferenceLabel(item)}
                            </span>
                            {item.category && (
                              <span className="index-content__mobile-card-verse">
                                {item.category}
                              </span>
                            )}
                          </div>
                          {poetLabel && (
                            <div className="index-content__mobile-card-meta">
                              {isArabicResults ? 'الشاعر: ' : 'Poet: '}{poetLabel}
                            </div>
                          )}
                          {!isArabicResults && getTitleLabel(item) !== '-' && (
                            <div className="index-content__mobile-card-meta">
                              {getTitleLabel(item)}
                            </div>
                          )}
                          {!isArabicResults ? (
                            <>
                              <div className="index-content__mobile-card-text">
                                {displayText}
                              </div>
                              {arabicDetailText && (
                                <div className="index-content__mobile-card-text index-content__mobile-card-text--arabic-muted font-taha" dir="rtl">
                                  {arabicDetailText}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="index-content__mobile-card-text font-taha" dir="rtl">
                              {displayText}
                            </div>
                          )}
                        </div>
                        <div className={`index-content__arrow-btn index-content__arrow-btn--shrink ${isArabicResults ? 'rotate-180' : ''}`}>
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

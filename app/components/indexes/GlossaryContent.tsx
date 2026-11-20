'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, BookOpen, BookA, ArrowRight } from 'lucide-react';
import { namePlacesApi, GlossaryItem } from '@/api';
import { Button, Input } from '@/app/components/ui';
import { Pagination } from '@/app/components/content-widgets';

export default function GlossaryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const appliedSearchWord = searchParams.get('word') || '';
  const [searchWord, setSearchWord] = useState(appliedSearchWord);

  const [allItems, setAllItems] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const pageSize = 20;

  useEffect(() => {
    setSearchWord(searchParams.get('word') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await namePlacesApi.getAllGlossaryItems();
        setAllItems(data);
      } catch (err) {
        setError('Failed to load glossary items. Please try again later.');
        console.error('Error fetching glossary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredItems = React.useMemo(() => {
    let result = [...allItems];
    if (appliedSearchWord) {
      const q = appliedSearchWord.toLowerCase();
      result = result.filter(item => 
        item.word.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => a.word.localeCompare(b.word));
    return result;
  }, [allItems, appliedSearchWord]);

  const total = filteredItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const items = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (searchWord) params.set('word', searchWord);
    params.set('page', '1');
    if (params.toString() !== searchParams.toString()) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    // Only reset to page 1 when the search actually changed
    if (searchWord === appliedSearchWord) return;
    const timeout = window.setTimeout(handleApplyFilters, 500);
    return () => window.clearTimeout(timeout);
  }, [searchWord]);

  const handleClearFilters = () => {
    setSearchWord('');
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    setExpandedId(null); // Reset expansion on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = !!appliedSearchWord;

  return (
    <div className="index-content">
      {/* Hero Section */}
      <div className="index-content__hero">
        <div className="index-content__container">
          <div className="index-content__header">
            <div className="index-content__icon-box">
              <BookA className="w-6 h-6" />
            </div>
            <h1 className="index-content__title">
              Glossary
            </h1>
          </div>
          <p className="index-content__subtitle">
            Explore the descriptions and meanings of various terms, names, and places.
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
                  label="Search Word or Description"
                  placeholder="Search..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                />
              </div>
            </div>
          </div>
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
                      <col className="index-content__col-quarter" />
                      <col />
                    </colgroup>
                    <thead className="index-content__thead">
                      <tr>
                        <th className="index-content__th">Word</th>
                        <th className="index-content__th index-content__th--center">View Description</th>
                      </tr>
                    </thead>
                    <tbody className="index-content__tbody">
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="index-content__tr--pulse">
                          <td className="index-content__td">
                            <div className="index-content__skeleton" style={{ height: '1.25rem', width: '8rem' }}></div>
                          </td>
                          <td className="index-content__td">
                            <div className="index-content__arrow-cell">
                              <div className="index-content__skeleton" style={{ height: '2rem', width: '2rem' }}></div>
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
                    <div className="index-content__skeleton-card-row">
                      <div className="index-content__mobile-card-content">
                        <div className="index-content__skeleton" style={{ height: '1.25rem', width: '60%' }}></div>
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
                  <BookOpen className="w-16 h-16" />
                </div>
                <h3 className="index-content__state-heading">No items found</h3>
                <p className="index-content__state-text--sm">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <>
              <div className="index-content__results-bar">
                <div className="index-content__results-count">
                  Showing <span className="index-content__results-count-bold">{(page - 1) * pageSize + 1}</span>-<span className="index-content__results-count-bold">{Math.min(page * pageSize, total)}</span> of <span className="index-content__results-count-bold">{total}</span> items
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
                        <col className="index-content__col-quarter" />
                        <col />
                      </colgroup>
                      <thead className="index-content__thead">
                        <tr>
                          <th className="index-content__th">Word</th>
                          <th className="index-content__th index-content__th--center">View Description</th>
                        </tr>
                      </thead>
                      <tbody className="index-content__tbody">
                        {items.map((item) => {
                          const isExpanded = expandedId === item.id;
                          return (
                            <React.Fragment key={item.id}>
                              <tr
                                className={`index-content__tr ${isExpanded ? 'index-content__tr--expanded' : ''}`}
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                aria-expanded={isExpanded}
                              >
                                <td className="index-content__td--hoverable">
                                  {item.word}
                                </td>
                                <td className="index-content__td">
                                  <div className="index-content__arrow-cell">
                                    <div className={`index-content__arrow-btn ${isExpanded ? 'index-content__arrow-btn--expanded' : ''}`}>
                                      <ArrowRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="index-content__glossary-row">
                                  <td colSpan={2} className="index-content__td">
                                    <p className="index-content__glossary-description">
                                      {item.description}
                                    </p>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`index-content__mobile-card ${isExpanded ? 'index-content__mobile-card--expanded' : ''}`}
                      dir="ltr"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="index-content__corner-tl--hover" />
                      <div className="index-content__corner-br--hover" />
                      <div className="index-content__mobile-card-inner">
                        <div className="index-content__mobile-card-content">
                          <div className="index-content__mobile-card-word">
                            {item.word}
                          </div>
                        </div>
                        <div className={`index-content__arrow-btn ${isExpanded ? 'index-content__arrow-btn--expanded' : ''}`}>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                      {isExpanded && (
                        <p className="index-content__glossary-description index-content__glossary-description--mobile">
                          {item.description}
                        </p>
                      )}
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Book, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/app/components/ui';
import { Pagination, AlphabetChips } from '@/app/components/content-widgets';
import { IndexCategory } from '@/app/data/indexes';
import { normalizeForSort } from '@/app/utils/text-formatting';

interface StaticIndexListProps {
    category: IndexCategory;
}

export default function StaticIndexList({ category }: StaticIndexListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL State
    const page = parseInt(searchParams.get('page') || '1');
    const searchQuery = searchParams.get('search') || '';
    const startLetter = searchParams.get('letter') || '';

    const [filterSearch, setFilterSearch] = useState(searchQuery);
    const pageSize = 20;

    useEffect(() => {
        setFilterSearch(searchQuery);
    }, [searchQuery]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        let items = [...category.items];

        // Alphabet Filter
        if (startLetter) {
            items = items.filter(item => {
                return normalizeForSort(item.word).startsWith(startLetter.toLowerCase());
            });
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.word.toLowerCase().includes(q)
            );
        }

        // Sort Alphabetically
        items.sort((a, b) => {
            return normalizeForSort(a.word).localeCompare(normalizeForSort(b.word));
        });

        return items;
    }, [category.items, startLetter, searchQuery]);

    // Pagination Logic
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

    // Handlers
    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (filterSearch) params.set('search', filterSearch);
        if (startLetter) params.set('letter', startLetter);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setFilterSearch('');
        router.push(pathname);
    };

    const handleLetterSelect = (letter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (letter === startLetter) {
            params.delete('letter'); // Toggle off
        } else {
            params.set('letter', letter);
        }
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasActiveFilters = searchQuery || startLetter;

    return (
        <div className="static-index-list">
            <div className="static-index-list__container">
                <div className="static-index-list__header">
                    <h1 className="static-index-list__title">{category.title}</h1>
                    <p className="static-index-list__description">
                        {category.description}
                    </p>
                </div>

                <div className="static-index-list__filters">
                    <div className="static-index-list__filters-header">
                        <h2 className="static-index-list__filters-title">Filters</h2>
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

                    <div className="static-index-list__filters-row">
                        <div className="static-index-list__filters-input">
                            <Input
                                label="Search"
                                placeholder={`Search ${category.title}...`}
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                            />
                        </div>
                        <div className="static-index-list__filters-btn">
                            <Button
                                onClick={handleApplyFilters}
                                variant='outlined'
                                icon={<Search className="w-4 h-4" />}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="static-index-list__alphabet">
                    <AlphabetChips
                        selectedLetter={startLetter}
                        onSelectLetter={handleLetterSelect}
                        language="English"
                    />
                </div>

                <div>
                    {total === 0 ? (
                        <div className="static-index-list__empty">
                            <Book className="w-16 h-16 static-index-list__empty-icon" />
                            <p className="static-index-list__empty-title">No items found</p>
                            <p className="static-index-list__empty-subtitle">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="static-index-list__results-info">
                                <p className="static-index-list__results-text">
                                    Showing <span className="static-index-list__results-bold">{(page - 1) * pageSize + 1}</span>-<span className="static-index-list__results-bold">{Math.min(page * pageSize, total)}</span> of <span className="static-index-list__results-bold">{total}</span>
                                </p>
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        loading={false}
                                    />
                                )}
                            </div>

                            {/* Desktop Table */}
                            <div className="static-index-list__table-wrapper">
                                <div className="static-index-list__table-scroll">
                                    <table className="static-index-list__table">
                                        <colgroup>
                                            <col className="static-index-list__col-word" />
                                            <col />
                                            <col className="static-index-list__col-action" />
                                        </colgroup>
                                        <thead className="static-index-list__thead">
                                            <tr>
                                                <th className="static-index-list__th">Word</th>
                                                <th className="static-index-list__th">Ref Count</th>
                                                <th className="static-index-list__th--center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="static-index-list__tbody">
                                            {paginatedItems.map((item) => {
                                                const targetUrl = `${pathname}/${encodeURIComponent(item.word)}`;

                                                return (
                                                    <tr
                                                        key={item.word}
                                                        className="static-index-list__row"
                                                        onClick={() => router.push(targetUrl)}
                                                    >
                                                        <td className="static-index-list__cell-word">
                                                            {item.word}
                                                        </td>
                                                        <td className="static-index-list__cell-refs">
                                                            {item.references.length} references
                                                        </td>
                                                        <td className="static-index-list__cell-action">
                                                            <div className="static-index-list__action-center">
                                                                <div className="static-index-list__action-circle">
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

                            {/* Mobile List */}
                            <div className="static-index-list__mobile">
                                {paginatedItems.map((item) => {
                                    const targetUrl = `${pathname}/${encodeURIComponent(item.word)}`;
                                    return (
                                        <div
                                            key={item.word}
                                            className="static-index-list__mobile-card"
                                            onClick={() => router.push(targetUrl)}
                                        >
                                            <div className="static-index-list__mobile-card-row">
                                                <div className="static-index-list__mobile-card-content">
                                                    <div className="static-index-list__mobile-card-word">
                                                        {item.word}
                                                    </div>
                                                    <div className="static-index-list__mobile-card-refs">
                                                        {item.references.length} references
                                                    </div>
                                                </div>
                                                <div className="static-index-list__mobile-action-circle">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="static-index-list__pagination">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        loading={false}
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

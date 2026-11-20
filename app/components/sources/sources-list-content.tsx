'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ScrollText, X, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button, Input } from '@/app/components/ui';
import { AlphabetChips } from '@/app/components/content-widgets';
import { GlossaryEntry, glossaryEntriesApi } from '@/api';

interface SourcesListContentProps {
    contentTypeLabel: string;
    itemNumber: string;
}

const CONTENT_TYPE_LABELS_AR: Record<string, string> = {
    Oration: 'الخطبة',
    Letter: 'الرسالة',
    Saying: 'الحكمة',
};

export default function SourcesListContent({ contentTypeLabel, itemNumber }: SourcesListContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [sources, setSources] = useState<GlossaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const contentTypeLabelAr = CONTENT_TYPE_LABELS_AR[contentTypeLabel] || contentTypeLabel;

    useEffect(() => {
        const fetchSources = async () => {
            try {
                setLoading(true);
                const parts = itemNumber.split('.');
                const isParagraphLevel = parts.length > 2;
                const response = await glossaryEntriesApi.getGlossaryEntries({
                    pageSize: 200,
                    ...(isParagraphLevel
                        ? { paragraphNumber: itemNumber }
                        : { postSermonNumber: itemNumber })
                });
                setSources(response.data || []);
            } catch (err) {
                console.error('Failed to fetch sources:', err);
                setError('فشل تحميل المصادر. يرجى المحاولة مرة أخرى لاحقاً.');
            } finally {
                setLoading(false);
            }
        };

        if (itemNumber) {
            fetchSources();
        }
    }, [itemNumber, contentTypeLabel]);

    const handleClearFilters = () => {
        setSearchQuery('');
    };

    const handleRowClick = (source: GlossaryEntry) => {
        router.push(`${pathname}/${source.documentId || source.id}`);
    };

    const hasActiveFilters = searchQuery !== '';

    const filteredSources = sources.filter(source => {
        const query = searchQuery.toLowerCase();
        return !!(
            (source.word && source.word.toLowerCase().includes(query)) ||
            (source.author && source.author.toLowerCase().includes(query)) ||
            (source.title && source.title.toLowerCase().includes(query)) ||
            (source.content && source.content.toLowerCase().includes(query)) ||
            (source.volumepage && source.volumepage.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div dir="rtl" className="index-content sources-page font-taha">
                <div className="index-content__state-wrapper">
                    <div className="index-content__state-card">
                        <Loader2 className="w-10 h-10 sources-page__spinner" />
                        <p className="index-content__state-text">جارٍ تحميل المصادر...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="index-content sources-page font-taha">
            {/* Hero Section */}
            <div className="index-content__hero">
                <div className="index-content__container">
                    <div className="index-content__header">
                        <div className="index-content__icon-box">
                            <ScrollText className="w-6 h-6" />
                        </div>
                        <h1 className="index-content__title sources-page__title">مصادر {contentTypeLabelAr} {itemNumber}</h1>
                    </div>
                    <p className="index-content__subtitle">مصادر تاريخية ومراجع تثبت صحة هذا النص.</p>
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
                                <h2 className="index-content__filter-title sources-page__title">التصفية</h2>
                                {hasActiveFilters && (
                                    <Button
                                        onClick={handleClearFilters}
                                        variant='danger'
                                        icon={<X className="w-4 h-4" />}
                                    >
                                        مسح الفلاتر
                                    </Button>
                                )}
                            </div>

                            <Input
                                label="البحث عن مصدر"
                                placeholder="ابحث حسب اسم المؤلف أو الكتاب..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="index-content__alphabet">
                    <AlphabetChips
                        selectedLetter=""
                        onSelectLetter={() => { }}
                        language="Arabic"
                    />
                </div>

                <div className="index-content__table-card">
                    <div className="index-content__corner-tl" />
                    <div className="index-content__corner-br" />
                    {error ? (
                        <div className="sources-page__message sources-page__message--error">{error}</div>
                    ) : filteredSources.length === 0 ? (
                        <div className="sources-page__message">لم يتم العثور على مصادر لهذا النص.</div>
                    ) : (
                        <div className="index-content__table-scroll">
                            <table className="index-content__table">
                                <thead className="index-content__thead">
                                    <tr>
                                        <th className="index-content__th index-content__th--right">المصدر</th>
                                        <th className="index-content__th index-content__th--right">المؤلف / الكتاب</th>
                                    </tr>
                                </thead>
                                <tbody className="index-content__tbody">
                                    {filteredSources.map((source) => (
                                        <tr
                                            key={source.id}
                                            onClick={() => handleRowClick(source)}
                                            className="sources-page__row"
                                        >
                                            <td className="index-content__td index-content__td--right">
                                                <Link
                                                    href={`${pathname}/${source.documentId || source.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="sources-page__link"
                                                >
                                                    {source.word}
                                                </Link>
                                                {source.volumepage && (
                                                    <div className="sources-page__muted">{source.volumepage}</div>
                                                )}
                                            </td>
                                            <td className="index-content__td index-content__td--right">
                                                <div className="sources-page__author">{source.author || '-'}</div>
                                                <div className="sources-page__muted">{source.title || '-'}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

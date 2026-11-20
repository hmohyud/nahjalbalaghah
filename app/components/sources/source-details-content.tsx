'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ScrollText, Loader2 } from 'lucide-react';
import { GlossaryEntry, glossaryEntriesApi } from '@/api';

interface SourceDetailsContentProps {
    documentId?: string;
}

export default function SourceDetailsContent({ documentId: propDocumentId }: SourceDetailsContentProps) {
    const params = useParams();
    const router = useRouter();

    // Support both old structure and new catch-all params
    const documentId = propDocumentId || (() => {
        if (params.slug && Array.isArray(params.slug)) return params.slug[1];
        if (params.params && Array.isArray(params.params) && params.params.length >= 4) {
            return params.params[3]; // /content/details/type/id/sources/documentId
        }
        return undefined;
    })();

    const [source, setSource] = useState<GlossaryEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSourceDetails = async () => {
            if (!documentId) return;
            try {
                setLoading(true);
                const foundSource = await glossaryEntriesApi.getGlossaryEntryByDocumentId(documentId);
                if (foundSource) {
                    setSource(foundSource);
                } else {
                    setError('المصدر غير موجود');
                }
            } catch (err) {
                console.error('Failed to fetch source details:', err);
                setError('فشل تحميل تفاصيل المصدر. يرجى المحاولة مرة أخرى لاحقاً.');
            } finally {
                setLoading(false);
            }
        };

        fetchSourceDetails();
    }, [documentId]);

    if (loading) {
        return (
            <div dir="rtl" className="index-content sources-page font-taha">
                <div className="index-content__state-wrapper">
                    <div className="index-content__state-card">
                        <Loader2 className="w-10 h-10 sources-page__spinner" />
                        <p className="index-content__state-text">جارٍ تحميل تفاصيل المصدر...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !source) {
        return (
            <div dir="rtl" className="index-content sources-page font-taha">
                <div className="index-content__state-wrapper">
                    <div className="index-content__state-card">
                        <p className="sources-page__message sources-page__message--error">{error || 'المصدر غير موجود'}</p>
                        <button
                            onClick={() => router.back()}
                            className="sources-page__back"
                        >
                            <ArrowRight className="w-4 h-4" />
                            رجوع
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="index-content sources-page font-taha">
            <div className="source-detail">
                <button
                    onClick={() => router.back()}
                    className="sources-page__back"
                >
                    <ArrowRight className="w-5 h-5" />
                    العودة إلى المصادر
                </button>

                <div className="source-detail__card">
                    <div className="index-content__corner-tl" />
                    <div className="index-content__corner-br" />

                    <div className="source-detail__header">
                        <div className="source-detail__eyebrow">
                            <ScrollText className="w-4 h-4" />
                            <span>مصدر تاريخي</span>
                        </div>
                        <h1 className="source-detail__title">{source.word}</h1>
                        <div className="source-detail__meta">
                            {source.author && <p className="source-detail__meta-primary">المؤلف: {source.author}</p>}
                            {source.title && <p>الكتاب: {source.title}</p>}
                            {source.publicationInformation && <p className="source-detail__meta-small">معلومات النشر: {source.publicationInformation}</p>}
                            {source.authorDate && <p className="source-detail__meta-small">تاريخ المؤلف: {source.authorDate}</p>}
                            {source.volumepage && <p className="source-detail__meta-small">{source.volumepage}</p>}
                        </div>
                    </div>
                    <div className="source-detail__body">
                        <div className="source-detail__content">
                            <p className="source-detail__content-text">{source.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

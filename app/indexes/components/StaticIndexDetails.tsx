'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    postsApi,
    radisApi,
    Post,
    RadisIntroduction
} from '@/api';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { parseTextReference } from '@/app/utils/text-reference';
import { getCategoryBySlug } from '@/app/data/indexes';

interface CombinedResult {
    type: 'Post' | 'Paragraph' | 'Radis';
    data: any;
    reference: string;
    sourceType?: 'Oration' | 'Letter' | 'Saying';
}

// Robust text matcher (handles singular/plural)
const checkTextMatch = (text: string, term: string) => {
    if (!text) return false;
    const t = term.toLowerCase().trim();
    const txt = text.toLowerCase();

    if (txt.includes(t)) return true;

    // Simple stemming/pluralization
    if (t.endsWith('s') && txt.includes(t.slice(0, -1))) return true; // adornments -> adornment
    if (t.endsWith('ies') && txt.includes(t.slice(0, -3) + 'y')) return true; // properties -> property
    if (t.endsWith('es') && txt.includes(t.slice(0, -2))) return true; // boxes -> box

    return false;
};

// Helper to find the matching paragraph or content in a post
const getMatchingContent = (post: Post, term: string, language?: 'english' | 'arabic') => {
    const title = (post.title || post.heading || '');
    if (language !== 'arabic' && checkTextMatch(title, term)) {
        return post.paragraphs?.[0]?.translations?.[0]?.text || post.translations?.[0]?.text || title;
    }

    // Check Paragraphs
    if (post.paragraphs && post.paragraphs.length > 0) {
        for (const p of post.paragraphs) {
            const eng = p.translations?.[0]?.text || '';
            const ara = p.arabic || '';
            const matchEng = language !== 'arabic' && checkTextMatch(eng, term);
            const matchAra = language !== 'english' && checkTextMatch(ara, term);

            if (matchEng || matchAra) {
                return (language === 'arabic' ? ara : eng) || (language === 'english' ? eng : ara);
            }
        }
    }

    // Check Post Translations (if paragraphs didn't handle it)
    if (post.translations && language !== 'arabic') {
        for (const t of post.translations) {
            if (checkTextMatch(t.text, term)) {
                return t.text;
            }
        }
    }

    return null;
};

// Helper to filter out invalid/accidental posts
const isValidPost = (post: Post) => {
    if (post.title === 'Topic 1') return false;
    if (!post.sermonNumber) return false;
    return true;
};

interface StaticIndexDetailsProps {
    categorySlug: string;
    termSlug: string; // The word itself
}

export default function StaticIndexDetails({ categorySlug, termSlug }: StaticIndexDetailsProps) {
    const router = useRouter();
    const [results, setResults] = useState<CombinedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const term = decodeURIComponent(termSlug).trim();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Look up the term in static data
                const category = getCategoryBySlug(categorySlug);
                if (!category) {
                    setError('Category not found');
                    return;
                }

                const item = category.items.find(i => i.word.toLowerCase() === term.toLowerCase());

                // If not found, maybe show a "Not Found" message, but let's try to proceed if we had IDs...
                // but actually we rely on static data for IDs.
                if (!item) {
                    setError(`Term "${term}" not found in this index.`);
                    setLoading(false);
                    return;
                }

                const textNumbers = item.references;
                const combined: CombinedResult[] = [];
                const fetchedIds = new Set<string>();

                // 2. Fetch and Verify References
                if (textNumbers.length > 0) {
                    const promises = textNumbers.map(async (refValue) => {
                        const parsed = parseTextReference(refValue);
                        if (!parsed) return null;

                        const { type, sectionNumber } = parsed;

                        try {
                            if (type === 'introduction') {
                                // "0.5" -> Radis Intro 5
                                const radisRes = await radisApi.getRadisIntroductionsByNumbers([sectionNumber]);
                                if (radisRes.data && radisRes.data.length > 0) {
                                    const item = radisRes.data[0];
                                    return { type: 'Radis', data: item, reference: refValue };
                                }
                            } else {
                                // Posts: "1.94.2" -> Query Sermon "1.94"
                                const parts = sectionNumber.split('.');
                                const mainId = parts[0];
                                const subId = parts.length > 1 ? parts[1] : null;

                                const typeMap: Record<string, string> = { 'oration': 'Oration', 'letter': 'Letter', 'saying': 'Saying' };
                                const prefixMap: Record<string, string> = { 'oration': '1.', 'letter': '2.', 'saying': '3.' };

                                const querySermonNumber = `${prefixMap[type] || ''}${mainId}`;

                                const postsRes = await postsApi.getPosts({ filters: { sermonNumber: querySermonNumber } });
                                if (postsRes.data) {
                                    const matchedPost = postsRes.data.find(p => p.type === typeMap[type] && isValidPost(p));
                                    if (matchedPost) {
                                        if (subId) {
                                            // Robust paragraph finding
                                            const targetPara = matchedPost.paragraphs?.find(p => {
                                                if (!p.number) return false;
                                                const numStr = p.number.toString();
                                                return numStr === subId || numStr.endsWith(`.${subId}`);
                                            });

                                            if (targetPara) {
                                                return { type: 'Post', data: matchedPost, reference: refValue, sourceType: matchedPost.type as any };
                                            }
                                        } else {
                                            // Whole Post Ref
                                            return { type: 'Post', data: matchedPost, reference: refValue, sourceType: matchedPost.type as any };
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(`Failed to fetch ref ${refValue}`, e);
                        }
                        return null;
                    });

                    const resultsFromRefs = await Promise.all(promises);
                    resultsFromRefs.forEach(r => {
                        if (r && !fetchedIds.has(r.reference)) {
                            combined.push(r as CombinedResult);
                            fetchedIds.add(r.reference);
                        }
                    });
                }

                // Sort: Defined Refs only.
                combined.sort((a, b) => {
                    return a.reference.localeCompare(b.reference, undefined, { numeric: true });
                });

                setResults(combined);

            } catch (err) {
                console.error('Error fetching term details:', err);
                setError('Failed to load details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (term) {
            fetchData();
        }
    }, [term, categorySlug]);

    if (loading) {
        return (
            <div className="static-index-details__loading">
                <div className="static-index-details__spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="static-index-details__error">
                <div className="static-index-details__error-text">{error}</div>
                <Button onClick={() => router.back()} variant="outlined">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="static-index-details">
            {/* Header */}
            <div className="static-index-details__header">
                <div className="static-index-details__header-inner">
                    <Button
                        onClick={() => router.back()}
                        variant="outlined"
                        className="static-index-details__back-btn"
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                    <h1 className="static-index-details__title">
                        "{term}"
                    </h1>
                    <div className="static-index-details__spacer"></div>
                </div>
            </div>

            <div className="static-index-details__content">
                {results.length === 0 ? (
                    <div className="static-index-details__empty">
                        <p className="static-index-details__empty-text">No content found for "{term}".</p>
                    </div>
                ) : (
                    results.map((item, index) => (
                        <ContentCard key={`${item.type}-${item.reference}-${index}`} item={item} term={term} />
                    ))
                )}
            </div>
        </div>
    );
}

function ContentCard({ item, term }: { item: CombinedResult; term: string }) {
    const { type, data } = item;
    // We default to 'english' for static indexes for now, as checkTextMatch is mainly for English unless specified
    const language = 'english';

    if (type === 'Post') {
        const post = data as Post;
        const defaultText = post.paragraphs?.[0]?.translations?.[0]?.text;

        // We try to find content that matches the term, OR just show the default first paragraph if term not found in text
        // (Since these are static references, the term MIGHT NOT actually be in the text if our dummy data is just random refs)
        // BUT providing a good user experience means we should define our dummy data carefully OR handles cases gracefully.
        // For now, let's just show whatever text we have.
        const mainContent = getMatchingContent(post, term, language) || defaultText || 'No displayed content available';

        const displayTitle = post.title || post.heading || `Oration ${post.sermonNumber}`;

        return (
            <div className="static-index-details__card">
                <div className="static-index-details__card-header">
                    <div className="static-index-details__card-badges">
                        <span className="static-index-details__card-type-badge">
                            {post.type}
                        </span>
                        <span className="static-index-details__card-number">#{post.sermonNumber}</span>
                    </div>
                </div>

                <h3 className="static-index-details__card-title">{displayTitle}</h3>

                <div className="static-index-details__card-content">
                    <div className="static-index-details__card-text">
                        <div className="static-index-details__card-text-clamp">
                            <HighlightText text={mainContent} term={term} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'Paragraph') {
        // Not used heavily in current logic but kept for completeness
        return null;
    }

    if (type === 'Radis') {
        const radis = data as RadisIntroduction;

        return (
            <div className="static-index-details__card">
                <div className="static-index-details__card-header">
                    <div className="static-index-details__card-badges">
                        <span className="static-index-details__card-type-badge--radis">
                            Radis Introduction
                        </span>
                        <span className="static-index-details__card-number">#{radis.number}</span>
                    </div>
                </div>

                <div>
                    <HighlightText text={radis.translation} term={term} />
                </div>
            </div>
        );
    }

    return null;
}

function HighlightText({ text, term }: { text: string; term: string }) {
    if (!text) return null;
    if (!term) return <p className="static-index-details__highlight-text">{text}</p>;

    const t = term.toLowerCase().trim();

    // Simple highlight
    // Create robust pattern for simple plurals/variants
    // (Simplified from original for Brevity in this specific task)
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = `${escape(t)}(?:s|es|ies)?`;

    const parts = text.split(new RegExp(`(${regexStr})`, 'gi'));

    return (
        <p className="static-index-details__highlight-text">
            {parts.map((part, i) =>
                new RegExp(`^${regexStr}$`, 'i').test(part) ? (
                    <span key={i} className="static-index-details__highlight-mark">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </p>
    );
}

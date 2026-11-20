'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    postsApi,
    paragraphsApi,
    radisApi,
    conclusionsApi,
    indexTermsApi,
    quranHadithApi,
    namePlacesApi,
    religiousConceptsApi,
    Post,
    RadisIntroduction,
    Conclusion,
    LinkedFootnote,
} from '@/api';
import { ArrowLeft, ArrowRight, BookOpen, Languages, MapPin, Scale, BookA } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { parseTextReference } from '@/app/utils/text-reference';

interface CombinedResult {
    type: 'Post' | 'Paragraph' | 'Radis' | 'Conclusion';
    data: any;
    reference: string;
    sourceType?: 'Oration' | 'Letter' | 'Saying';
    matchingParagraphNumber?: string;
    matchingContent?: string;
}

const getResultDedupKey = (item: CombinedResult): string => {
    if (item.type === 'Post') {
        return `Post:${(item.data as Post).id}`;
    }
    if (item.type === 'Paragraph') {
        const postId = (item.data?.post as Post | undefined)?.id ?? 'unknown';
        const paragraphNumber = item.data?.paragraph?.number ?? item.matchingParagraphNumber ?? item.reference;
        return `Paragraph:${postId}:${paragraphNumber}`;
    }
    if (item.type === 'Radis') {
        return `Radis:${(item.data as RadisIntroduction).number}`;
    }
    if (item.type === 'Conclusion') {
        return `Conclusion:${(item.data as Conclusion).number}`;
    }
    return `${item.type}:${item.reference}`;
};

const checkTextMatch = (text: string, term: string) => {
    if (!text) return false;
    const t = term.toLowerCase().trim();
    const txt = text.toLowerCase();
    if (txt.includes(t)) return true;
    if (t.endsWith('s') && txt.includes(t.slice(0, -1))) return true;
    if (t.endsWith('ies') && txt.includes(t.slice(0, -3) + 'y')) return true;
    if (t.endsWith('es') && txt.includes(t.slice(0, -2))) return true;
    return false;
};

const extractMatchingSentence = (text: string, term: string): string | null => {
    if (!text || !term) return null;
    const t = term.toLowerCase().trim();
    const txtLower = text.toLowerCase();
    let termIndex = txtLower.indexOf(t);
    if (termIndex === -1) {
        if (t.endsWith('s')) termIndex = txtLower.indexOf(t.slice(0, -1));
        else if (t.endsWith('ies')) termIndex = txtLower.indexOf(t.slice(0, -3) + 'y');
        else if (t.endsWith('es')) termIndex = txtLower.indexOf(t.slice(0, -2));
    }
    if (termIndex === -1) return null;
    const sentenceEnders = /[.!?؟]/;
    let sentenceStart = 0;
    for (let i = termIndex - 1; i >= 0; i--) {
        if (sentenceEnders.test(text[i])) {
            sentenceStart = i + 1;
            break;
        }
    }
    let sentenceEnd = text.length;
    for (let i = termIndex; i < text.length; i++) {
        if (sentenceEnders.test(text[i])) {
            sentenceEnd = i + 1;
            break;
        }
    }
    let sentence = text.slice(sentenceStart, sentenceEnd).trim();
    if (sentence.length < 50 && text.length > sentence.length) {
        const contextStart = Math.max(0, termIndex - 100);
        const contextEnd = Math.min(text.length, termIndex + 100);
        sentence = text.slice(contextStart, contextEnd).trim();
        if (contextStart > 0) sentence = '...' + sentence;
        if (contextEnd < text.length) sentence = sentence + '...';
    }
    return sentence;
};

const getMatchingContent = (post: Post, term: string, language?: 'english' | 'arabic'): { content: string; paragraphNumber?: string } | null => {
    const title = (post.title || post.heading || '');
    if (language !== 'arabic' && checkTextMatch(title, term)) {
        const text = post.paragraphs?.[0]?.translations?.[0]?.text || post.translations?.[0]?.text || title;
        const matchingSentence = extractMatchingSentence(text, term);
        return { content: matchingSentence || text, paragraphNumber: undefined };
    }
    if (post.paragraphs && post.paragraphs.length > 0) {
        for (const p of post.paragraphs) {
            const eng = p.translations?.[0]?.text || '';
            const ara = p.arabic || '';
            const matchEng = language !== 'arabic' && checkTextMatch(eng, term);
            const matchAra = language !== 'english' && checkTextMatch(ara, term);
            if (matchEng || matchAra) {
                const fullText = (language === 'arabic' ? ara : eng) || (language === 'english' ? eng : ara);
                const matchingSentence = extractMatchingSentence(fullText, term);
                return { content: matchingSentence || fullText, paragraphNumber: p.number };
            }
        }
    }
    if (post.translations && language !== 'arabic') {
        for (const t of post.translations) {
            if (checkTextMatch(t.text, term)) {
                const matchingSentence = extractMatchingSentence(t.text, term);
                return { content: matchingSentence || t.text, paragraphNumber: undefined };
            }
        }
    }
    return null;
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'terms': Languages,
    'names-places': MapPin,
    'quran-hadith': BookOpen,
    'religious-concepts': Scale,
    'glossary': BookA,
};

const isValidPost = (post: Post) => {
    if (post.title === 'Topic 1') return false;
    if (!post.sermonNumber) return false;
    return true;
};

export default function IndexDetailDispatcher() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Support both old structure and new catch-all params
    let details = params.details as string[] | undefined;
    let slugParam = params.slug as string | undefined;
    // Legacy /indexes/details/<slug>/<term> URLs: shift past the 'details' segment
    // (mirrors the shift done in app/indexes/[slug]/[[...details]]/page.tsx)
    if (slugParam === 'details' && details && details.length > 0) {
        slugParam = details[0];
        details = details.slice(1);
    }
    const category = slugParam || (params.params && Array.isArray(params.params) ? params.params[0] : '');
    const termId = (params.id as string) || (details && Array.isArray(details) ? details[0] : '') || (params.params && Array.isArray(params.params) ? params.params[1] : '');

    const term = decodeURIComponent(termId).trim();
    const refsParam = searchParams.get('refs');
    const entryId = searchParams.get('entry');

    const [results, setResults] = useState<CombinedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'english' | 'arabic' | undefined>(undefined);
    const [displayTitle, setDisplayTitle] = useState<string>(term);
    const [glossaryDescription, setGlossaryDescription] = useState<string | null>(null);
    const [hasLinkedTextReferences, setHasLinkedTextReferences] = useState(true);
    const [linkedFootnotes, setLinkedFootnotes] = useState<LinkedFootnote[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setLinkedFootnotes([]);
            let detectedLanguage: 'english' | 'arabic' | undefined = undefined;

            try {
                let textNumbers: string[] = [];
                let indexItem: any = null;
                setHasLinkedTextReferences(true);

                if (refsParam) {
                    textNumbers = refsParam.split(',').filter(Boolean);
                    const isArabicChar = /[\u0600-\u06FF]/.test(term);
                    detectedLanguage = isArabicChar ? 'arabic' : 'english';
                } else {
                    const api = {
                        'terms': indexTermsApi.getIndexTerms,
                        'quran-hadith': quranHadithApi.getQuranHadiths,
                        'names-places': namePlacesApi.getNamePlaces,
                        'religious-concepts': religiousConceptsApi.getReligiousConcepts
                    }[category];

                    if (!api) {
                        setError('Invalid category');
                        setLoading(false);
                        return;
                    }

                    // Special case for Quran Hadith search keys
                    let filters: any = {};
                    if (category === 'quran-hadith') {
                        filters.verse_translation = term;
                    } else if (category !== 'religious-concepts') {
                        filters.word_english = term;
                    }

                    let response = null;
                    if (Object.keys(filters).length > 0) {
                        response = await api(1, 1, filters);
                    }

                    if (response && response.data && response.data.length > 0) {
                        indexItem = response.data[0];
                        detectedLanguage = 'english';
                        if (category === 'quran-hadith') setDisplayTitle(indexItem.verse_translation || term);
                    } else {
                        let arabicFilters: any = { word_arabic: term };
                        if (category === 'quran-hadith') arabicFilters = { verse_text: term };

                        response = await api(1, 1, arabicFilters);
                        if (response.data && response.data.length > 0) {
                            indexItem = response.data[0];
                            detectedLanguage = 'arabic';
                            if (category === 'quran-hadith') setDisplayTitle(indexItem.verse_text || term);
                        }
                    }

                    if (indexItem && indexItem.text_numbers) {
                        textNumbers = indexItem.text_numbers.map((t: any) => t.value);
                    }
                }

                if (entryId) {
                    const getEntryById = {
                        'terms': indexTermsApi.getIndexTermById,
                        'names-places': namePlacesApi.getNamePlaceById,
                        'quran-hadith': quranHadithApi.getQuranHadithById,
                    }[category];

                    if (getEntryById) {
                        const entryResponse = await getEntryById(entryId);
                        indexItem = entryResponse.data;
                        if (!refsParam && indexItem?.text_numbers) {
                            textNumbers = indexItem.text_numbers.map((t: any) => t.value);
                        }
                    }
                }

                setLinkedFootnotes(
                    Array.isArray(indexItem?.LinkFootnote)
                        ? indexItem.LinkFootnote.filter((note: LinkedFootnote) => note?.text?.trim())
                        : []
                );

                setLanguage(detectedLanguage);
                setHasLinkedTextReferences(textNumbers.length > 0);

                const combined: CombinedResult[] = [];
                const fetchedReferences = new Set<string>();
                const fetchedContentKeys = new Set<string>();

                const postsBySermonNumber = new Map<string, Post[]>();
                if (textNumbers.length > 0) {
                    const parsedRefs = textNumbers
                        .map((refValue) => ({ refValue, parsed: parseTextReference(refValue) }))
                        .filter((x): x is { refValue: string; parsed: NonNullable<ReturnType<typeof parseTextReference>> } => !!x.parsed);

                    const typeMap: Record<string, string> = { 'oration': 'Oration', 'letter': 'Letter', 'saying': 'Saying' };
                    const prefixMap: Record<string, string> = { 'oration': '1.', 'letter': '2.', 'saying': '3.' };

                    const sermonNumbersByType: Record<'oration' | 'letter' | 'saying', Set<string>> = {
                        oration: new Set<string>(),
                        letter: new Set<string>(),
                        saying: new Set<string>(),
                    };

                    for (const { parsed } of parsedRefs) {
                        if (parsed.type !== 'oration' && parsed.type !== 'letter' && parsed.type !== 'saying') continue;
                        const mainId = parsed.sectionNumber.split('.')[0];
                        const sermonNumber = `${prefixMap[parsed.type]}${mainId}`;
                        sermonNumbersByType[parsed.type].add(sermonNumber);
                    }

                    const fetchTypePosts = async (type: 'oration' | 'letter' | 'saying') => {
                        const sermonNumbers = Array.from(sermonNumbersByType[type]);
                        if (sermonNumbers.length === 0) return;
                        const res = await postsApi.getPosts({
                            filters: { sermonNumber: sermonNumbers, type: typeMap[type] },
                            pageSize: Math.max(50, sermonNumbers.length * 3),
                        });
                        for (const post of res.data || []) {
                            if (!post?.sermonNumber) continue;
                            const arr = postsBySermonNumber.get(post.sermonNumber) || [];
                            arr.push(post);
                            postsBySermonNumber.set(post.sermonNumber, arr);
                        }
                    };

                    await Promise.all([
                        fetchTypePosts('oration').catch((e) => console.error('Failed to prefetch orations for refs', e)),
                        fetchTypePosts('letter').catch((e) => console.error('Failed to prefetch letters for refs', e)),
                        fetchTypePosts('saying').catch((e) => console.error('Failed to prefetch sayings for refs', e)),
                    ]);
                }

                const pushUniqueResult = (item: CombinedResult | null) => {
                    if (!item) return;

                    const dedupKey = getResultDedupKey(item);
                    if (fetchedContentKeys.has(dedupKey)) {
                        return;
                    }

                    // Keep existing behavior of tracking references while avoiding content duplicates.
                    fetchedReferences.add(item.reference);
                    fetchedContentKeys.add(dedupKey);
                    combined.push(item);
                };

                if (textNumbers.length > 0) {
                    const promises = textNumbers.map(async (refValue) => {
                        const parsed = parseTextReference(refValue);
                        if (!parsed) return null;

                        const { type, sectionNumber } = parsed;

                        try {
                            if (type === 'introduction') {
                                const radisRes = await radisApi.getRadisIntroductionsByNumbers([sectionNumber]);
                                if (radisRes.data && radisRes.data.length > 0) {
                                    const item = radisRes.data[0];
                                    const preferred = detectedLanguage === 'arabic' ? (item.arabic || '') : (item.translation || '');
                                    const fallback = detectedLanguage === 'arabic' ? (item.translation || '') : (item.arabic || '');
                                    const textToSearch = preferred || fallback || '';
                                    const matchingSentence = extractMatchingSentence(textToSearch, term);
                                    return {
                                        type: 'Radis',
                                        data: item,
                                        reference: refValue,
                                        matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                    };
                                }

                                // Some index references can resolve to conclusion entries.
                                const conclusionsRes = await conclusionsApi.getConclusionsByNumbers([sectionNumber]);
                                if (conclusionsRes.data && conclusionsRes.data.length > 0) {
                                    const item = conclusionsRes.data[0];
                                    const preferred = detectedLanguage === 'arabic' ? (item.arabic || '') : (item.translation || '');
                                    const fallback = detectedLanguage === 'arabic' ? (item.translation || '') : (item.arabic || '');
                                    const textToSearch = preferred || fallback || '';
                                    const matchingSentence = extractMatchingSentence(textToSearch, term);
                                    return {
                                        type: 'Conclusion',
                                        data: item,
                                        reference: refValue,
                                        matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                    };
                                }
                            } else if (type === 'conclusion') {
                                const conclusionsRes = await conclusionsApi.getConclusionsByNumbers([sectionNumber]);
                                if (conclusionsRes.data && conclusionsRes.data.length > 0) {
                                    const item = conclusionsRes.data[0];
                                    const preferred = detectedLanguage === 'arabic' ? (item.arabic || '') : (item.translation || '');
                                    const fallback = detectedLanguage === 'arabic' ? (item.translation || '') : (item.arabic || '');
                                    const textToSearch = preferred || fallback || '';
                                    const matchingSentence = extractMatchingSentence(textToSearch, term);
                                    return {
                                        type: 'Conclusion',
                                        data: item,
                                        reference: refValue,
                                        matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                    };
                                }
                            } else {
                                const typeMap: Record<string, string> = { 'oration': 'Oration', 'letter': 'Letter', 'saying': 'Saying' };
                                const prefixMap: Record<string, string> = { 'oration': '1.', 'letter': '2.', 'saying': '3.' };

                                const parts = sectionNumber.split('.');
                                const mainId = parts[0];
                                const subId = parts.length > 1 ? parts[1] : null;

                                const itemNumber = mainId;
                                const querySermonNumber = `${prefixMap[type] || ''}${itemNumber}`;

                                const fromCache = postsBySermonNumber.get(querySermonNumber) || [];
                                const cacheCandidates = fromCache.filter(p => p.type === typeMap[type] && isValidPost(p));

                                let candidatePosts: Post[] = cacheCandidates;
                                if (candidatePosts.length === 0) {
                                    const postsRes = await postsApi.getPosts({
                                        filters: {
                                            $or: [
                                                { sermonNumber: itemNumber },
                                                { sermonNumber: querySermonNumber },
                                                { sermonNumberEndsWith: `.${itemNumber}` }
                                            ],
                                            type: typeMap[type]
                                        },
                                        pageSize: 50
                                    });
                                    candidatePosts = (postsRes.data || []).filter(p => p.type === typeMap[type] && isValidPost(p));
                                }

                                if (candidatePosts.length > 0) {
                                    const matchedPost = candidatePosts.find(p => {
                                        const pNum = p.sermonNumber?.split('.').pop();
                                        return pNum === itemNumber;
                                    }) || candidatePosts[0];
                                    if (matchedPost) {
                                        if (subId) {
                                            const targetPara = matchedPost.paragraphs?.find(p => {
                                                if (!p.number) return false;
                                                const numStr = p.number.toString();
                                                return numStr === subId || numStr.endsWith(`.${subId}`) || numStr === `${querySermonNumber}.${subId}`;
                                            });

                                            if (targetPara) {
                                                const eng = targetPara.translations?.[0]?.text || '';
                                                const ara = targetPara.arabic || '';
                                                const preferred = detectedLanguage === 'arabic' ? ara : eng;
                                                const fallback = detectedLanguage === 'arabic' ? eng : ara;
                                                const textToSearch = preferred || fallback || '';
                                                const matchingSentence = extractMatchingSentence(textToSearch, term);
                                                return {
                                                    type: 'Paragraph',
                                                    data: { post: matchedPost, paragraph: targetPara },
                                                    reference: refValue,
                                                    sourceType: matchedPost.type as any,
                                                    matchingParagraphNumber: targetPara.number,
                                                    matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                                };
                                            }
                                        }
                                        const preferredFirstContent = detectedLanguage === 'arabic'
                                            ? (matchedPost.paragraphs?.[0]?.arabic || matchedPost.TocArabic || '')
                                            : (matchedPost.paragraphs?.[0]?.translations?.[0]?.text || matchedPost.translations?.[0]?.text || matchedPost.heading || '');

                                        const fallbackFirstContent = detectedLanguage === 'arabic'
                                            ? (matchedPost.paragraphs?.[0]?.translations?.[0]?.text || matchedPost.translations?.[0]?.text || matchedPost.heading || '')
                                            : (matchedPost.paragraphs?.[0]?.arabic || matchedPost.TocArabic || '');

                                        const firstContent = preferredFirstContent || fallbackFirstContent || '';

                                        const matchingSentence = extractMatchingSentence(firstContent, term);
                                        return {
                                            type: 'Post',
                                            data: matchedPost,
                                            reference: refValue,
                                            sourceType: matchedPost.type as any,
                                            matchingContent: matchingSentence || firstContent.slice(0, 300) + (firstContent.length > 300 ? '...' : '')
                                        };
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(`Failed to fetch ref ${refValue}`, e);
                        }
                        return null;
                    });

                    const resultsFromRefs = await Promise.all(promises);
                    resultsFromRefs.forEach(r => pushUniqueResult(r as CombinedResult));
                }

                // Also search introductions/conclusions directly by term so index entries are not limited
                // to whichever text refs were explicitly attached in the index dataset.
                if (term) {
                    const [radisSearchRes, conclusionsSearchRes] = await Promise.all([
                        radisApi.searchRadisIntroductions(term, 1, 100).catch((err) => {
                            console.error('Error searching introductions in index dispatcher:', err);
                            return null;
                        }),
                        conclusionsApi.searchConclusions(term, 1, 100).catch((err) => {
                            console.error('Error searching conclusions in index dispatcher:', err);
                            return null;
                        })
                    ]);

                    if (radisSearchRes?.data) {
                        for (const intro of radisSearchRes.data) {
                            const preferred = detectedLanguage === 'arabic' ? (intro.arabic || '') : (intro.translation || '');
                            const fallback = detectedLanguage === 'arabic' ? (intro.translation || '') : (intro.arabic || '');
                            const textToSearch = preferred || fallback || '';
                            const matchingSentence = extractMatchingSentence(textToSearch, term);

                            pushUniqueResult({
                                type: 'Radis',
                                data: intro,
                                reference: `0.${intro.number}`,
                                matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                            });
                        }
                    }

                    if (conclusionsSearchRes?.data) {
                        for (const conclusion of conclusionsSearchRes.data) {
                            const preferred = detectedLanguage === 'arabic' ? (conclusion.arabic || '') : (conclusion.translation || '');
                            const fallback = detectedLanguage === 'arabic' ? (conclusion.translation || '') : (conclusion.arabic || '');
                            const textToSearch = preferred || fallback || '';
                            const matchingSentence = extractMatchingSentence(textToSearch, term);

                            pushUniqueResult({
                                type: 'Conclusion',
                                data: conclusion,
                                reference: `4.${conclusion.number}`,
                                matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                            });
                        }
                    }
                }

                combined.sort((a, b) => a.reference.localeCompare(b.reference, undefined, { numeric: true }));
                setResults(combined);

                if (category === 'names-places') {
                    try {
                        const glossaryRes = await namePlacesApi.getGlossaryDescription(term);
                        if (glossaryRes.data && glossaryRes.data.length > 0) {
                            setGlossaryDescription(glossaryRes.data[0].description);
                        }
                    } catch (gErr) {
                        console.error('Error fetching glossary:', gErr);
                    }
                }

            } catch (err) {
                console.error('Error fetching details:', err);
                setError('Failed to load details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (term) fetchData();
    }, [term, refsParam, entryId, category]);

    if (loading) {
        return (
            <div className="index-detail__loading">
                <div className="index-detail__spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="index-detail__error-wrapper">
                <div className="index-detail__error-box">
                    <div className="index-detail__corner--tl"></div>
                    <div className="index-detail__corner--tr"></div>
                    <div className="index-detail__corner--bl"></div>
                    <div className="index-detail__corner--br"></div>
                    <div className="index-detail__error-msg">{error}</div>
                    <Button onClick={() => router.back()} variant="outlined">Go Back</Button>
                </div>
            </div>
        );
    }

    const CategoryIcon = CATEGORY_ICONS[category] || BookOpen;
    const isArabicView = language === 'arabic';

    return (
        <div className="index-detail__page">
            {/* Header */}
            <div className="index-detail__header">
                <div className="index-detail__header-inner">
                    <button
                        onClick={() => router.back()}
                        className="index-detail__back-btn"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="index-detail__back-label">Back</span>
                    </button>
                    <div className="index-detail__header-center">
                        <div className="index-detail__icon-box">
                            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className={category === 'quran-hadith' ? 'index-detail__title-wrap--wide' : 'index-detail__title-wrap'}>
                            <h1 className={`index-detail__title ${isArabicView ? 'font-taha' : ''}`}>
                                &ldquo;{displayTitle || term}&rdquo;
                            </h1>
                            {language && (
                                <span className="index-detail__language-label">{language}</span>
                            )}
                        </div>
                    </div>
                    <div className="index-detail__header-spacer"></div>
                </div>
            </div>

            {/* Results */}
            <div className="index-detail__results">
                {category === 'names-places' && glossaryDescription && (
                    <div className={`index-detail__glossary ${isArabicView ? 'index-detail__glossary--rtl' : ''}`} dir={isArabicView ? 'rtl' : 'ltr'}>
                        <p className={`index-detail__glossary-text ${isArabicView ? 'font-taha' : ''}`}>
                            {glossaryDescription}
                        </p>
                    </div>
                )}

                {results.length === 0 ? (
                    <div className="index-detail__empty">
                        <div className="index-detail__corner--tl"></div>
                        <div className="index-detail__corner--tr"></div>
                        <div className="index-detail__corner--bl"></div>
                        <div className="index-detail__corner--br"></div>
                        <p className="index-detail__empty-text">
                            {category === 'quran-hadith' && !hasLinkedTextReferences
                                ? 'This entry does not have any linked text references yet.'
                                : <>No content found for &ldquo;{displayTitle || term}&rdquo;.</>}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="index-detail__count">
                            Found {results.length} reference{results.length !== 1 ? 's' : ''}
                        </p>
                        {results.map((item, index) => (
                            <ContentCard key={`${item.type}-${item.reference}-${index}`} item={item} term={term} language={language} />
                        ))}
                    </>
                )}

                {linkedFootnotes.length > 0 && (
                    <section className="index-detail__footnotes" aria-labelledby="linked-footnotes-heading">
                        <div className="index-detail__footnotes-header">
                            <div className="index-detail__icon-box">
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                                <h2 id="linked-footnotes-heading" className="index-detail__footnotes-title">Footnotes</h2>
                                <p className="index-detail__count">Notes linked to &ldquo;{displayTitle || term}&rdquo;</p>
                            </div>
                        </div>

                        <div className="index-detail__footnotes-list">
                            {linkedFootnotes.map((footnote, index) => (
                                <article key={footnote.id} className="index-detail__card--static index-detail__footnote">
                                    <div className="index-detail__corner--tl"></div>
                                    <div className="index-detail__corner--br"></div>
                                    <span className="index-detail__footnote-number">{index + 1}</span>
                                    <div className="index-detail__footnote-body">
                                        <HighlightText text={footnote.text} term={term} language={language} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

const POST_TYPE_LABEL: Record<string, string> = { Oration: 'Oration', Letter: 'Letter', Saying: 'Saying' };

function getPostDisplayTitle(post: Post, language?: 'english' | 'arabic') {
    let displayTitle = post.title || post.heading || `${post.type} ${post.sermonNumber}`;
    const isArabicTitle = /[؀-ۿ]/.test(displayTitle);
    if (language === 'english' && isArabicTitle) {
        if (post.title && !/[؀-ۿ]/.test(post.title)) displayTitle = post.title;
        else displayTitle = `${post.type === 'Oration' ? 'Sermon' : post.type} ${post.sermonNumber}`;
    } else if (language === 'arabic' && !isArabicTitle) {
        if (post.heading && /[؀-ۿ]/.test(post.heading)) displayTitle = post.heading;
    }
    return displayTitle;
}

function ResultCard({
    onClick,
    tags,
    title,
    titleIsArabic,
    body,
    linkLabel,
}: {
    onClick: () => void;
    tags: React.ReactNode;
    title?: string;
    titleIsArabic?: boolean;
    body: React.ReactNode;
    linkLabel: string;
}) {
    return (
        <div className="index-detail__card group" onClick={onClick}>
            {/* Accent corners on hover */}
            <div className="index-detail__corner-hover--tl"></div>
            <div className="index-detail__corner-hover--tr"></div>
            <div className="index-detail__corner-hover--bl"></div>
            <div className="index-detail__corner-hover--br"></div>

            <div className="index-detail__card-header">
                <div className="index-detail__card-tags">{tags}</div>
                <div className="index-detail__arrow-box">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 index-detail__arrow-icon" />
                </div>
            </div>

            {title && (
                <h3 className={`index-detail__card-title ${titleIsArabic ? 'font-taha' : ''}`} dir={titleIsArabic ? 'rtl' : undefined}>
                    {title}
                </h3>
            )}

            <div className="index-detail__card-body">{body}</div>

            <div className="index-detail__card-footer">
                <span className="index-detail__card-link">{linkLabel} →</span>
            </div>
        </div>
    );
}

function ContentCard({ item, term, language }: { item: CombinedResult; term: string; language?: 'english' | 'arabic' }) {
    const router = useRouter();
    const { type, data, matchingContent, matchingParagraphNumber } = item;

    const getNavigationUrl = (): string | null => {
        if (type === 'Post' || type === 'Paragraph') {
            const post = (type === 'Post' ? data : data?.post) as Post;
            const contentTypeMap: Record<string, string> = { 'Oration': 'orations', 'Letter': 'letters', 'Saying': 'sayings' };
            const contentType = contentTypeMap[post.type] || 'orations';
            const params = new URLSearchParams();
            const highlightRef = type === 'Post'
                ? (matchingParagraphNumber || post.sermonNumber)
                : (matchingParagraphNumber || data?.paragraph?.number || post.sermonNumber);
            if (highlightRef) params.set('highlightRef', highlightRef);
            const isArabicTerm = /[؀-ۿ]/.test(term);
            if (isArabicTerm) params.set('arabicWord', term);
            else params.set('word', term);
            return `/content/details/${contentType}/${post.id}?${params.toString()}`;
        }
        if (type === 'Radis') {
            const radis = data as RadisIntroduction;
            return `/radis?highlightRef=${radis.number.startsWith('0.') ? radis.number : `0.${radis.number}`}`;
        }
        if (type === 'Conclusion') {
            const conclusion = data as Conclusion;
            return `/conclusions?highlightRef=${conclusion.number}`;
        }
        return null;
    };

    const handleCardClick = () => {
        const url = getNavigationUrl();
        if (url) router.push(url);
    };

    if (type === 'Post') {
        const post = data as Post;
        const displayTitle = getPostDisplayTitle(post, language);
        return (
            <ResultCard
                onClick={handleCardClick}
                tags={<>
                    <span className="index-detail__tag--primary">{POST_TYPE_LABEL[post.type] || post.type}</span>
                    <span className="index-detail__tag--secondary">#{post.sermonNumber}</span>
                    {matchingParagraphNumber && <span className="index-detail__tag--para">Para: {matchingParagraphNumber}</span>}
                </>}
                title={displayTitle}
                titleIsArabic={/[؀-ۿ]/.test(displayTitle)}
                body={<HighlightText text={matchingContent || 'No content available'} term={term} language={language} />}
                linkLabel={`View full ${post.type.toLowerCase()}`}
            />
        );
    }

    if (type === 'Paragraph') {
        const post = data?.post as Post;
        const paragraph = data?.paragraph;
        const displayContent =
            matchingContent ||
            (language === 'arabic' ? (paragraph?.arabic || '') : (paragraph?.translations?.[0]?.text || '')) ||
            'No content available';
        const displayTitle = getPostDisplayTitle(post, language);
        return (
            <ResultCard
                onClick={handleCardClick}
                tags={<>
                    <span className="index-detail__tag--accent">Paragraph</span>
                    <span className="index-detail__tag--primary">{POST_TYPE_LABEL[post.type] || post.type}</span>
                    <span className="index-detail__tag--secondary">#{post.sermonNumber}</span>
                    {matchingParagraphNumber && <span className="index-detail__tag--para">Para: {matchingParagraphNumber}</span>}
                </>}
                title={displayTitle}
                titleIsArabic={/[؀-ۿ]/.test(displayTitle)}
                body={<HighlightText text={displayContent} term={term} language={language} />}
                linkLabel={`View in ${post.type.toLowerCase()}`}
            />
        );
    }

    if (type === 'Radis') {
        const radis = data as RadisIntroduction;
        const displayContent = matchingContent || (language === 'arabic' ? radis.arabic : radis.translation) || '';
        if ((language === 'arabic' && !radis.arabic) || (language === 'english' && !radis.translation)) return null;
        return (
            <ResultCard
                onClick={handleCardClick}
                tags={<>
                    <span className="index-detail__tag--accent">Radis Introduction</span>
                    <span className="index-detail__tag--secondary">#{radis.number}</span>
                </>}
                body={<HighlightText text={displayContent} term={term} language={language} />}
                linkLabel="View full introduction"
            />
        );
    }

    if (type === 'Conclusion') {
        const conclusion = data as Conclusion;
        const displayContent = matchingContent || (language === 'arabic' ? conclusion.arabic : conclusion.translation) || '';
        if ((language === 'arabic' && !conclusion.arabic) || (language === 'english' && !conclusion.translation)) return null;
        return (
            <ResultCard
                onClick={handleCardClick}
                tags={<>
                    <span className="index-detail__tag--accent">Conclusion</span>
                    <span className="index-detail__tag--secondary">#{conclusion.number}</span>
                </>}
                body={<HighlightText text={displayContent} term={term} language={language} />}
                linkLabel="View full conclusion"
            />
        );
    }
    return null;
}

function HighlightText({ text, term, language }: { text: string; term: string; language?: 'english' | 'arabic' }) {
    const isArabic = language === 'arabic';
    const className = `index-detail__text ${isArabic ? 'index-detail__text--arabic font-taha' : ''}`;
    if (!text) return null;
    if (!term) return <p className={className} dir={isArabic ? 'rtl' : 'ltr'}>{text}</p>;
    const t = term.toLowerCase().trim();
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regexStr = escape(t);
    if (t.endsWith('ies')) regexStr = `${escape(t.slice(0, -3))}(?:y|ies)`;
    else if (t.endsWith('es')) regexStr = `${escape(t.slice(0, -2))}(?:es)?`;
    else if (t.endsWith('s')) regexStr = `${escape(t.slice(0, -1))}s?`;
    else regexStr = `${escape(t)}(?:s|es)?`;

    const parts = text.split(new RegExp(`(${regexStr})`, 'gi'));
    return (
        <p className={className} dir={isArabic ? 'rtl' : 'ltr'}>
            {parts.map((part, i) =>
                new RegExp(`^${regexStr}$`, 'i').test(part)
                    ? <span key={i} className="index-detail__highlight">{part}</span>
                    : part
            )}
        </p>
    );
}

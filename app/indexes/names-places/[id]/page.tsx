'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    postsApi,
    radisApi,
    namePlacesApi,
    Post,
    RadisIntroduction,
    NamePlace
} from '@/api';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import Button from '@/app/components/button';
import { parseTextReference } from '@/app/utils/text-reference';

interface CombinedResult {
    type: 'Post' | 'Paragraph' | 'Radis';
    data: any;
    reference: string;
    sourceType?: 'Oration' | 'Letter' | 'Saying';
    matchingParagraphNumber?: string;
    matchingContent?: string;
}

// Robust text matcher (handles singular/plural)
const checkTextMatch = (text: string, term: string) => {
    if (!text) return false;
    const t = term.toLowerCase().trim();
    const txt = text.toLowerCase();

    if (txt.includes(t)) return true;

    // Simple stemming/pluralization
    if (t.endsWith('s') && txt.includes(t.slice(0, -1))) return true;
    if (t.endsWith('ies') && txt.includes(t.slice(0, -3) + 'y')) return true;
    if (t.endsWith('es') && txt.includes(t.slice(0, -2))) return true;

    return false;
};

// Extract only the sentence or portion containing the term
const extractMatchingSentence = (text: string, term: string): string | null => {
    if (!text || !term) return null;
    
    const t = term.toLowerCase().trim();
    const txtLower = text.toLowerCase();
    
    let termIndex = txtLower.indexOf(t);
    
    if (termIndex === -1) {
        if (t.endsWith('s')) {
            termIndex = txtLower.indexOf(t.slice(0, -1));
        } else if (t.endsWith('ies')) {
            termIndex = txtLower.indexOf(t.slice(0, -3) + 'y');
        } else if (t.endsWith('es')) {
            termIndex = txtLower.indexOf(t.slice(0, -2));
        }
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

const isValidPost = (post: Post) => {
    if (post.title === 'Topic 1') return false;
    if (!post.sermonNumber) return false;
    return true;
};

export default function NamesPlacesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [results, setResults] = useState<CombinedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<'english' | 'arabic' | undefined>(undefined);

    const term = decodeURIComponent(params.id as string).trim();
    const refsParam = searchParams.get('refs');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            let detectedLanguage: 'english' | 'arabic' | undefined = undefined;

            try {
                let textNumbers: string[] = [];
                let indexItem: NamePlace | null = null;

                if (refsParam) {
                    textNumbers = refsParam.split(',').filter(Boolean);
                    const isArabicChar = /[\u0600-\u06FF]/.test(term);
                    detectedLanguage = isArabicChar ? 'arabic' : 'english';
                } else {
                    const indexResponse = await namePlacesApi.getNamePlaces(1, 1, { word_english: term });
                    if (indexResponse.data && indexResponse.data.length > 0) {
                        indexItem = indexResponse.data.find(t => t.word_english?.toLowerCase() === term.toLowerCase()) || indexResponse.data[0];
                        detectedLanguage = 'english';
                    } else {
                        const arabicResponse = await namePlacesApi.getNamePlaces(1, 1, { word_arabic: term });
                        if (arabicResponse.data && arabicResponse.data.length > 0) {
                            indexItem = arabicResponse.data[0];
                            detectedLanguage = 'arabic';
                        }
                    }
                    if (indexItem && indexItem.text_numbers) {
                        textNumbers = indexItem.text_numbers.map(t => t.value);
                    }
                }

                setLanguage(detectedLanguage);

                const combined: CombinedResult[] = [];
                const fetchedIds = new Set<string>();

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
                                    const textToSearch = detectedLanguage === 'arabic' ? (item.arabic || '') : (item.translation || '');
                                    const matchingSentence = extractMatchingSentence(textToSearch, term);
                                    return { 
                                        type: 'Radis', 
                                        data: item, 
                                        reference: refValue,
                                        matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                    };
                                }
                            } else {
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
                                            const targetPara = matchedPost.paragraphs?.find(p => {
                                                if (!p.number) return false;
                                                const numStr = p.number.toString();
                                                return numStr === subId || numStr.endsWith(`.${subId}`) || numStr === `${querySermonNumber}.${subId}`;
                                            });

                                            if (targetPara) {
                                                const eng = targetPara.translations?.[0]?.text || '';
                                                const ara = targetPara.arabic || '';
                                                const textToSearch = detectedLanguage === 'arabic' ? ara : eng;
                                                const matchingSentence = extractMatchingSentence(textToSearch, term);
                                                return { 
                                                    type: 'Post', 
                                                    data: matchedPost, 
                                                    reference: refValue, 
                                                    sourceType: matchedPost.type as any,
                                                    matchingParagraphNumber: targetPara.number,
                                                    matchingContent: matchingSentence || textToSearch.slice(0, 300) + (textToSearch.length > 300 ? '...' : '')
                                                };
                                            }
                                        }
                                        // Fallback: return post even if no specific paragraph found
                                        const firstContent = matchedPost.paragraphs?.[0]?.translations?.[0]?.text || 
                                                           matchedPost.translations?.[0]?.text || 
                                                           matchedPost.heading || '';
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
                    resultsFromRefs.forEach(r => {
                        if (r && !fetchedIds.has(r.reference)) {
                            combined.push(r as CombinedResult);
                            fetchedIds.add(r.reference);
                        }
                    });
                }

                combined.sort((a, b) => {
                    return a.reference.localeCompare(b.reference, undefined, { numeric: true });
                });

                setResults(combined);

            } catch (err) {
                console.error('Error fetching details:', err);
                setError('Failed to load details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (term) {
            fetchData();
        }
    }, [term, refsParam]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--color-parchment)] flex flex-col items-center justify-center p-4">
                <div className="bg-[var(--color-cream)] border border-[var(--color-stone)] p-8 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[var(--color-accent)]"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[var(--color-accent)]"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]"></div>
                    <div className="text-red-600 mb-4 font-body">{error}</div>
                    <Button onClick={() => router.back()} variant="outlined">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-parchment)] pb-12">
            {/* Header */}
            <div className="bg-[var(--color-cream)] border-b border-[var(--color-stone)] sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[var(--color-warm-gray)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-body text-sm hidden sm:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-3 flex-1 justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary)] flex items-center justify-center">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-lg sm:text-xl font-display text-[var(--color-primary)] line-clamp-1">
                                &ldquo;{term}&rdquo;
                            </h1>
                            {language && (
                                <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body">{language}</span>
                            )}
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                {results.length === 0 ? (
                    <div className="bg-[var(--color-cream)] border border-[var(--color-stone)] p-8 sm:p-12 relative text-center">
                        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[var(--color-accent)]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[var(--color-accent)]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]"></div>
                        <p className="text-lg sm:text-xl text-[var(--color-warm-gray)] font-body">No content found for &ldquo;{term}&rdquo;.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-[var(--color-warm-gray)] font-body">
                            Found {results.length} reference{results.length !== 1 ? 's' : ''}
                        </p>
                        {results.map((item, index) => (
                            <ContentCard key={`${item.type}-${item.reference}-${index}`} item={item} term={term} language={language} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

function ContentCard({ item, term, language }: { item: CombinedResult; term: string; language?: 'english' | 'arabic' }) {
    const router = useRouter();
    const { type, data, matchingContent, matchingParagraphNumber } = item;

    const getNavigationUrl = (): string | null => {
        if (type === 'Post') {
            const post = data as Post;
            const contentTypeMap: Record<string, string> = {
                'Oration': 'orations',
                'Letter': 'letters',
                'Saying': 'sayings'
            };
            const contentType = contentTypeMap[post.type] || 'orations';
            
            const params = new URLSearchParams();
            
            const highlightRef = matchingParagraphNumber || post.sermonNumber;
            if (highlightRef) {
                params.set('highlightRef', highlightRef);
            }
            
            const isArabicTerm = /[\u0600-\u06FF]/.test(term);
            if (isArabicTerm) {
                params.set('arabicWord', term);
            } else {
                params.set('word', term);
            }
            
            const queryString = params.toString();
            return `/${contentType}/details/${post.id}${queryString ? `?${queryString}` : ''}`;
        }
        
        if (type === 'Radis') {
            const radis = data as RadisIntroduction;
            return `/radis?highlightRef=${radis.number.startsWith('0.') ? radis.number : `0.${radis.number}`}`;
        }
        
        return null;
    };

    const handleCardClick = () => {
        const url = getNavigationUrl();
        if (url) {
            router.push(url);
        }
    };

    if (type === 'Post') {
        const post = data as Post;
        
        const displayContent = matchingContent || 'No content available';

        let displayTitle = post.title || post.heading || `Oration ${post.sermonNumber}`;
        const isArabicTitle = /[\u0600-\u06FF]/.test(displayTitle);

        if (language === 'english' && isArabicTitle) {
            if (post.title && !/[\u0600-\u06FF]/.test(post.title)) {
                displayTitle = post.title;
            } else {
                const typeLabel = post.type === 'Oration' ? 'Sermon' : post.type;
                displayTitle = `${typeLabel} ${post.sermonNumber}`;
            }
        } else if (language === 'arabic' && !isArabicTitle) {
            if (post.heading && /[\u0600-\u06FF]/.test(post.heading)) {
                displayTitle = post.heading;
            }
        }

        return (
            <div 
                className="bg-[var(--color-cream)] border border-[var(--color-stone)] p-4 sm:p-6 hover:border-[var(--color-primary)] transition-all cursor-pointer relative group"
                onClick={handleCardClick}
            >
                {/* Accent corners on hover */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[var(--color-primary)] text-white text-[10px] sm:text-xs font-body px-2 py-1 uppercase tracking-[0.1em]">
                            {post.type}
                        </span>
                        <span className="text-[var(--color-warm-gray)] text-xs sm:text-sm font-body">#{post.sermonNumber}</span>
                        {matchingParagraphNumber && (
                            <span className="bg-[var(--color-stone)] text-[var(--color-charcoal)] text-[10px] sm:text-xs px-2 py-1 font-body">
                                Para: {matchingParagraphNumber}
                            </span>
                        )}
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[var(--color-stone)] flex items-center justify-center group-hover:bg-[var(--color-primary)] transition-colors">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-charcoal)] group-hover:text-white transition-colors" />
                    </div>
                </div>

                <h3 className="text-base sm:text-lg font-display text-[var(--color-ink)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">{displayTitle}</h3>

                <div className="text-[var(--color-charcoal)] leading-relaxed font-body text-sm sm:text-base">
                    <HighlightText text={displayContent} term={term} />
                </div>
                
                <div className="mt-3 sm:mt-4 pt-3 border-t border-[var(--color-stone)]">
                    <span className="text-xs sm:text-sm text-[var(--color-primary)] font-body group-hover:underline">
                        View full {post.type.toLowerCase()} →
                    </span>
                </div>
            </div>
        );
    }

    if (type === 'Radis') {
        const radis = data as RadisIntroduction;
        
        const displayContent = matchingContent || (language === 'arabic' ? radis.arabic : radis.translation) || '';

        const showEng = language !== 'arabic' && radis.translation;
        const showAra = language !== 'english' && radis.arabic;

        if (!showEng && !showAra) return null;

        return (
            <div 
                className="bg-[var(--color-cream)] border border-[var(--color-stone)] p-4 sm:p-6 hover:border-[var(--color-primary)] transition-all cursor-pointer relative group"
                onClick={handleCardClick}
            >
                {/* Accent corners on hover */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-transparent group-hover:border-[var(--color-accent)] transition-colors"></div>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-[var(--color-accent)] text-[var(--color-ink)] text-[10px] sm:text-xs font-body px-2 py-1 uppercase tracking-[0.1em]">
                            Radis Introduction
                        </span>
                        <span className="text-[var(--color-warm-gray)] text-xs sm:text-sm font-body">#{radis.number}</span>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[var(--color-stone)] flex items-center justify-center group-hover:bg-[var(--color-primary)] transition-colors">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-charcoal)] group-hover:text-white transition-colors" />
                    </div>
                </div>

                <div className="text-[var(--color-charcoal)] leading-relaxed font-body text-sm sm:text-base">
                    <HighlightText text={displayContent} term={term} />
                </div>
                
                <div className="mt-3 sm:mt-4 pt-3 border-t border-[var(--color-stone)]">
                    <span className="text-xs sm:text-sm text-[var(--color-primary)] font-body group-hover:underline">
                        View full introduction →
                    </span>
                </div>
            </div>
        );
    }

    return null;
}

function HighlightText({ text, term }: { text: string; term: string }) {
    if (!text) return null;
    if (!term) return <p className="text-[var(--color-charcoal)] leading-loose">{text}</p>;

    const t = term.toLowerCase().trim();

    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let regexStr = escape(t);
    if (t.endsWith('ies')) regexStr = `${escape(t.slice(0, -3))}(?:y|ies)`;
    else if (t.endsWith('es')) regexStr = `${escape(t.slice(0, -2))}(?:es)?`;
    else if (t.endsWith('s')) regexStr = `${escape(t.slice(0, -1))}s?`;
    else regexStr = `${escape(t)}(?:s|es)?`;

    const parts = text.split(new RegExp(`(${regexStr})`, 'gi'));

    return (
        <p className="text-[var(--color-charcoal)] leading-loose">
            {parts.map((part, i) =>
                new RegExp(`^${regexStr}$`, 'i').test(part) ? (
                    <span key={i} className="bg-[var(--color-accent)] text-[var(--color-ink)] font-medium px-1">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </p>
    );
}

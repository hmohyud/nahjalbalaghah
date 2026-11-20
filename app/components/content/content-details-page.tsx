'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { type Post, postsApi } from '@/api/posts';
import { audioApi } from '@/api/audio';
import ContentDescription from './content-description';
import ParallelView from './parallel-view';
import { ArrowLeft, Book, GitCompare, ChevronLeft, ChevronRight, ScrollText, Split } from 'lucide-react';
import Link from 'next/link';
import { Button, Select } from '../ui';
import { ManuscriptComparisonModal, comparisonSection } from '../manuscripts';
import { isSeparatelyNumbered } from '@/api/manuscripts';
import AudioPlayer from './audio-player';
import { getPostEditionTitles, postHasEdition } from '@/app/utils/preferences';

interface ContentDetailsPageProps {
  contentType: 'orations' | 'letters' | 'sayings';
  title: string;
  api: {
    getContentById: (id: number) => Promise<Post | null>;
  };
  id?: number;
}

export default function ContentDetailsPage({ contentType, title, api, id: propId }: ContentDetailsPageProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Try to get id from prop first, then from params.id, then from catch-all params
  const id = propId || (() => {
    if (params.id) return parseInt(params.id as string);
    if (params.params && Array.isArray(params.params) && params.params.length >= 2) {
      return parseInt(params.params[1]);
    }
    return NaN;
  })();
  const returnPage = searchParams.get('returnPage');
  const returnSort = searchParams.get('returnSort');
  const returnSearch = searchParams.get('returnSearch');
  const editionParam = searchParams.get('edition');
  const display = searchParams.get('display');
  const highlightRef = searchParams.get('highlightRef');
  const englishWord = searchParams.get('word');
  const arabicWord = searchParams.get('arabicWord');

  const [content, setContent] = useState<Post | null>(null);

  // The edition of the post being viewed; navigation stays within it
  const contentEditionTitle = getPostEditionTitles(content)[0] || '';
  const currentEditionTitle = contentEditionTitle || editionParam || '';

  const buildDetailsUrl = (postId: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentEditionTitle) params.set('edition', currentEditionTitle);
    // Paragraph/word highlights belong to the current post only
    params.delete('highlightRef');
    params.delete('word');
    params.delete('arabicWord');
    const qs = params.toString();
    return qs ? `/content/details/${contentType}/${postId}?${qs}` : `/content/details/${contentType}/${postId}`;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  // Manuscript pages are filed under Qutbuddin's numbering; editions numbered on their own
  // (ʿAṭṭār) can't be matched to them by number
  const manuscriptSection = comparisonSection(content, contentType);
  const contentEditions = getPostEditionTitles(content);
  const hasManuscriptSection = !!manuscriptSection
    && !(contentEditions.length > 0 && contentEditions.every(isSeparatelyNumbered));
  const [adjacentPosts, setAdjacentPosts] = useState<{ previous: Post | null; next: Post | null }>({
    previous: null,
    next: null
  });
  const [adjacentLoading, setAdjacentLoading] = useState(false);
  const [allItemNumbers, setAllItemNumbers] = useState<{ id: number; number: string }[]>([]);
  const [navigationPosts, setNavigationPosts] = useState<Post[]>([]);
  const [audioTracks, setAudioTracks] = useState<{ arabic?: string; english?: string }>({});
  const [isParallelViewActive, setIsParallelViewActive] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);

  const getDisplayNumber = (sermonNumber?: string | null) => {
    if (!sermonNumber) return '';
    if (sermonNumber.includes('.')) {
      return sermonNumber.split('.').pop() || sermonNumber;
    }
    return sermonNumber;
  };

  const getEditionPrefix = (sermonNumber?: string | null) => {
    if (!sermonNumber || !sermonNumber.includes('.')) return '';
    return sermonNumber.split('.')[0] || '';
  };

  const sortPostsByDisplayNumber = (posts: Post[]) => {
    return [...posts].sort((a, b) => {
      const aNum = parseInt(getDisplayNumber(a.sermonNumber), 10);
      const bNum = parseInt(getDisplayNumber(b.sermonNumber), 10);
      if (isNaN(aNum) || isNaN(bNum)) {
        return getDisplayNumber(a.sermonNumber).localeCompare(getDisplayNumber(b.sermonNumber));
      }
      return aNum - bNum;
    });
  };

  useEffect(() => {
    const fetchAllNumbers = async () => {
      try {
        let allPosts: any[] = [];
        let currentPage = 1;
        let hasMore = true;
        const pageSize = 100;

        const typeMapping = {
          'orations': 'Oration',
          'letters': 'Letter',
          'sayings': 'Saying'
        };

        const editionTitle = contentEditionTitle || undefined;
        const editionPrefix = !editionTitle ? getEditionPrefix(content?.sermonNumber) : '';

        while (hasMore) {
          const response = await postsApi.getPosts({
            page: currentPage,
            pageSize: pageSize,
            filters: { type: typeMapping[contentType], ...(editionTitle ? { editionTitle } : {}) },
            fields: ['id', 'sermonNumber'],
            populate: [], // Optimize: we only need ID and number for the dropdown
            sort: 'id:asc'
          });

          if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
            allPosts.push(...response.data);
            const totalPages = response.meta?.pagination?.pageCount || 1;
            hasMore = currentPage < totalPages;
            currentPage++;
          } else {
            hasMore = false;
          }
        }

        if (allPosts.length > 0) {
          // A post-base holds every edition of an item, so the API filter alone
          // returns posts from other editions too; keep only the current one.
          const scopedPosts = editionTitle
            ? allPosts.filter((post) => postHasEdition(post, editionTitle))
            : editionPrefix
              ? allPosts.filter((post) => getEditionPrefix(post?.sermonNumber) === editionPrefix)
              : allPosts;
          const sortedPosts = sortPostsByDisplayNumber(
            scopedPosts.filter((post): post is Post => !!post?.id)
          );
          setNavigationPosts(sortedPosts);

          const numbers = sortedPosts
            .map(p => {
              const numStr = getDisplayNumber(p.sermonNumber);
              return {
                id: p.id,
                number: numStr || p.id.toString()
              };
            })
            .filter(item => item.number)
            .filter((item, index, arr) => arr.findIndex(x => x.number === item.number) === index)
            .sort((a, b) => {
              const numA = parseInt(a.number);
              const numB = parseInt(b.number);
              if (isNaN(numA) || isNaN(numB)) return a.number.localeCompare(b.number);
              return numA - numB;
            });
          setAllItemNumbers(numbers);
        } else {
          setNavigationPosts([]);
          setAllItemNumbers([]);
        }
      } catch (error) {
        console.error('Failed to fetch item numbers:', error);
        setNavigationPosts([]);
        setAllItemNumbers([]);
      }
    };
    if (!content) return;
    fetchAllNumbers();
    // Only refetch when the edition scope changes, not on every item change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentEditionTitle, contentEditionTitle ? '' : getEditionPrefix(content?.sermonNumber), contentType, !!content]);

  const getBackUrl = () => {
    const urlParams = new URLSearchParams();
    if (returnPage) urlParams.set('page', returnPage);
    if (returnSort) urlParams.set('sort', returnSort);
    if (returnSearch) urlParams.set('search', returnSearch);
    if (currentEditionTitle) urlParams.set('edition', currentEditionTitle);
    if (display) urlParams.set('display', display);

    const queryString = urlParams.toString();
    return queryString ? `/${contentType}?${queryString}` : `/${contentType}`;
  };

  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(getBackUrl());
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setAdjacentLoading(true);
        setError(null);

        const contentData = await api.getContentById(id);

        setContent(contentData);
      } catch (err) {
        setError(`Failed to load ${contentType.slice(0, -1)} details. Please try again.`);
        console.error(`Error loading ${contentType.slice(0, -1)}:`, err);
      } finally {
        setLoading(false);
        setAdjacentLoading(false);
      }
    };

    if (!isNaN(id)) {
      loadData();
    }
  }, [id, api, contentType]);

  useEffect(() => {
    if (!content || navigationPosts.length === 0) {
      setAdjacentPosts({ previous: null, next: null });
      setAdjacentLoading(false);
      return;
    }

    const currentNumber = getDisplayNumber(content.sermonNumber);
    let currentIndex = navigationPosts.findIndex((post) => post.id === content.id);
    if (currentIndex === -1 && currentNumber !== '') {
      currentIndex = navigationPosts.findIndex((post) => getDisplayNumber(post.sermonNumber) === currentNumber);
    }

    if (currentIndex === -1) {
      setAdjacentPosts({ previous: null, next: null });
      setAdjacentLoading(false);
      return;
    }

    setAdjacentPosts({
      previous: currentIndex > 0 ? navigationPosts[currentIndex - 1] : null,
      next: currentIndex < navigationPosts.length - 1 ? navigationPosts[currentIndex + 1] : null,
    });
    setAdjacentLoading(false);
  }, [content, navigationPosts]);

  useEffect(() => {
    const fetchAudio = async () => {
      if (content?.sermonNumber) {
        const audio = await audioApi.getAudioBySermonNumber(content.sermonNumber);
        setAudioTracks({
          arabic: audio?.audioTracks?.arabic?.url,
          english: audio?.audioTracks?.english?.url,
        });
      } else {
        setAudioTracks({});
      }
    };
    fetchAudio();
  }, [content]);

  useEffect(() => {
    const fetchAvailablePosts = async () => {
      if (!content) return;

      try {
        const typeMapping: Record<string, string> = {
          'orations': 'Oration',
          'letters': 'Letter',
          'sayings': 'Saying'
        };

        const uniqueById = (posts: Post[]) => {
          const seen = new Set<number>();
          return posts.filter(post => {
            if (seen.has(post.id)) return false;
            seen.add(post.id);
            return true;
          });
        };

        // Prefer sermonNumber for grouping editions as they can be split across post-bases
        // and use different prefixes (e.g., 1.1 vs 4.1 for Oration 1)
        if (content.sermonNumber) {
          const itemNumber = content.sermonNumber.includes('.')
            ? content.sermonNumber.split('.').pop()
            : content.sermonNumber;

          const responseByNumber = await postsApi.getPosts({
            filters: {
              $or: [
                { sermonNumber: itemNumber },
                { sermonNumber: content.sermonNumber },
                { sermonNumberEndsWith: `.${itemNumber}` }
              ],
              type: typeMapping[contentType]
            },
            pageSize: 50 // Ensure we get all editions
          });

          let responseByBase: Post[] = [];
          if (content.post_base_documentId) {
            const byBase = await postsApi.getPostsByPostBaseDocumentId(content.post_base_documentId);
            responseByBase = byBase.data || [];
          }

          const combinedResults = uniqueById([
            ...(responseByNumber.data || []),
            ...responseByBase,
            content
          ]).filter(post => post.type === typeMapping[contentType]);

          // Filter for exact item number match to avoid matching e.g. ".11" when searching for ".1"
          // and also include the current post and any results with no sermonNumber
          const matchedPosts = combinedResults.filter(p => {
            if (!p.sermonNumber) return true;
            const pNum = p.sermonNumber?.split('.').pop();
            return pNum === itemNumber;
          });

          setAvailablePosts(matchedPosts.length > 0 ? matchedPosts : combinedResults);
        } else if (content.post_base_documentId) {
          // Fallback to post_base_documentId if sermonNumber is not available
          const response = await postsApi.getPostsByPostBaseDocumentId(content.post_base_documentId);
          setAvailablePosts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch available editions:', error);
      }
    };

    fetchAvailablePosts();
  }, [content?.sermonNumber, content?.post_base_documentId, contentType]);

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'orations':
        return 'Oration';
      case 'letters':
        return 'Letter';
      case 'sayings':
        return 'Saying';
      default:
        return 'Post';
    }
  };

  const truncateText = (text: string | undefined, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const navigateToPost = (post: Post) => {
    router.push(buildDetailsUrl(post.id));
  };

  if (loading) {
    return (
      <div className="content-details-page">
        <div className="content-details-container">
          <div className="content-details__skeleton">
            <div className="content-details__skeleton-back"></div>
            <div className="content-details__skeleton-card">
              <div className="content-details__skeleton-title"></div>
              <div className="content-details__skeleton-subtitle"></div>
              <div className="content-details__skeleton-lines">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="content-details__skeleton-line"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-details-page content-details__error-wrapper">
        <div className="content-details__error-inner">
          <h2 className="content-details__error-heading">
            {error}
          </h2>
          <button
            onClick={handleBackNavigation}
            className="content-error-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title}
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="content-details-page content-details__error-wrapper">
        <div className="content-details__error-inner">
          <h2 className="content-details__error-heading">
            {title.slice(0, -1)} not found
          </h2>
          <p className="content-details__not-found-text">The requested {contentType.slice(0, -1)} could not be found.</p>
          <button
            onClick={handleBackNavigation}
            className="content-error-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-details-page">
      <div className="content-details-container">
        {/* Header with back button and action buttons */}
        <div className="content-details__header">
          <button
            onClick={handleBackNavigation}
            className="content-back-button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title}
          </button>

          {/* Prev / jump-to / Next */}
          <div className="content-details__actions">
            <Button
              variant='outlined'
              disabled={!adjacentPosts.previous}
              onClick={() => adjacentPosts.previous && navigateToPost(adjacentPosts.previous)}
              icon={<ChevronLeft className='w-4 h-4' />}
              className="content-details__action-btn"
            >
              Prev
            </Button>
            <div className="content-details__jump-select">
              <Select
                value={id.toString()}
                onChange={(value: string) => router.push(buildDetailsUrl(value))}
                options={allItemNumbers.map(item => ({ value: item.id.toString(), label: `${getContentTypeLabel()} ${item.number}` }))}
                placeholder="Go to #"
              />
            </div>
            <Button
              variant='outlined'
              disabled={!adjacentPosts.next}
              onClick={() => adjacentPosts.next && navigateToPost(adjacentPosts.next)}
              className="content-details__action-btn"
            >
              <div className='content-details__next-inner'>
                Next
                <ChevronRight className='w-4 h-4' />
              </div>
            </Button>
          </div>
        </div>

        {/* Audio + view / manuscript actions */}
        <div className="content-details__toolbar">
          <AudioPlayer tracks={audioTracks} />

          <div className="content-details__actions">
            <Button
              variant={isParallelViewActive ? 'solid' : 'outlined'}
              icon={<Split className='w-4 h-4' />}
              onClick={() => setIsParallelViewActive(!isParallelViewActive)}
              className="content-details__action-btn"
            >
              Parallel View
            </Button>
            {/* Manuscripts follow Qutbuddin's numbering, so they're only linked from posts that share it */}
            {hasManuscriptSection && (
              <Button
                variant='outlined'
                icon={<GitCompare className='w-4 h-4' />}
                onClick={() => setIsComparisonModalOpen(true)}
                className="content-details__action-btn"
              >
                Compare
              </Button>
            )}
            <Link href={hasManuscriptSection ? `/manuscripts/view?section=${manuscriptSection}` : '/manuscripts'}>
              <Button variant='outlined' icon={<Book className='w-4 h-4' />} className="content-details__action-btn">
                Manuscripts
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        {isParallelViewActive ? (
          <ParallelView
            key={content.id}
            initialPost={content}
            availablePosts={availablePosts}
            contentType={contentType}
            highlightRef={highlightRef}
            englishWord={englishWord}
            arabicWord={arabicWord}
          />
        ) : (
          <ContentDescription
            content={content}
            contentType={contentType}
            highlightRef={highlightRef}
            englishWord={englishWord}
            arabicWord={arabicWord}
          />
        )}

        {/* Next/Previous Navigation */}
        <div className="adjacent-post-nav">
          <div className="content-details__nav-grid">
            {/* Previous Post */}
            <div className="content-details__nav-col">
              {adjacentPosts.previous ? (
                <button
                  onClick={() => navigateToPost(adjacentPosts.previous!)}
                  className="adjacent-post-card group"
                >
                  {/* Hover corners */}
                  <div className="corner-accent-hover corner-accent-hover--top-left" />

                  <div className="adjacent-post-label">
                    <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="adjacent-post-label__text">Previous</span>
                  </div>

                  {/* Heading/Title */}
                  <div className="adjacent-post-heading">
                    {truncateText(adjacentPosts.previous.heading, 60) || `${getContentTypeLabel()} ${getDisplayNumber(adjacentPosts.previous.sermonNumber)}`}
                  </div>

                  {/* English Summary (TocEnglish) */}
                  {adjacentPosts.previous.TocEnglish && (
                    <div className="content-details__adj-english">
                      {truncateText(adjacentPosts.previous.TocEnglish, 80)}
                    </div>
                  )}

                  {/* Arabic Summary (TocArabic) */}
                  {adjacentPosts.previous.TocArabic && (
                    <div className="content-details__adj-arabic" dir="rtl">
                      {truncateText(adjacentPosts.previous.TocArabic, 60)}
                    </div>
                  )}

                  {/* Section Number */}
                  {adjacentPosts.previous.sermonNumber && (
                    <div className="content-details__adj-section">
                      {adjacentPosts.previous.sermonNumber}
                    </div>
                  )}
                </button>
              ) : (
                <div className="adjacent-post-card adjacent-post-card--disabled">
                  <div className="content-details__adj-disabled-label">
                    <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="adjacent-post-label__text">Previous</span>
                  </div>
                  <div className="content-details__adj-disabled-text">No previous {getContentTypeLabel().toLowerCase()}</div>
                </div>
              )}
            </div>

            {/* Next Post */}
            <div className="content-details__nav-col">
              {adjacentPosts.next ? (
                <button
                  onClick={() => navigateToPost(adjacentPosts.next!)}
                  className="adjacent-post-card adjacent-post-card--next group"
                >
                  {/* Hover corners */}
                  <div className="corner-accent-hover corner-accent-hover--bottom-right" />

                  <div className="content-details__next-label">
                    <span className="content-details__next-label-text">Next</span>
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>

                  {/* Heading/Title */}
                  <div className="adjacent-post-heading">
                    {truncateText(adjacentPosts.next.heading, 60) || `${getContentTypeLabel()} ${getDisplayNumber(adjacentPosts.next.sermonNumber)}`}
                  </div>

                  {/* English Summary (TocEnglish) */}
                  {adjacentPosts.next.TocEnglish && (
                    <div className="content-details__adj-english">
                      {truncateText(adjacentPosts.next.TocEnglish, 80)}
                    </div>
                  )}

                  {/* Arabic Summary (TocArabic) */}
                  {adjacentPosts.next.TocArabic && (
                    <div className="content-details__adj-arabic" dir="rtl">
                      {truncateText(adjacentPosts.next.TocArabic, 60)}
                    </div>
                  )}

                  {/* Section Number */}
                  {adjacentPosts.next.sermonNumber && (
                    <div className="content-details__adj-section">
                      {adjacentPosts.next.sermonNumber}
                    </div>
                  )}
                </button>
              ) : (
                <div className="adjacent-post-card adjacent-post-card--disabled adjacent-post-card--next">
                  <div className="content-details__adj-disabled-label content-details__adj-disabled-label--next">
                    <span className="adjacent-post-label__text">Next</span>
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                  <div className="content-details__adj-disabled-text">No next {getContentTypeLabel().toLowerCase()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manuscript Comparison Modal */}
      <ManuscriptComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        content={content}
        contentType={contentType}
      />
    </div>
  );
}

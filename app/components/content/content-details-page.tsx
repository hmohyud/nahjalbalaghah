'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { type Post, orationsApi, lettersApi, sayingsApi } from '@/api/posts';
import ContentDescription from './content-description';
import { ArrowLeft, Book, GitCompare, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Button from '../button';
import ManuscriptComparisonModal from '../manuscript-comparison-modal';

interface ContentDetailsPageProps {
  contentType: 'orations' | 'letters' | 'sayings';
  title: string;
  api: {
    getContentById: (id: number) => Promise<Post | null>;
  };
}

export default function ContentDetailsPage({ contentType, title, api }: ContentDetailsPageProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const returnPage = searchParams.get('returnPage');
  const returnSort = searchParams.get('returnSort');
  const returnSearch = searchParams.get('returnSearch');
  const highlightRef = searchParams.get('highlightRef');
  const englishWord = searchParams.get('word');
  const arabicWord = searchParams.get('arabicWord');

  const [content, setContent] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [adjacentPosts, setAdjacentPosts] = useState<{ previous: Post | null; next: Post | null }>({
    previous: null,
    next: null
  });
  const [adjacentLoading, setAdjacentLoading] = useState(false);

  const getBackUrl = () => {
    const urlParams = new URLSearchParams();
    if (returnPage) urlParams.set('page', returnPage);
    if (returnSort) urlParams.set('sort', returnSort);
    if (returnSearch) urlParams.set('search', returnSearch);

    const queryString = urlParams.toString();
    return queryString ? `/${contentType}?${queryString}` : `/${contentType}`;
  };

  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault();

    if (window.history.length > 1 && (returnPage || returnSort || returnSearch)) {
      router.back();
    } else {
      router.push(getBackUrl());
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setAdjacentLoading(true);
        setError(null);

        const contentPromise = api.getContentById(id);

        let adjacentPromise: Promise<{ previous: Post | null; next: Post | null }>;
        switch (contentType) {
          case 'orations':
            adjacentPromise = orationsApi.getAdjacentOrations(id);
            break;
          case 'letters':
            adjacentPromise = lettersApi.getAdjacentLetters(id);
            break;
          case 'sayings':
            adjacentPromise = sayingsApi.getAdjacentSayings(id);
            break;
          default:
            adjacentPromise = Promise.resolve({ previous: null, next: null });
        }

        const [contentData, adjacentData] = await Promise.all([contentPromise, adjacentPromise]);

        setContent(contentData);
        setAdjacentPosts(adjacentData);
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
    router.push(`/${contentType}/details/${post.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-white border border-[var(--color-stone)] w-32 mb-6"></div>
            <div className="bg-white border border-[var(--color-stone)] p-6 lg:p-8">
              <div className="h-8 bg-[var(--color-parchment)] mb-6 w-3/4"></div>
              <div className="h-4 bg-[var(--color-parchment)] mb-4 w-1/2"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-[var(--color-parchment)]"></div>
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
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-xl lg:text-2xl text-[var(--color-ink)] mb-4">
            {error}
          </h2>
          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-[var(--color-primary)] text-white text-sm lg:text-base font-body hover:bg-[var(--color-primary-dark)] transition-colors"
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
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-xl lg:text-2xl text-[var(--color-ink)] mb-4">
            {title.slice(0, -1)} not found
          </h2>
          <p className="text-[var(--color-warm-gray)] font-body text-sm lg:text-base mb-6">The requested {contentType.slice(0, -1)} could not be found.</p>
          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-[var(--color-primary)] text-white text-sm lg:text-base font-body hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header with back button and action buttons */}
        <div className="flex flex-col gap-4 mb-6 lg:mb-8">
          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-body text-sm lg:text-base transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title}
          </button>

          {/* Action buttons - scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <Button
              variant='outlined'
              disabled={!adjacentPosts.previous}
              onClick={() => adjacentPosts.previous && navigateToPost(adjacentPosts.previous)}
              icon={<ChevronLeft className='w-4 h-4' />}
              className="flex-shrink-0 text-xs sm:text-sm"
            >
              Prev
            </Button>
            <Button
              variant='outlined'
              disabled={!adjacentPosts.next}
              onClick={() => adjacentPosts.next && navigateToPost(adjacentPosts.next)}
              className="flex-shrink-0 text-xs sm:text-sm"
            >
              <div className='flex items-center gap-1 sm:gap-2'>
                Next
                <ChevronRight className='w-4 h-4' />
              </div>
            </Button>
            <Button
              variant='outlined'
              icon={<GitCompare className='w-4 h-4' />}
              onClick={() => setIsComparisonModalOpen(true)}
              className="flex-shrink-0 text-xs sm:text-sm"
            >
              Compare
            </Button>
            <Link href={content?.sermonNumber ? `/manuscripts?section=${content.sermonNumber}` : '/manuscripts'}>
              <Button variant='outlined' icon={<Book className='w-4 h-4' />} className="flex-shrink-0 text-xs sm:text-sm">
                Manuscripts
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <ContentDescription
          content={content}
          contentType={contentType}
          highlightRef={highlightRef}
          englishWord={englishWord}
          arabicWord={arabicWord}
        />

        {/* Next/Previous Navigation */}
        <div className="mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-[var(--color-stone)]">
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            {/* Previous Post */}
            <div className="flex-1">
              {adjacentPosts.previous ? (
                <button
                  onClick={() => navigateToPost(adjacentPosts.previous!)}
                  className="group w-full p-4 lg:p-5 border border-[var(--color-stone)] bg-white hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all text-left relative"
                >
                  {/* Hover corners */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 lg:group-hover:w-4 lg:group-hover:h-4 transition-all duration-200" />
                  
                  <div className="flex items-center gap-1 lg:gap-2 text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] mb-2 transition-colors">
                    <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-[10px] lg:text-xs tracking-[0.1em] uppercase">Previous</span>
                  </div>
                  
                  {/* Heading/Title */}
                  <div className="font-display text-sm lg:text-base text-[var(--color-ink)] group-hover:text-[var(--color-primary)] line-clamp-2 transition-colors mb-1">
                    {truncateText(adjacentPosts.previous.heading, 60)}
                  </div>
                  
                  {/* English Summary (TocEnglish) */}
                  {adjacentPosts.previous.TocEnglish && (
                    <div className="font-body text-xs text-[var(--color-charcoal)] line-clamp-2 mb-1">
                      {truncateText(adjacentPosts.previous.TocEnglish, 80)}
                    </div>
                  )}
                  
                  {/* Arabic Summary (TocArabic) */}
                  {adjacentPosts.previous.TocArabic && (
                    <div className="font-taha text-xs text-[var(--color-warm-gray)] line-clamp-1 text-right" dir="rtl">
                      {truncateText(adjacentPosts.previous.TocArabic, 60)}
                    </div>
                  )}
                  
                  {/* Section Number */}
                  {adjacentPosts.previous.sermonNumber && (
                    <div className="text-[10px] lg:text-xs text-[var(--color-warm-gray)] mt-1 font-body">
                      {adjacentPosts.previous.sermonNumber}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full p-4 lg:p-5 border border-[var(--color-stone)] bg-[var(--color-parchment)] opacity-50">
                  <div className="flex items-center gap-1 lg:gap-2 text-[var(--color-warm-gray)] mb-2">
                    <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-[10px] lg:text-xs tracking-[0.1em] uppercase">Previous</span>
                  </div>
                  <div className="text-[var(--color-warm-gray)] font-body text-sm lg:text-base">No previous {getContentTypeLabel().toLowerCase()}</div>
                </div>
              )}
            </div>

            {/* Next Post */}
            <div className="flex-1">
              {adjacentPosts.next ? (
                <button
                  onClick={() => navigateToPost(adjacentPosts.next!)}
                  className="group w-full p-4 lg:p-5 border border-[var(--color-stone)] bg-white hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all text-right relative"
                >
                  {/* Hover corners */}
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-3 group-hover:h-3 lg:group-hover:w-4 lg:group-hover:h-4 transition-all duration-200" />
                  
                  <div className="flex items-center justify-end gap-1 lg:gap-2 text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] mb-2 transition-colors">
                    <span className="text-[10px] lg:text-xs tracking-[0.1em] uppercase">Next</span>
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                  
                  {/* Heading/Title */}
                  <div className="font-display text-sm lg:text-base text-[var(--color-ink)] group-hover:text-[var(--color-primary)] line-clamp-2 transition-colors mb-1">
                    {truncateText(adjacentPosts.next.heading, 60)}
                  </div>
                  
                  {/* English Summary (TocEnglish) */}
                  {adjacentPosts.next.TocEnglish && (
                    <div className="font-body text-xs text-[var(--color-charcoal)] line-clamp-2 mb-1">
                      {truncateText(adjacentPosts.next.TocEnglish, 80)}
                    </div>
                  )}
                  
                  {/* Arabic Summary (TocArabic) */}
                  {adjacentPosts.next.TocArabic && (
                    <div className="font-taha text-xs text-[var(--color-warm-gray)] line-clamp-1 text-right" dir="rtl">
                      {truncateText(adjacentPosts.next.TocArabic, 60)}
                    </div>
                  )}
                  
                  {/* Section Number */}
                  {adjacentPosts.next.sermonNumber && (
                    <div className="text-[10px] lg:text-xs text-[var(--color-warm-gray)] mt-1 font-body">
                      {adjacentPosts.next.sermonNumber}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full p-4 lg:p-5 border border-[var(--color-stone)] bg-[var(--color-parchment)] opacity-50">
                  <div className="flex items-center justify-end gap-1 lg:gap-2 text-[var(--color-warm-gray)] mb-2">
                    <span className="text-[10px] lg:text-xs tracking-[0.1em] uppercase">Next</span>
                    <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                  <div className="text-[var(--color-warm-gray)] font-body text-sm lg:text-base">No next {getContentTypeLabel().toLowerCase()}</div>
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

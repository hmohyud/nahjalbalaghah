'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopFilterBar from '../../orations/sections/top-filter-bar';
import ContentListing from './content-listing';
import { type Post, type ApiResponse } from '@/api/posts';

interface ContentPageConfig {
  contentType: 'orations' | 'letters' | 'sayings';
  title: string;
  subtitle: string;
  api: {
    getContent: (page?: number, pageSize?: number) => Promise<ApiResponse>;
    searchContent: (query: string, page?: number, pageSize?: number) => Promise<ApiResponse>;
  };
}

interface ContentPageProps {
  config: ContentPageConfig;
}

function ContentPageContent({ config }: ContentPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || '');
  const [displayMode, setDisplayMode] = useState<'both' | 'english-only' | 'arabic-only'>('both');
  const [content, setContent] = useState<Post[]>([]);
  const [allContent, setAllContent] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const updateUrlParams = (page?: number, search?: string, sort?: string) => {
    const params = new URLSearchParams();

    const currentSearch = search !== undefined ? search : searchTerm;
    const currentSort = sort !== undefined ? sort : sortBy;
    const currentPageNum = page !== undefined ? page : currentPage;

    if (currentPageNum && currentPageNum !== 1) {
      params.set('page', currentPageNum.toString());
    }

    if (currentSearch && currentSearch !== '') {
      params.set('search', currentSearch);
    }

    if (currentSort && currentSort !== '') {
      params.set('sort', currentSort);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/${config.contentType}?${queryString}` : `/${config.contentType}`;

    window.history.pushState(null, '', newUrl);
  };

  const clientSideSearchFilter = (posts: Post[], searchQuery: string): Post[] => {
    if (!searchQuery || searchQuery.trim() === '') {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();

    return posts.filter(post => {
      if (post.title?.toLowerCase().includes(query)) return true;
      if (post.heading?.toLowerCase().includes(query)) return true;

      if (post.translations && Array.isArray(post.translations)) {
        const matchesTranslation = post.translations.some(trans =>
          trans.text?.toLowerCase().includes(query)
        );
        if (matchesTranslation) return true;
      }

      if (post.paragraphs && Array.isArray(post.paragraphs)) {
        const matchesArabic = post.paragraphs.some(para =>
          para.arabic?.toLowerCase().includes(query)
        );
        if (matchesArabic) return true;

        const matchesParaTranslations = post.paragraphs.some(para =>
          para.translations?.some(trans =>
            trans.text?.toLowerCase().includes(query)
          )
        );
        if (matchesParaTranslations) return true;
      }

      return false;
    });
  };

  const fetchAllContent = async (): Promise<Post[]> => {
    const batchSize = 100;
    let currentPage = 1;
    let hasMore = true;
    const allData: Post[] = [];

    while (hasMore) {
      const response = await config.api.getContent(currentPage, batchSize);
      if (!response || !response.data) {
        break;
      }
      
      const filteredData = response.data.filter(item => item.heading);
      allData.push(...filteredData);
      
      const totalPages = response.meta?.pagination?.pageCount || 1;
      hasMore = currentPage < totalPages;
      currentPage++;
    }

    return allData;
  };

  const loadContent = async (page = 1, search = '', updateUrl = true, append = false, forceFullLoad = false) => {
    try {
      if (!append) {
        if (content.length > 0 && !forceFullLoad) {
          setIsTransitioning(true);
        } else {
          setLoading(true);
          setIsTransitioning(false);
        }
      } else {
        setIsInfiniteLoading(true);
      }
      setError(null);

      let response;
      let allData: Post[] = [];

      if (sortBy && sortBy !== 'relevance' && !search) {
        allData = await fetchAllContent();
        if (allData.length === 0) {
          throw new Error('Invalid response format from API');
        }

        const getDisplayNumber = (sermonNumber: string | null) => {
          if (!sermonNumber) return 0;
          const parts = sermonNumber.split('.');
          return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
        };

        allData.sort((a, b) => {
          switch (sortBy) {
            case 'sermon-asc':
              return getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber);
            case 'sermon-desc':
              return getDisplayNumber(b.sermonNumber) - getDisplayNumber(a.sermonNumber);
            default:
              return 0;
          }
        });

        setAllContent(allData);

        const pageSize = 15;
        const totalItems = allData.length;
        const totalPagesCalc = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = allData.slice(startIndex, endIndex);

        if (append) {
          setContent(prevContent => [...prevContent, ...paginatedData]);
        } else {
          setContent(paginatedData);
        }

        setCurrentPage(page);
        setTotalPages(totalPagesCalc);
        setTotal(totalItems);
        setHasNextPage(page < totalPagesCalc);

      } else if (search) {
        const fetchedData = await fetchAllContent();

        if (fetchedData.length === 0) {
          throw new Error('Invalid response format from API');
        }

        let searchResults = clientSideSearchFilter(fetchedData, search);

        if (sortBy && sortBy !== 'relevance') {
          const getDisplayNumber = (sermonNumber: string | null) => {
            if (!sermonNumber) return 0;
            const parts = sermonNumber.split('.');
            return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
          };

          searchResults.sort((a, b) => {
            switch (sortBy) {
              case 'sermon-asc':
                return getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber);
              case 'sermon-desc':
                return getDisplayNumber(b.sermonNumber) - getDisplayNumber(a.sermonNumber);
              default:
                return 0;
            }
          });
        }

        setAllContent(searchResults);

        const pageSize = 15;
        const totalItems = searchResults.length;
        const totalPagesCalc = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = searchResults.slice(startIndex, endIndex);

        if (append) {
          setContent(prevContent => [...prevContent, ...paginatedData]);
        } else {
          setContent(paginatedData);
        }

        setCurrentPage(page);
        setTotalPages(totalPagesCalc);
        setTotal(totalItems);
        setHasNextPage(page < totalPagesCalc);

      } else {
        response = await config.api.getContent(page, 15);

        if (!response || !response.data) {
          throw new Error('Invalid response format from API');
        }

        const filteredData = response.data.filter(item => item.heading);

        if (append) {
          setContent(prevContent => [...prevContent, ...filteredData]);
        } else {
          setContent(filteredData);
        }

        setCurrentPage(page);
        setTotalPages(response.meta?.pagination?.pageCount || 1);
        setTotal(response.meta?.pagination?.total || 0);
        setHasNextPage(page < (response.meta?.pagination?.pageCount || 1));
        setAllContent([]);
      }

      if (updateUrl) {
        updateUrlParams(page, search, sortBy);
      }
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
      setIsTransitioning(false);
      setIsInfiniteLoading(false);
      setIsInitialized(true);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setContent([]);
    setAllContent([]);
    loadContent(1, searchTerm, true, false, true);
  };

  const handleLoadMore = () => {
    if (!isInfiniteLoading && hasNextPage) {
      loadContent(currentPage + 1, searchTerm, true, true);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (page || search || sort) {
      setIsRestoringState(true);
      if (page) setCurrentPage(parseInt(page, 10));
      if (search) setSearchTerm(search);
      if (sort) setSortBy(sort);
    }

    loadContent(
      page ? parseInt(page, 10) : 1,
      search || '',
      false,
      false,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized || isRestoringState) {
      setIsRestoringState(false);
      return;
    }

    setCurrentPage(1);
    setContent([]);
    setAllContent([]);

    loadContent(1, searchTerm, true, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const sortOptions = [
    { value: 'sermon-asc', label: 'Number (Ascending)' },
    { value: 'sermon-desc', label: 'Number (Descending)' },
    { value: 'relevance', label: 'Relevance' }
  ];

  const handlePageChange = (page: number) => {
    if (allContent.length > 0 && (sortBy || searchTerm)) {
      const pageSize = 15;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allContent.slice(startIndex, endIndex);

      setContent(paginatedData);
      setCurrentPage(page);
      setHasNextPage(page < totalPages);
      updateUrlParams(page, searchTerm, sortBy);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsTransitioning(true);
      loadContent(page, searchTerm, true, false);
    }
  };

  const handleGoToNumber = async (targetNumber: number) => {
    if (targetNumber < 1) {
      return;
    }

    const pageSize = 15;

    const getDisplayNumber = (sermonNumber: string | null) => {
      if (!sermonNumber) return 0;
      const parts = sermonNumber.split('.');
      return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
    };

    const scrollToCard = (attempts = 0) => {
      const cardElement = document.getElementById(`listing-${targetNumber}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardElement.classList.add('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
        setTimeout(() => {
          cardElement.classList.remove('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
        }, 2000);
      } else if (attempts < 50) {
        setTimeout(() => scrollToCard(attempts + 1), 100);
      }
    };

    setIsTransitioning(true);

    try {
      let dataToSearch: Post[] = [];

      if (allContent.length > 0) {
        dataToSearch = allContent;
      } else {
        const fetchedData = await fetchAllContent();

        if (fetchedData.length === 0) {
          setIsTransitioning(false);
          return;
        }

        dataToSearch = fetchedData;
        dataToSearch.sort((a, b) => getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber));
        setAllContent(dataToSearch);
      }

      const itemIndex = dataToSearch.findIndex(item => getDisplayNumber(item.sermonNumber) === targetNumber);

      if (itemIndex === -1) {
        setIsTransitioning(false);
        return;
      }

      const targetPage = Math.floor(itemIndex / pageSize) + 1;

      const startIndex = (targetPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = dataToSearch.slice(startIndex, endIndex);

      setContent(paginatedData);
      setCurrentPage(targetPage);
      setTotalPages(Math.ceil(dataToSearch.length / pageSize));
      setTotal(dataToSearch.length);
      setHasNextPage(targetPage < Math.ceil(dataToSearch.length / pageSize));
      updateUrlParams(targetPage, searchTerm, sortBy);

      requestAnimationFrame(() => {
        setTimeout(() => scrollToCard(), 100);
      });
    } catch (err) {
      console.error('Error in handleGoToNumber:', err);
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl text-[var(--color-ink)] mb-4">Error Loading {config.title}</h2>
          <p className="font-body text-[var(--color-warm-gray)] mb-6">{error}</p>
          <button
            onClick={() => loadContent()}
            className="px-6 py-3 bg-[var(--color-primary)] text-white font-body hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-10">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-ink)] mb-2 lg:mb-3">{config.title}</h1>
          <p className="font-body text-sm lg:text-base text-[var(--color-warm-gray)] max-w-2xl">
            {config.subtitle}
          </p>
          <div className="w-12 lg:w-16 h-[2px] bg-[var(--color-accent)] mt-4 lg:mt-6" />
        </div>

        {/* Filter Bar */}
        <TopFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          onGoToNumber={handleGoToNumber}
          totalItems={total}
          onSearch={handleSearch}
        />

        <div className="flex flex-col gap-8">
          {/* Transitioning indicator */}
          {isTransitioning && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-body">
              Loading...
            </div>
          )}
          
          <ContentListing
            content={content}
            onPageChange={handlePageChange}
            onLoadMore={handleLoadMore}
            loading={loading || minLoadingTime}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            title={config.title}
            contentType={config.contentType}
            hasNextPage={hasNextPage}
            isInfiniteLoading={isInfiniteLoading}
            displayMode={displayMode}
            showTopPagination={true}
          />
        </div>
      </div>
    </div>
  );
}

function ContentPageFallback({ config }: ContentPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6 lg:mb-10">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-ink)] mb-2 lg:mb-3">{config.title}</h1>
          <p className="font-body text-sm lg:text-base text-[var(--color-warm-gray)] max-w-2xl">
            {config.subtitle}
          </p>
          <div className="w-12 lg:w-16 h-[2px] bg-[var(--color-accent)] mt-4 lg:mt-6" />
        </div>
        <div className="animate-pulse">
          <div className="h-12 lg:h-14 bg-white border border-[var(--color-stone)] mb-6 lg:mb-8"></div>
          <div className="space-y-3 lg:space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 lg:h-24 bg-white border border-[var(--color-stone)]"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentPage({ config }: ContentPageProps) {
  return (
    <Suspense fallback={<ContentPageFallback config={config} />}>
      <ContentPageContent config={config} />
    </Suspense>
  );
}

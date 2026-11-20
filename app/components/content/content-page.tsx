'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Search, Hash } from 'lucide-react';
import SidebarFilter from '@/app/components/sidebar-filter';
import ContentListing from './content-listing';
import { postsApi, type Post, type ApiResponse, type Edition } from '@/api/posts';

import { normalizeTextForSearch } from '@/app/utils/text-formatting';
import { getPreference, setPreference, parseDisplayMode, type DisplayMode } from '@/app/utils/preferences';
import { Input } from '@/app/components/ui';

interface ContentPageConfig {
  contentType: 'orations' | 'letters' | 'sayings';
  title: string;
  subtitle: string;
  api: {
    getContent: (page?: number, pageSize?: number, editionTitle?: string) => Promise<ApiResponse>;
    searchContent: (query: string, page?: number, pageSize?: number, editionTitle?: string) => Promise<ApiResponse>;
  };
  tocArabic?: string;
  tocEnglish?: string;
}

interface ContentPageProps {
  config: ContentPageConfig;
}

function ContentPageContent({ config }: ContentPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(() => searchParams.get('search') || '');
  // URL params win, then the user's saved preferences, then defaults
  const resolveSort = (value: string | null) => value || getPreference('sort') || 'sermon-asc';
  const resolveEdition = (value: string | null) => value || getPreference('edition') || 'Qutbuddin';
  const resolveDisplay = (value: string | null): DisplayMode =>
    parseDisplayMode(value) || parseDisplayMode(getPreference('display')) || 'both';

  const [sortBy, setSortBy] = useState(() => resolveSort(searchParams.get('sort')));
  const [selectedEdition, setSelectedEdition] = useState(() => resolveEdition(searchParams.get('edition')));
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => resolveDisplay(searchParams.get('display')));

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPreference('sort', value);
  };

  const handleDisplayModeChange = (value: DisplayMode) => {
    setDisplayMode(value);
    setPreference('display', value);
  };

  // Changing the edition reloads the list (see the sortBy/selectedEdition effect below).
  // null until loaded; the first content load waits for it so a saved edition that was
  // renamed or removed in Strapi can be replaced before it's used.
  const [editions, setEditions] = useState<Edition[] | null>(null);
  useEffect(() => {
    postsApi.getEditions()
      .then(res => setEditions(res.data || []))
      .catch((err) => { console.error(err); setEditions([]); });
  }, []);

  const handleEditionChange = (value: string) => {
    setSelectedEdition(value);
    setPreference('edition', value);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goToValue, setGoToValue] = useState('');
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

  const aboutEditionHref = selectedEdition && editions !== null
    ? `/editions/about?edition=${encodeURIComponent(selectedEdition)}`
    : '/editions/about';

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const updateUrlParams = (page?: number, search?: string, sort?: string, edition?: string, display?: string) => {
    const params = new URLSearchParams();

    // Use current state if parameters not provided
    const currentSearch = search !== undefined ? search : appliedSearchTerm;
    const currentSort = sort !== undefined ? sort : sortBy;
    const currentEdition = edition !== undefined ? edition : selectedEdition;
    const currentPageNum = page !== undefined ? page : currentPage;
    const currentDisplay = display !== undefined ? display : displayMode;

    if (currentPageNum && currentPageNum !== 1) {
      params.set('page', currentPageNum.toString());
    }

    if (currentSearch && currentSearch !== '') {
      params.set('search', currentSearch);
    }

    if (currentSort && currentSort !== '') {
      params.set('sort', currentSort);
    }

    if (currentEdition && currentEdition !== '') {
      params.set('edition', currentEdition);
    }

    if (currentDisplay && currentDisplay !== 'both') {
      params.set('display', currentDisplay);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/${config.contentType}?${queryString}` : `/${config.contentType}`;

    // Use window.history.pushState to avoid unnecessary re-renders
    window.history.pushState(null, '', newUrl);
  };

  const clientSideSearchFilter = (posts: Post[], searchQuery: string): Post[] => {
    if (!searchQuery || searchQuery.trim() === '') {
      return posts;
    }

    const query = normalizeTextForSearch(searchQuery);

    return posts.filter(post => {
      if (normalizeTextForSearch(post.title || '').includes(query)) return true;

      if (normalizeTextForSearch(post.heading || '').includes(query)) return true;

      if (post.translations && Array.isArray(post.translations)) {
        const matchesTranslation = post.translations.some(trans =>
          normalizeTextForSearch(trans.text || '').includes(query)
        );
        if (matchesTranslation) return true;
      }

      if (post.paragraphs && Array.isArray(post.paragraphs)) {
        const matchesArabic = post.paragraphs.some(para =>
          normalizeTextForSearch(para.arabic || '').includes(query)
        );
        if (matchesArabic) return true;

        const matchesParaTranslations = post.paragraphs.some(para =>
          para.translations?.some(trans =>
            normalizeTextForSearch(trans.text || '').includes(query)
          )
        );
        if (matchesParaTranslations) return true;
      }

      return false;
    });
  };

  // Helper function to fetch all content with pagination handling
  const fetchAllContent = async (): Promise<Post[]> => {
    const batchSize = 100; // Strapi typically limits to 100 per request
    let currentPage = 1;
    let hasMore = true;
    const allData: Post[] = [];

    while (hasMore) {
      const response = await config.api.getContent(currentPage, batchSize, selectedEdition);
      if (!response || !response.data) {
        break;
      }

      const filteredData = response.data.filter(item => item.heading);
      allData.push(...filteredData);

      // Check if there are more pages
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
        // Search mode: fetch all data and apply client-side filtering
        const fetchedData = await fetchAllContent();

        if (fetchedData.length === 0) {
          throw new Error('Invalid response format from API');
        }

        // Apply client-side search filter (includes translations.text)
        let searchResults = clientSideSearchFilter(fetchedData, search);

        // Sort if sortBy is active
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

        // Store all filtered results
        setAllContent(searchResults);

        // Paginate results
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
        // Normal mode: server-side pagination
        response = await config.api.getContent(page, 15, selectedEdition);

        if (!response || !response.data) {
          throw new Error('Invalid response format from API');
        }

        let filteredData = response.data.filter(item => item.heading);

        if (append) {
          setContent(prevContent => [...prevContent, ...filteredData]);
        } else {
          setContent(filteredData);
        }

        setCurrentPage(page);
        setTotalPages(response.meta?.pagination?.pageCount || 1);
        setTotal(response.meta?.pagination?.total || filteredData.length);
        setHasNextPage(page < (response.meta?.pagination?.pageCount || 1));
      }

      // Update URL after state updates
      if (updateUrl && !append) {
        updateUrlParams(page, search, sortBy, selectedEdition, displayMode);
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. The server took too long to respond. Please try again.';
        } else if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(`Failed to load ${config.contentType}: ${errorMessage}`);
      console.error(`Error loading ${config.contentType}:`, err);

      if (!append) {
        setContent([]);
      }
    } finally {
      // Smooth transition timing
      setTimeout(() => {
        setLoading(false);
        setIsTransitioning(false);
        setIsInfiniteLoading(false);
      }, 150);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isInfiniteLoading) {
      const nextPage = currentPage + 1;
      loadContent(nextPage, searchTerm, false, true);
    }
  };

  // Sync URL params to state when navigating back (e.g., browser back button)
  useEffect(() => {
    const page = searchParams.get('page');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const edition = searchParams.get('edition');
    const display = searchParams.get('display');

    const urlPage = page ? parseInt(page, 10) : 1;
    const urlSearch = search || '';
    const urlSort = resolveSort(sort);
    const urlEdition = resolveEdition(edition);
    const urlDisplay = resolveDisplay(display);

    // Check if URL params differ from current state
    const stateChanged =
      urlPage !== currentPage ||
      urlSearch !== searchTerm ||
      urlSort !== sortBy ||
      urlEdition !== selectedEdition ||
      urlDisplay !== displayMode;

    if (isInitialized && stateChanged) {
      // User navigated back/forward, restore state from URL
      setIsRestoringState(true);
      setSearchTerm(urlSearch);
      setAppliedSearchTerm(urlSearch);
      setSortBy(urlSort);
      setSelectedEdition(urlEdition);
      setDisplayMode(urlDisplay);
      setCurrentPage(urlPage);

      // Load content with URL parameters
      loadContent(urlPage, urlSearch, false, false).finally(() => {
        setIsRestoringState(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Initial load, once the editions are known
  useEffect(() => {
    if (isInitialized || editions === null) return;
    if (editions.length > 0 && !editions.some(ed => ed.title === selectedEdition)) {
      const fallback = editions.find(ed => ed.title === 'Qutbuddin')?.title || editions[0].title;
      handleEditionChange(fallback); // re-runs this effect with the valid edition
      return;
    }
    const urlSearch = searchParams.get('search') || '';
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    setAppliedSearchTerm(urlSearch);
    loadContent(urlPage, urlSearch, false, false).finally(() => {
      setIsInitialized(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editions, selectedEdition]);

  // Manual search handler (triggered by search button)
  const handleSearch = () => {
    setCurrentPage(1);
    setAllContent([]); // Clear cached content to force fresh search
    setAppliedSearchTerm(searchTerm);
    loadContent(1, searchTerm, true, false);
  };

  // Handle sort changes
  useEffect(() => {
    if (!isInitialized || isRestoringState) return;

    setCurrentPage(1);
    setLoading(true);
    setContent([]);
    setAllContent([]);

    loadContent(1, appliedSearchTerm, true, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, selectedEdition]);

  useEffect(() => {
    if (!isInitialized || isRestoringState) return;
    updateUrlParams(currentPage, undefined, undefined, undefined, displayMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode]);

  // Arabic-only editions (e.g. Attar) have no English headings or translations. Until content
  // loads, assume English is available so the option doesn't flicker away.
  const englishAvailable = content.length === 0 || content.some(item =>
    !!item.TocEnglish ||
    (!!item.heading && item.heading !== 'Untitled' && /[A-Za-z]/.test(item.heading)) ||
    (item.translations?.length ?? 0) > 0
  );
  // A saved "English Only" preference would show empty cards here, so fall back to both
  // without overwriting the preference (it applies again on editions with English)
  const effectiveDisplayMode: DisplayMode = !englishAvailable && displayMode === 'english-only' ? 'both' : displayMode;

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
      updateUrlParams(page, appliedSearchTerm, sortBy, selectedEdition, displayMode);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsTransitioning(true);
      loadContent(page, searchTerm, true, false);
    }
  };

  const handleGoToNumber = async (targetNumber: number) => {
    // Validate the number is within range
    if (targetNumber < 1) {
      return;
    }

    const pageSize = 15;

    // Helper function to get display number from sermon number
    const getDisplayNumber = (sermonNumber: string | null) => {
      if (!sermonNumber) return 0;
      const parts = sermonNumber.split('.');
      return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
    };

    // Function to scroll to the card once it's rendered
    const scrollToCard = (attempts = 0) => {
      const cardElement = document.getElementById(`listing-${targetNumber}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a brief highlight effect
        cardElement.classList.add('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
        setTimeout(() => {
          cardElement.classList.remove('ring-2', 'ring-[var(--color-primary)]', 'ring-offset-2');
        }, 2000);
      } else if (attempts < 50) {
        // Retry up to 50 times (5 seconds total) to handle slower page loads
        setTimeout(() => scrollToCard(attempts + 1), 100);
      }
    };

    setIsTransitioning(true);

    try {
      // We need all content to find the item position
      let dataToSearch: Post[] = [];

      if (allContent.length > 0) {
        // Already have all content loaded (sorted/searched mode)
        dataToSearch = allContent;
      } else {
        // Need to fetch all content - fetch in batches to handle API pagination limits
        const fetchedData = await fetchAllContent();

        if (fetchedData.length === 0) {
          setIsTransitioning(false);
          return;
        }

        dataToSearch = fetchedData;

        // Sort by sermon number ascending (default order)
        dataToSearch.sort((a, b) => getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber));

        // Store for future use
        setAllContent(dataToSearch);
      }

      // Find the index of the item with the target sermon number
      const itemIndex = dataToSearch.findIndex(item => getDisplayNumber(item.sermonNumber) === targetNumber);

      if (itemIndex === -1) {
        // Item not found
        setIsTransitioning(false);
        return;
      }

      // Calculate which page this item is on (1-based)
      const targetPage = Math.floor(itemIndex / pageSize) + 1;

      // Get the paginated data for this page
      const startIndex = (targetPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = dataToSearch.slice(startIndex, endIndex);

      // Update state
      setContent(paginatedData);
      setCurrentPage(targetPage);
      setTotalPages(Math.ceil(dataToSearch.length / pageSize));
      setTotal(dataToSearch.length);
      setHasNextPage(targetPage < Math.ceil(dataToSearch.length / pageSize));
      updateUrlParams(targetPage, appliedSearchTerm, sortBy, selectedEdition, displayMode);

      // Wait for React to render the new content, then scroll
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
      <div className="content-details-page content-page__error">
        <div className="content-page__error-center">
          <h2 className="content-page__error-title">Error Loading {config.title}</h2>
          <p className="content-page__error-message">{error}</p>
          <button
            onClick={() => loadContent()}
            className="content-error-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="content-page__container">
        {/* Header */}
        <div className="content-page__header">
          <h1 className="content-page__title">{config.title}</h1>
          <p className="content-page__subtitle">
            {config.subtitle}
          </p>
          <div className="content-page__accent" />
        </div>

        {(config.tocArabic || config.tocEnglish) && (
          <div className="content-page__toc">
            {config.tocArabic && (
              <h2 className="content-page__toc-arabic font-taha" dir="rtl">
                {config.tocArabic}
              </h2>
            )}
            {config.tocEnglish && (
              <p className="content-page__toc-english">
                {config.tocEnglish}
              </p>
            )}
          </div>
        )}

        <div className="content-page__edition-bar">
          <span className="content-page__edition-label">
            {/* Nothing edition-specific until editions load: the server can't read the saved preference */}
            Edition: <span className="content-page__edition-name">{editions === null ? '' : selectedEdition}</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="content-page__edition-link"
          >
            Change
          </button>
          <Link href={aboutEditionHref} className="content-page__edition-link">
            About this edition
          </Link>
        </div>

        {/* Sidebar Filter - rendered as overlay modal */}
        <SidebarFilter
          sortBy={sortBy}
          setSortBy={handleSortChange}
          sortOptions={sortOptions}
          displayMode={effectiveDisplayMode}
          setDisplayMode={handleDisplayModeChange}
          selectedEdition={selectedEdition}
          onEditionChange={handleEditionChange}
          englishAvailable={englishAvailable}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-bar__corner-accent--top-left" />
          <div className="filter-bar__corner-accent--bottom-right" />

          <div className="filter-bar__row">
            <div className="filter-bar__search-group">
              <div className="filter-bar__search-input-wrap">
                <Input
                  placeholder={`Search ${config.contentType}, topics, or keywords...`}
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <button onClick={handleSearch} className="filter-bar__search-btn">
                <Search className="w-4 h-4" />
                <span className="filter-bar__search-btn-text">Search</span>
              </button>
            </div>

            <div className="filter-bar__controls">
              <form
                className="filter-bar__goto-wrap"
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = parseInt(goToValue, 10);
                  if (num > 0) {
                    handleGoToNumber(num);
                    setGoToValue('');
                  }
                }}
              >
                <div className="filter-bar__goto-icon">
                  <Hash className="w-5 h-5 text-[var(--color-warm-gray)]" />
                </div>
                <input
                  type="number"
                  min="1"
                  max={total || undefined}
                  placeholder="Go to #"
                  aria-label="Go to number"
                  value={goToValue}
                  onChange={(e) => setGoToValue(e.target.value)}
                  className="filter-bar__goto-input"
                />
                <button
                  type="submit"
                  disabled={!goToValue || parseInt(goToValue, 10) <= 0}
                  className="filter-bar__goto-btn"
                >
                  Go
                </button>
              </form>

              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="filter-bar__filters-btn"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="content-page__body">
          {(isTransitioning || loading) && (
            <div className="content-page__loading-bar">
              <div className="content-page__loading-bar-fill" />
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
            isTransitioning={isTransitioning}
            displayMode={effectiveDisplayMode}
            listingParams={{
              page: currentPage > 1 ? currentPage.toString() : '',
              search: appliedSearchTerm,
              sort: sortBy,
              edition: selectedEdition,
              display: effectiveDisplayMode
            }}
            showTopPagination={true}
          />
        </div>
      </div>
    </div>
  );
}

function ContentPageFallback({ config }: ContentPageProps) {
  return (
    <div className="content-page">
      <div className="content-page__container">
        <div className="content-page__header">
          <h1 className="content-page__title">{config.title}</h1>
          <p className="content-page__subtitle">
            {config.subtitle}
          </p>
          <div className="content-page__accent" />
        </div>
        <div className="content-page__fallback-pulse">
          <div className="content-page__fallback-skeleton-bar"></div>
          <div className="content-page__fallback-skeleton-list">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="content-page__fallback-skeleton-item"></div>
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

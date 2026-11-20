'use client';
import React, { useState, useEffect } from 'react';
import { ListViewItem, Pagination } from '@/app/components/content-widgets';
import { type Post } from '@/api/posts';
import { useInfiniteScroll } from '@/app/hooks/useInfiniteScroll';

interface ContentListingProps {
  content: Post[];
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  title?: string;
  subtitle?: string;
  contentType: 'orations' | 'letters' | 'sayings';
  hasNextPage?: boolean;
  isInfiniteLoading?: boolean;
  isTransitioning?: boolean;
  displayMode?: 'both' | 'english-only' | 'arabic-only';
  listingParams?: {
    page?: string;
    search?: string;
    sort?: string;
    edition?: string;
    display?: string;
  };
  showTopPagination?: boolean;
}

export default function ContentListing({
  content,
  onPageChange,
  onLoadMore,
  loading = false,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  title = "Content",
  subtitle,
  contentType,
  hasNextPage = false,
  isInfiniteLoading = false,
  isTransitioning = false,
  displayMode = 'both',
  listingParams,
  showTopPagination = false
}: ContentListingProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isInfiniteLoading,
    loadMore: onLoadMore || (() => {}),
    threshold: 300
  });

  const renderListView = () => (
    <div className="content-listing__list">
      {content.map((item, index) => (
        <div
          key={item.id || index}
          ref={index === content.length - 1 && isMobile ? lastElementRef : undefined}
        >
          <ListViewItem
            item={item}
            contentType={contentType}
            displayMode={displayMode}
            isExpanded={expandedItems.has(item.id)}
            onToggleExpand={() => toggleExpanded(item.id)}
            listingParams={listingParams}
          />
        </div>
      ))}
    </div>
  );

  const renderLoadingList = () => (
    <div className="content-listing__list">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="content-listing-skeleton content-details__skeleton"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="content-listing__skeleton-row">
            <div className="content-listing-skeleton__badge"></div>
            <div className="content-listing__skeleton-body">
              <div className="content-listing__skeleton-body-inner">
                <div className="content-listing__skeleton-body-content">
                  <div className="content-listing__skeleton-title"></div>
                  <div className="content-listing__skeleton-tags">
                    <div className="content-listing__skeleton-tag"></div>
                    <div className="content-listing__skeleton-tag content-listing__skeleton-tag--wide"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const showInitialSkeleton = loading && content.length === 0;
  const showTransitionOverlay = isTransitioning && content.length > 0;

  return (
    <div className="content-listing__wrapper">
      <div className="content-listing__header">
        <p className="content-listing__subtitle">
          {showInitialSkeleton ? "Loading..." : (subtitle || `Showing ${content.length} of ${total} results`)}
        </p>

        {/* Show pagination only on desktop at top */}
        {showTopPagination && totalPages > 1 && onPageChange && (
          <div className="content-listing__top-pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showRange={false}
              loading={loading}
            />
          </div>
        )}
      </div>

      {showInitialSkeleton ? (
        renderLoadingList()
      ) : (
        <div className="content-listing__results">
          {showTransitionOverlay && (
            <div className="content-listing__transition-overlay">
              <div className="content-listing__transition-badge">
                <span className="content-listing__transition-dot" />
                Updating results...
              </div>
            </div>
          )}
          {renderListView()}

          {/* Show loading indicator on mobile for infinite scroll */}
          {isInfiniteLoading && (
            <div className="content-listing__infinite-loader">
              <div className="content-listing__infinite-skeleton">
                <div className="content-listing__infinite-card">
                  <div className="content-listing__infinite-row">
                    <div className="content-listing__infinite-badge"></div>
                    <div className="content-listing__skeleton-body">
                      <div className="content-listing__skeleton-body-inner">
                        <div className="content-listing__skeleton-body-content">
                          <div className="content-listing__skeleton-title"></div>
                          <div className="content-listing__skeleton-tags">
                            <div className="content-listing__skeleton-tag"></div>
                            <div className="content-listing__skeleton-tag content-listing__skeleton-tag--wide"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show pagination at bottom on desktop only */}
          {totalPages > 1 && onPageChange && (
            <div className="content-listing__bottom-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showRange={false}
                loading={loading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { type Post, orationsApi, lettersApi } from '@/api/posts';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  BookOpen,
  Mail,
  Filter,
  Minus,
  Plus,
  RotateCcw
} from 'lucide-react';

interface TimelineItem {
  id: number;
  type: 'oration' | 'letter';
  displayNumber: number;
  heading: string;
  arabicTitle: string;
  englishSummary: string;
  arabicSummary: string;
  tags: { id: number; name: string }[];
  sermonNumber: string;
}

// Fetch all content using pagination (same approach as content-page.tsx)
async function fetchAllOrations(): Promise<Post[]> {
  const batchSize = 100;
  let currentPage = 1;
  let hasMore = true;
  const allData: Post[] = [];

  while (hasMore) {
    try {
      const response = await orationsApi.getOrations(currentPage, batchSize);
      if (!response || !response.data) {
        break;
      }

      const filteredData = response.data.filter((item: Post) => item.heading);
      allData.push(...filteredData);

      const totalPages = response.meta?.pagination?.pageCount || 1;
      hasMore = currentPage < totalPages;
      currentPage++;
    } catch (err) {
      console.error(`Error fetching orations page ${currentPage}:`, err);
      break;
    }
  }

  return allData;
}

async function fetchAllLetters(): Promise<Post[]> {
  const batchSize = 100;
  let currentPage = 1;
  let hasMore = true;
  const allData: Post[] = [];

  while (hasMore) {
    try {
      const response = await lettersApi.getLetters(currentPage, batchSize);
      if (!response || !response.data) {
        break;
      }

      const filteredData = response.data.filter((item: Post) => item.heading);
      allData.push(...filteredData);

      const totalPages = response.meta?.pagination?.pageCount || 1;
      hasMore = currentPage < totalPages;
      currentPage++;
    } catch (err) {
      console.error(`Error fetching letters page ${currentPage}:`, err);
      break;
    }
  }

  return allData;
}

export default function TimelinePage() {
  const [orations, setOrations] = useState<Post[]>([]);
  const [letters, setLetters] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [showOrations, setShowOrations] = useState(true);
  const [showLetters, setShowLetters] = useState(true);
  const [jumpToNumber, setJumpToNumber] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, 0.5 = zoomed out, 2 = zoomed in
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [orationsData, lettersData] = await Promise.all([
          fetchAllOrations(),
          fetchAllLetters()
        ]);
        setOrations(orationsData || []);
        setLetters(lettersData || []);
      } catch (err) {
        console.error('Error loading timeline data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Convert posts to timeline items
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    if (showOrations) {
      orations.forEach(post => {
        const num = post.sermonNumber ? parseInt(post.sermonNumber.split('.')[1] || post.sermonNumber.split('.')[0]) : 0;
        items.push({
          id: post.id,
          type: 'oration',
          displayNumber: num,
          heading: post.heading || 'Untitled',
          arabicTitle: post.title?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '',
          englishSummary: post.TocEnglish || '',
          arabicSummary: post.TocArabic || '',
          tags: post.tags || [],
          sermonNumber: post.sermonNumber || ''
        });
      });
    }

    if (showLetters) {
      letters.forEach(post => {
        const num = post.sermonNumber ? parseInt(post.sermonNumber.split('.')[1] || post.sermonNumber.split('.')[0]) : 0;
        items.push({
          id: post.id,
          type: 'letter',
          displayNumber: num,
          heading: post.heading || 'Untitled',
          arabicTitle: post.title?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || '',
          englishSummary: post.TocEnglish || '',
          arabicSummary: post.TocArabic || '',
          tags: post.tags || [],
          sermonNumber: post.sermonNumber || ''
        });
      });
    }

    // Sort by display number
    return items.sort((a, b) => a.displayNumber - b.displayNumber);
  }, [orations, letters, showOrations, showLetters]);

  // Calculate visible items based on scroll
  const itemWidth = 60 * zoomLevel;
  const visibleCount = Math.ceil(800 / itemWidth);

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = visibleCount * itemWidth * 0.5;
    if (direction === 'left') {
      setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
    } else {
      const maxScroll = Math.max(0, timelineItems.length * itemWidth - 800);
      setScrollPosition(Math.min(maxScroll, scrollPosition + scrollAmount));
    }
  };

  const handleJumpTo = () => {
    const num = parseInt(jumpToNumber);
    if (!isNaN(num)) {
      const index = timelineItems.findIndex(item => item.displayNumber === num);
      if (index !== -1) {
        setScrollPosition(index * itemWidth);
        setSelectedItem(timelineItems[index]);
      }
    }
    setJumpToNumber('');
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoomLevel(Math.min(2, zoomLevel + 0.25));
    } else {
      setZoomLevel(Math.max(0.5, zoomLevel - 0.25));
    }
  };

  const resetView = () => {
    setScrollPosition(0);
    setZoomLevel(1);
    setSelectedItem(null);
    setShowOrations(true);
    setShowLetters(true);
  };

  if (loading) {
    return (
      <div className="timeline-page">
        <div className="timeline-page__container">
          <div className="timeline-page__skeleton">
            <div className="timeline-page__skeleton-title"></div>
            <div className="timeline-page__skeleton-body"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <div className="timeline-page__container">
        {/* Header */}
        <div className="timeline-page__header">
          <div className="timeline-page__header-top">
            <div>
              <h1 className="timeline-page__title">
                Timeline
              </h1>
              <p className="timeline-page__subtitle">
                Explore the orations and letters in sequential order
              </p>
            </div>
            <div className="timeline-page__item-count">
              <span className="timeline-page__item-count-text">
                {timelineItems.length} items
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="timeline-page__controls">
            {/* Filter Toggles */}
            <div className="timeline-page__filter-group">
              <Filter className="w-4 h-4 timeline-page__filter-icon" />
              <button
                onClick={() => setShowOrations(!showOrations)}
                className={`timeline-page__filter-btn ${
                  showOrations ? 'timeline-page__filter-btn--orations-active' : ''
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Orations
              </button>
              <button
                onClick={() => setShowLetters(!showLetters)}
                className={`timeline-page__filter-btn ${
                  showLetters
                    ? 'timeline-page__filter-btn--letters-active'
                    : 'timeline-page__filter-btn--letters'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Letters
              </button>
            </div>

            <div className="timeline-page__divider"></div>

            {/* Jump to Number */}
            <div className="timeline-page__jump-group">
              <input
                type="number"
                value={jumpToNumber}
                onChange={(e) => setJumpToNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJumpTo()}
                placeholder="Jump to #"
                className="timeline-page__jump-input"
              />
              <button
                onClick={handleJumpTo}
                className="timeline-page__jump-btn"
              >
                Go
              </button>
            </div>

            <div className="timeline-page__divider"></div>

            {/* Zoom Controls */}
            <div className="timeline-page__zoom-group">
              <button
                onClick={() => handleZoom('out')}
                className="timeline-page__zoom-btn"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="timeline-page__zoom-label">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="timeline-page__zoom-btn"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={resetView}
              className="timeline-page__reset-btn"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="timeline-page__timeline-box">
          {/* Corner Accents */}
          <div className="timeline-page__corner-accent timeline-page__corner-accent--tl" />
          <div className="timeline-page__corner-accent timeline-page__corner-accent--br" />

          {/* Navigation Arrows */}
          <button
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 0}
            className="timeline-page__nav-btn timeline-page__nav-btn--left"
          >
            <ChevronLeft className="w-5 h-5 timeline-page__nav-icon" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={scrollPosition >= (timelineItems.length * itemWidth - 800)}
            className="timeline-page__nav-btn timeline-page__nav-btn--right"
          >
            <ChevronRight className="w-5 h-5 timeline-page__nav-icon" />
          </button>

          {/* Timeline Track */}
          <div
            ref={timelineRef}
            className="timeline-page__track-area timeline-track"
          >
            {/* Center Line */}
            <div className="timeline-page__center-line" />

            {/* Timeline Points */}
            <div
              className="timeline-page__points-strip"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                width: `${timelineItems.length * itemWidth}px`
              }}
            >
              {timelineItems.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id && selectedItem?.type === item.type ? null : item)}
                  className="timeline-page__point-btn"
                  style={{ width: `${itemWidth}px` }}
                >
                  {/* Number Label - Above */}
                  <span className={`timeline-page__point-label ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? 'timeline-page__point-label--selected'
                      : ''
                  }`}>
                    {item.displayNumber}
                  </span>

                  {/* Point */}
                  <div className={`timeline-page__point-wrap ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? 'timeline-page__point-wrap--selected'
                      : ''
                  }`}>
                    <div className={`timeline-page__point-diamond ${
                      item.type === 'oration'
                        ? selectedItem?.id === item.id && selectedItem?.type === item.type
                          ? 'timeline-page__point-diamond--oration-selected'
                          : 'timeline-page__point-diamond--oration'
                        : selectedItem?.id === item.id && selectedItem?.type === item.type
                          ? 'timeline-page__point-diamond--letter-selected'
                          : 'timeline-page__point-diamond--letter'
                    }`} />
                  </div>

                  {/* Type Label - Below */}
                  <span className={`timeline-page__type-label ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? item.type === 'oration' ? 'timeline-page__type-label--oration-selected' : 'timeline-page__type-label--letter-selected'
                      : ''
                  }`}>
                    {item.type === 'oration' ? 'O' : 'L'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="timeline-page__legend">
            <div className="timeline-page__legend-item">
              <div className="timeline-page__legend-diamond timeline-page__legend-diamond--oration" />
              <span className="timeline-page__legend-text">Oration</span>
            </div>
            <div className="timeline-page__legend-item">
              <div className="timeline-page__legend-diamond timeline-page__legend-diamond--letter" />
              <span className="timeline-page__legend-text">Letter</span>
            </div>
          </div>
        </div>

        {/* Selected Item Preview */}
        {selectedItem && (
          <div className="timeline-page__preview">
            {/* Corner Accents */}
            <div className="timeline-page__preview-corner timeline-page__preview-corner--tl" />
            <div className="timeline-page__preview-corner timeline-page__preview-corner--br" />

            {/* Header */}
            <div className={`timeline-page__preview-header ${
              selectedItem.type === 'oration' ? 'timeline-page__preview-header--oration' : 'timeline-page__preview-header--letter'
            }`}>
              <div className="timeline-page__preview-header-row">
                <div className={`timeline-page__preview-icon-box ${
                  selectedItem.type === 'oration' ? 'timeline-page__preview-icon-box--oration' : 'timeline-page__preview-icon-box--letter'
                }`}>
                  {selectedItem.type === 'oration'
                    ? <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: 'white' }} />
                    : <Mail className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: 'white' }} />
                  }
                </div>
                <div>
                  <div className="timeline-page__preview-meta-row">
                    <span className={`timeline-page__preview-type-label ${
                      selectedItem.type === 'oration' ? 'timeline-page__preview-type-label--oration' : 'timeline-page__preview-type-label--letter'
                    }`}>
                      {selectedItem.type === 'oration' ? 'Oration' : 'Letter'} #{selectedItem.displayNumber}
                    </span>
                    <span className="timeline-page__preview-sermon-num">
                      ({selectedItem.sermonNumber})
                    </span>
                  </div>
                  <h3 className="timeline-page__preview-heading">
                    {selectedItem.heading}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="timeline-page__preview-content">
              {/* Arabic Title */}
              {selectedItem.arabicTitle && (
                <div className="timeline-page__arabic-block">
                  <p className="timeline-page__arabic-text" dir="rtl">
                    {selectedItem.arabicTitle.slice(0, 150)}{selectedItem.arabicTitle.length > 150 ? '...' : ''}
                  </p>
                </div>
              )}

              {/* English Summary */}
              {selectedItem.englishSummary && (
                <div className="timeline-page__summary-section">
                  <h4 className="timeline-page__summary-label">Summary</h4>
                  <p className="timeline-page__summary-english">
                    {selectedItem.englishSummary}
                  </p>
                </div>
              )}

              {/* Arabic Summary */}
              {selectedItem.arabicSummary && (
                <div className="timeline-page__summary-section">
                  <h4 className="timeline-page__summary-label">ملخص</h4>
                  <p className="timeline-page__summary-arabic" dir="rtl">
                    {selectedItem.arabicSummary}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="timeline-page__tags">
                  {selectedItem.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag.id}
                      className="timeline-page__tag"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Link
                href={`/content/details/${selectedItem.type === 'oration' ? 'orations' : 'letters'}/${selectedItem.id}`}
                className="timeline-page__action-link"
              >
                <BookOpen className="w-4 h-4" />
                Go to {selectedItem.type === 'oration' ? 'Oration' : 'Letter'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showOrations && !showLetters && (
          <div className="timeline-page__empty">
            <Calendar className="w-12 h-12 timeline-page__empty-icon" />
            <p className="timeline-page__empty-text">
              Enable at least one filter to view the timeline
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

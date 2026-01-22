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
      <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white border border-[var(--color-stone)] w-48 mb-6"></div>
            <div className="h-64 bg-white border border-[var(--color-stone)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-ink)] mb-2">
                Timeline
              </h1>
              <p className="text-sm lg:text-base text-[var(--color-warm-gray)] font-body">
                Explore the orations and letters in sequential order
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-warm-gray)]">
                {timelineItems.length} items
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 lg:p-4 bg-white border border-[var(--color-stone)]">
            {/* Filter Toggles */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-warm-gray)]" />
              <button
                onClick={() => setShowOrations(!showOrations)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-body border transition-all ${
                  showOrations 
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                    : 'bg-white text-[var(--color-charcoal)] border-[var(--color-stone)] hover:border-[var(--color-primary)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Orations
              </button>
              <button
                onClick={() => setShowLetters(!showLetters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-body border transition-all ${
                  showLetters 
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' 
                    : 'bg-white text-[var(--color-charcoal)] border-[var(--color-stone)] hover:border-[var(--color-accent)]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Letters
              </button>
            </div>

            <div className="hidden sm:block w-px h-6 bg-[var(--color-stone)]"></div>

            {/* Jump to Number */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={jumpToNumber}
                onChange={(e) => setJumpToNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJumpTo()}
                placeholder="Jump to #"
                className="w-20 lg:w-24 px-2 py-1.5 text-xs lg:text-sm border border-[var(--color-stone)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={handleJumpTo}
                className="px-2 py-1.5 text-xs lg:text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Go
              </button>
            </div>

            <div className="hidden sm:block w-px h-6 bg-[var(--color-stone)]"></div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 text-[var(--color-charcoal)] hover:text-[var(--color-primary)] hover:bg-[var(--color-cream)] transition-colors"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs text-[var(--color-warm-gray)] min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 text-[var(--color-charcoal)] hover:text-[var(--color-primary)] hover:bg-[var(--color-cream)] transition-colors"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={resetView}
              className="p-1.5 text-[var(--color-charcoal)] hover:text-[var(--color-primary)] hover:bg-[var(--color-cream)] transition-colors ml-auto"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative bg-white border border-[var(--color-stone)] p-4 lg:p-6">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 lg:w-6 lg:h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 lg:w-6 lg:h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

          {/* Navigation Arrows */}
          <button
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-white border border-[var(--color-stone)] shadow-md hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-primary)]" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={scrollPosition >= (timelineItems.length * itemWidth - 800)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-white border border-[var(--color-stone)] shadow-md hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
          </button>

          {/* Timeline Track */}
          <div 
            ref={timelineRef}
            className="relative overflow-hidden mx-10 lg:mx-14"
            style={{ height: '120px' }}
          >
            {/* Center Line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--color-stone)]" />

            {/* Timeline Points */}
            <div 
              className="absolute top-0 bottom-0 flex items-center transition-transform duration-300"
              style={{ 
                transform: `translateX(-${scrollPosition}px)`,
                width: `${timelineItems.length * itemWidth}px`
              }}
            >
              {timelineItems.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id && selectedItem?.type === item.type ? null : item)}
                  className="flex flex-col items-center justify-center group"
                  style={{ width: `${itemWidth}px` }}
                >
                  {/* Number Label - Above */}
                  <span className={`text-[10px] lg:text-xs font-display mb-1 transition-colors ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? 'text-[var(--color-primary)] font-semibold'
                      : 'text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)]'
                  }`}>
                    {item.displayNumber}
                  </span>

                  {/* Point */}
                  <div className={`relative w-3 h-3 lg:w-4 lg:h-4 transition-all duration-200 ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? 'scale-150'
                      : 'group-hover:scale-125'
                  }`}>
                    <div className={`absolute inset-0 rotate-45 border-2 transition-colors ${
                      item.type === 'oration'
                        ? selectedItem?.id === item.id && selectedItem?.type === item.type
                          ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                          : 'bg-white border-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/20'
                        : selectedItem?.id === item.id && selectedItem?.type === item.type
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                          : 'bg-white border-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/20'
                    }`} />
                  </div>

                  {/* Type Label - Below */}
                  <span className={`text-[8px] lg:text-[10px] mt-1 uppercase tracking-wider transition-colors ${
                    selectedItem?.id === item.id && selectedItem?.type === item.type
                      ? item.type === 'oration' ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent)]'
                      : 'text-[var(--color-warm-gray)] group-hover:text-[var(--color-charcoal)]'
                  }`}>
                    {item.type === 'oration' ? 'O' : 'L'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--color-stone)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/20" />
              <span className="text-xs text-[var(--color-warm-gray)]">Oration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rotate-45 border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/20" />
              <span className="text-xs text-[var(--color-warm-gray)]">Letter</span>
            </div>
          </div>
        </div>

        {/* Selected Item Preview */}
        {selectedItem && (
          <div className="mt-6 lg:mt-8 bg-white border border-[var(--color-stone)] relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-3 h-3 lg:w-4 lg:h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />

            {/* Header */}
            <div className={`px-4 lg:px-6 py-3 lg:py-4 border-b border-[var(--color-stone)] ${
              selectedItem.type === 'oration' ? 'bg-[var(--color-primary)]/5' : 'bg-[var(--color-accent)]/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center ${
                  selectedItem.type === 'oration' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-accent)]'
                }`}>
                  {selectedItem.type === 'oration' 
                    ? <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    : <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs uppercase tracking-wider ${
                      selectedItem.type === 'oration' ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent)]'
                    }`}>
                      {selectedItem.type === 'oration' ? 'Oration' : 'Letter'} #{selectedItem.displayNumber}
                    </span>
                    <span className="text-xs text-[var(--color-warm-gray)]">
                      ({selectedItem.sermonNumber})
                    </span>
                  </div>
                  <h3 className="font-display text-lg lg:text-xl text-[var(--color-ink)]">
                    {selectedItem.heading}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6">
              {/* Arabic Title */}
              {selectedItem.arabicTitle && (
                <div className="mb-4 p-3 lg:p-4 bg-[var(--color-parchment)]/50 border-r-2 border-[var(--color-primary)]">
                  <p className="font-taha text-base lg:text-lg text-[var(--color-ink)] leading-loose" dir="rtl">
                    {selectedItem.arabicTitle.slice(0, 150)}{selectedItem.arabicTitle.length > 150 ? '...' : ''}
                  </p>
                </div>
              )}

              {/* English Summary */}
              {selectedItem.englishSummary && (
                <div className="mb-4">
                  <h4 className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] mb-2">Summary</h4>
                  <p className="font-body text-sm lg:text-base text-[var(--color-charcoal)] leading-relaxed">
                    {selectedItem.englishSummary}
                  </p>
                </div>
              )}

              {/* Arabic Summary */}
              {selectedItem.arabicSummary && (
                <div className="mb-4">
                  <h4 className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] mb-2">ملخص</h4>
                  <p className="font-taha text-sm lg:text-base text-[var(--color-ink)] leading-loose" dir="rtl">
                    {selectedItem.arabicSummary}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex px-2 py-0.5 text-[10px] lg:text-xs font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Link
                href={`/${selectedItem.type === 'oration' ? 'orations' : 'letters'}/details/${selectedItem.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-body text-sm hover:bg-[var(--color-primary-dark)] transition-colors"
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
          <div className="mt-6 p-8 bg-white border border-[var(--color-stone)] text-center">
            <Calendar className="w-12 h-12 text-[var(--color-warm-gray)] mx-auto mb-4" />
            <p className="text-[var(--color-warm-gray)] font-body">
              Enable at least one filter to view the timeline
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

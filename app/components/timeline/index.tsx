'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, BookOpen, FileText, Loader2 } from 'lucide-react';
import { type Post } from '@/api/posts';

interface TimelineProps {
  contentType: 'orations' | 'letters';
  title: string;
  items: Post[];
  loading?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ contentType, title, items, loading = false }) => {
  const [selectedItem, setSelectedItem] = useState<Post | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const contentTypeLabel = contentType === 'orations' ? 'Oration' : 'Letter';
  const Icon = contentType === 'orations' ? BookOpen : FileText;

  // Get display number from sermon number
  const getDisplayNumber = (sermonNumber: string | null): number => {
    if (!sermonNumber) return 0;
    const parts = sermonNumber.split('.');
    return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
  };

  // Sort items by their number
  const sortedItems = [...items].sort((a, b) => 
    getDisplayNumber(a.sermonNumber) - getDisplayNumber(b.sermonNumber)
  );

  const visibleItems = sortedItems.slice(visibleRange.start, visibleRange.end);

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 10;
    if (direction === 'left') {
      setVisibleRange(prev => ({
        start: Math.max(0, prev.start - step),
        end: Math.max(step, prev.end - step)
      }));
    } else {
      setVisibleRange(prev => ({
        start: Math.min(sortedItems.length - step, prev.start + step),
        end: Math.min(sortedItems.length, prev.end + step)
      }));
    }
  };

  const handleItemClick = (item: Post) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  // Get Arabic preview
  const getArabicPreview = (item: Post): string | null => {
    if (item.title) {
      const cleanTitle = item.title
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      return cleanTitle.slice(0, 100) + (cleanTitle.length > 100 ? '...' : '');
    }
    return null;
  };

  // Get English preview
  const getEnglishPreview = (item: Post): string | null => {
    if (item.translations && item.translations.length > 0) {
      const enTranslation = item.translations.find(t => t.type === 'en');
      if (enTranslation?.text) {
        return enTranslation.text.slice(0, 150) + (enTranslation.text.length > 150 ? '...' : '');
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-3" />
          <p className="text-[var(--color-warm-gray)] font-body">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="font-display text-xl lg:text-2xl text-[var(--color-ink)]">{title}</h2>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            {sortedItems.length} {contentType} • Click on a point to see details
          </p>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={visibleRange.start === 0}
            className="p-2 border border-[var(--color-stone)] bg-white hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-charcoal)]" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={visibleRange.end >= sortedItems.length}
            className="p-2 border border-[var(--color-stone)] bg-white hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-charcoal)]" />
          </button>
        </div>
      </div>

      {/* Range Indicator */}
      <div className="mb-4 text-xs text-[var(--color-warm-gray)] font-body">
        Showing {contentTypeLabel}s {visibleRange.start + 1} - {Math.min(visibleRange.end, sortedItems.length)} of {sortedItems.length}
      </div>

      {/* Timeline Track */}
      <div className="relative" ref={timelineRef}>
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gradient-to-r from-[var(--color-stone)] via-[var(--color-primary)] to-[var(--color-stone)] transform -translate-y-1/2" />
        
        {/* Timeline Points */}
        <div className="relative flex justify-between items-center py-8 overflow-x-auto">
          {visibleItems.map((item, index) => {
            const displayNum = getDisplayNumber(item.sermonNumber);
            const isSelected = selectedItem?.id === item.id;
            
            return (
              <div 
                key={item.id}
                className="flex flex-col items-center flex-shrink-0 px-2 lg:px-3"
                style={{ minWidth: '60px' }}
              >
                {/* Number Label (top) */}
                <div className={`mb-3 text-xs lg:text-sm font-display transition-colors ${
                  isSelected ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-warm-gray)]'
                }`}>
                  {displayNum}
                </div>
                
                {/* Timeline Point */}
                <button
                  onClick={() => handleItemClick(item)}
                  className={`relative w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] scale-125 shadow-lg' 
                      : 'bg-white border-[var(--color-stone)] hover:border-[var(--color-primary)] hover:scale-110'
                  }`}
                  aria-label={`View ${contentTypeLabel} ${displayNum}`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-ping opacity-30" />
                  )}
                </button>
                
                {/* Connector Line (bottom) */}
                <div className={`mt-3 w-[1px] h-4 transition-colors ${
                  isSelected ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-stone)]'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="mt-6 lg:mt-8 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 lg:w-6 lg:h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 lg:w-6 lg:h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />
          
          <div className="bg-white border border-[var(--color-stone)] p-4 lg:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[var(--color-primary)] flex items-center justify-center">
                  <span className="font-display text-lg lg:text-xl text-white">
                    {getDisplayNumber(selectedItem.sermonNumber)}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg lg:text-xl text-[var(--color-ink)]">
                    {selectedItem.heading || `${contentTypeLabel} ${getDisplayNumber(selectedItem.sermonNumber)}`}
                  </h3>
                  {selectedItem.sermonNumber && (
                    <p className="text-xs lg:text-sm text-[var(--color-warm-gray)]">
                      Section {selectedItem.sermonNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <Link
                href={`/${contentType}/details/${selectedItem.id}`}
                className="btn-primary text-xs lg:text-sm flex-shrink-0"
              >
                <Icon className="w-4 h-4" />
                Go to {contentTypeLabel}
              </Link>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              {/* Arabic Preview */}
              {getArabicPreview(selectedItem) && (
                <div className="bg-[var(--color-parchment)] p-3 lg:p-4 border-r-4 border-[var(--color-accent)]">
                  <p className="font-taha text-base lg:text-lg leading-loose text-[var(--color-ink)]" dir="rtl">
                    {getArabicPreview(selectedItem)}
                  </p>
                </div>
              )}
              
              {/* English Preview */}
              {getEnglishPreview(selectedItem) && (
                <div className="bg-[var(--color-cream)] p-3 lg:p-4 border border-[var(--color-stone)]">
                  <p className="font-body text-sm lg:text-base leading-relaxed text-[var(--color-charcoal)]">
                    {getEnglishPreview(selectedItem)}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-stone)]">
                {selectedItem.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex px-2 py-0.5 text-xs font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jump to Number Input */}
      <div className="mt-6 lg:mt-8 flex items-center gap-3">
        <label className="text-sm text-[var(--color-warm-gray)] font-body">Jump to {contentTypeLabel}:</label>
        <input
          type="number"
          min="1"
          max={sortedItems.length}
          placeholder="#"
          className="w-20 px-3 py-2 text-sm border border-[var(--color-stone)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = parseInt((e.target as HTMLInputElement).value, 10);
              if (target >= 1 && target <= sortedItems.length) {
                const itemIndex = sortedItems.findIndex(item => getDisplayNumber(item.sermonNumber) === target);
                if (itemIndex !== -1) {
                  const newStart = Math.max(0, itemIndex - 5);
                  const newEnd = Math.min(sortedItems.length, newStart + 20);
                  setVisibleRange({ start: newStart, end: newEnd });
                  setSelectedItem(sortedItems[itemIndex]);
                }
              }
            }
          }}
        />
        <span className="text-xs text-[var(--color-warm-gray)]">Press Enter</span>
      </div>
    </div>
  );
};

export default Timeline;

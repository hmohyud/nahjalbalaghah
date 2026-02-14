'use client';
import React, { useState } from 'react';
import { Search, Hash } from 'lucide-react';
import { Input, Select } from '@/app/components/ui';

interface TopFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  displayMode: 'both' | 'english-only' | 'arabic-only';
  setDisplayMode: (value: 'both' | 'english-only' | 'arabic-only') => void;
  onGoToNumber?: (number: number) => void;
  totalItems?: number;
  onSearch?: () => void;
}

export default function TopFilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOptions,
  displayMode,
  setDisplayMode,
  onGoToNumber,
  totalItems,
  onSearch
}: TopFilterBarProps) {
  const [goToValue, setGoToValue] = useState('');

  const displayOptions = [
    { value: 'both', label: 'Both Titles' },
    { value: 'english-only', label: 'English Only' },
    { value: 'arabic-only', label: 'Arabic Only' },
  ];

  const handleGoTo = () => {
    const num = parseInt(goToValue, 10);
    if (num > 0 && onGoToNumber) {
      onGoToNumber(num);
      setGoToValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoTo();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div className="relative bg-white border border-[var(--color-stone)] p-6 mb-8">
      {/* Subtle corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[var(--color-accent)]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-[var(--color-accent)]" />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search orations, topics, or keywords..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <button
            onClick={handleSearchClick}
            className="px-5 py-3 bg-[var(--color-primary)] text-white text-sm tracking-[0.1em] uppercase font-body font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Go to # input */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Hash className="w-5 h-5 text-[var(--color-warm-gray)]" />
            </div>
            <input
              type="number"
              min="1"
              max={totalItems || undefined}
              placeholder="Go to #"
              value={goToValue}
              onChange={(e) => setGoToValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full lg:w-28 pl-10 pr-3 py-3 text-sm font-body
                bg-[var(--color-parchment)] border border-[var(--color-stone)]
                text-[var(--color-charcoal)] placeholder:text-[var(--color-warm-gray)]
                focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20
                transition-all duration-200
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleGoTo}
              disabled={!goToValue || parseInt(goToValue, 10) <= 0}
              className="ml-2 px-4 py-3 bg-[var(--color-primary)] text-white text-sm font-body font-medium
                hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Go
            </button>
          </div>

          {/* Display Mode Select */}
          <Select
            options={displayOptions}
            value={displayMode}
            onChange={(value) => setDisplayMode(value as 'both' | 'english-only' | 'arabic-only')}
            placeholder="Display"
            className="w-full lg:w-40"
          />

          {/* Sort Select */}
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort By"
            className="w-full lg:w-60"
          />
        </div>
      </div>
    </div>
  );
}

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
    <div className="filter-bar">
      {/* Subtle corner accents */}
      <div className="filter-bar__corner-accent--top-left" />
      <div className="filter-bar__corner-accent--bottom-right" />

      <div className="filter-bar__row">
        {/* Search Input */}
        <div className="filter-bar__search-group">
          <div className="filter-bar__search-input-wrap">
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
            className="filter-bar__search-btn"
          >
            <Search className="w-4 h-4" />
            <span className="filter-bar__search-btn-text">Search</span>
          </button>
        </div>

        {/* Controls */}
        <div className="filter-bar__controls">
          {/* Go to # input */}
          <div className="filter-bar__goto-wrap">
            <div className="filter-bar__goto-icon">
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
              className="filter-bar__goto-input"
            />
            <button
              onClick={handleGoTo}
              disabled={!goToValue || parseInt(goToValue, 10) <= 0}
              className="filter-bar__goto-btn"
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
            className="filter-bar__display-select"
          />

          {/* Sort Select */}
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort By"
            className="filter-bar__sort-select"
          />
        </div>
      </div>
    </div>
  );
}

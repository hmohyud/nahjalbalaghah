'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Select } from '@/app/components/ui';
import { postsApi, type Edition } from '@/api/posts';

interface SidebarFilterProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  displayMode: 'both' | 'english-only' | 'arabic-only';
  setDisplayMode: (value: 'both' | 'english-only' | 'arabic-only') => void;
  selectedEdition?: string;
  onEditionChange?: (edition: string) => void;
  // false hides "English Only" (e.g. Arabic-only editions such as Attar)
  englishAvailable?: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function SidebarFilter({
  sortBy,
  setSortBy,
  sortOptions,
  displayMode,
  setDisplayMode,
  selectedEdition = '',
  onEditionChange,
  englishAvailable = true,
  isOpen,
  setIsOpen
}: SidebarFilterProps) {
  const [editions, setEditions] = useState<Edition[]>([]);
  // Fetch editions on component mount
  useEffect(() => {
    if (!onEditionChange) return;
    const fetchEditions = async () => {
      try {
        const response = await postsApi.getEditions();
        setEditions(response.data);
      } catch (error) {
        console.error('Error fetching editions:', error);
      }
    };
    fetchEditions();
  }, []);

  const displayOptions = [
    { value: 'both', label: 'Both Titles' },
    { value: 'english-only', label: 'English Only' },
    { value: 'arabic-only', label: 'Arabic Only' },
  ].filter(opt => englishAvailable || opt.value !== 'english-only');

  const editionOptions = editions.map(ed => ({
    value: ed.title,
    label: ed.title
  }));

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="sidebar-filter__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Hidden by default, shown only when open */}
      <div
        className={`sidebar-filter ${isOpen ? 'sidebar-filter--open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-filter__header">
          <div className="sidebar-filter__header-row">
            <h2 className="sidebar-filter__title">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="sidebar-filter__close"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-filter__body">
          <div className="sidebar-filter__sections">
            {/* Edition Filter */}
            {onEditionChange && editionOptions.length > 0 && (
              <div>
                <label className="sidebar-filter__label">
                  Edition
                </label>
                <Select
                  options={editionOptions}
                  value={selectedEdition}
                  onChange={(value) => {
                    onEditionChange?.(value);
                    setIsOpen(false);
                  }}
                  placeholder="Select edition"
                  className="w-full"
                />
              </div>
            )}

            {/* Display Mode Section */}
            <div>
              <label className="sidebar-filter__label">
                Display Mode
              </label>
              <Select
                options={displayOptions}
                value={displayMode}
                onChange={(value) => setDisplayMode(value as 'both' | 'english-only' | 'arabic-only')}
                placeholder="Select display mode"
                className="w-full"
              />
            </div>

            {/* Sort By Section */}
            <div>
              <label className="sidebar-filter__label">
                Sort By
              </label>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                placeholder="Select sort order"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

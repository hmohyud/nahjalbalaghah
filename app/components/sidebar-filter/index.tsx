'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Select from '@/app/components/select';
import { postsApi, type Edition } from '@/api/posts';

interface SidebarFilterProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOptions: Array<{ value: string; label: string }>;
  displayMode: 'both' | 'english-only' | 'arabic-only';
  setDisplayMode: (value: 'both' | 'english-only' | 'arabic-only') => void;
  selectedEdition?: string;
  onEditionChange?: (edition: string) => void;
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
  ];

  const editionOptions = editions.map(ed => ({
    value: ed.title,
    label: ed.title
  }));

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Hidden by default, shown only when open */}
      <div
        className={`fixed top-0 left-0 z-50 w-80 max-w-[90vw] h-screen bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Edition Filter */}
            {onEditionChange && editionOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
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
              <label className="block text-sm font-semibold text-gray-900 mb-3">
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
              <label className="block text-sm font-semibold text-gray-900 mb-3">
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

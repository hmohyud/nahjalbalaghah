'use client';
import React from 'react';
import { Checkbox } from '@/app/components/ui';

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface FilterOptions {
  type: FilterOption[];
  translations: FilterOption[];
  themes: FilterOption[];
  difficulty: FilterOption[];
  length: FilterOption[];
}

interface ActiveFilters {
  type: string[];
  translations: string[];
  themes: string[];
  difficulty: string[];
  length: string[];
  sortBy: string;
}

interface LeftFilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  activeFilters: ActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveFilters>>;
  activeFilterCount: number;
  filterOptions: FilterOptions;
  handleFilterChange: (
    category: keyof Pick<ActiveFilters, 'type' | 'translations' | 'themes' | 'difficulty' | 'length'>,
    id: string,
    checked: boolean
  ) => void;
  clearAllFilters: () => void;
}

export default function LeftFilterSidebar({
  showFilters,
  setShowFilters,
  activeFilters,
  setActiveFilters,
  activeFilterCount,
  filterOptions,
  handleFilterChange,
  clearAllFilters
}: LeftFilterSidebarProps) {
  return (
    <div className="lg:w-1/4">
      <div className="group relative bg-white border border-[var(--color-stone)] sticky top-28">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />

        {/* Header */}
        <div className="p-6 border-b border-[var(--color-stone)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-[var(--color-ink)]">Filters</h3>
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-[var(--color-primary)] text-sm hover:underline font-body"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Sections */}
        <div className="p-6 space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Content Type */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
              Content Type
            </h4>
            <div className="space-y-3">
              {filterOptions.type.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
                  checked={activeFilters.type.includes(option.id)}
                  onChange={(checked) => handleFilterChange('type', option.id, checked)}
                  label={`${option.label} (${option.count})`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[var(--color-stone)]" />

          {/* Available Translations */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
              Available Translations
            </h4>
            <div className="space-y-3">
              {filterOptions.translations.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
                  checked={activeFilters.translations.includes(option.id)}
                  onChange={(checked) => handleFilterChange('translations', option.id, checked)}
                  label={`${option.label} (${option.count})`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[var(--color-stone)]" />

          {/* Themes */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
              Themes
            </h4>
            <div className="space-y-3">
              {filterOptions.themes.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
                  checked={activeFilters.themes.includes(option.id)}
                  onChange={(checked) => handleFilterChange('themes', option.id, checked)}
                  label={`${option.label} (${option.count})`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[var(--color-stone)]" />

          {/* Difficulty Level */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
              Difficulty Level
            </h4>
            <div className="space-y-3">
              {filterOptions.difficulty.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
                  checked={activeFilters.difficulty.includes(option.id)}
                  onChange={(checked) => handleFilterChange('difficulty', option.id, checked)}
                  label={`${option.label} (${option.count})`}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[var(--color-stone)]" />

          {/* Content Length */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
              Content Length
            </h4>
            <div className="space-y-3">
              {filterOptions.length.map((option) => (
                <Checkbox
                  key={option.id}
                  id={option.id}
                  checked={activeFilters.length.includes(option.id)}
                  onChange={(checked) => handleFilterChange('length', option.id, checked)}
                  label={`${option.label} (${option.count})`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

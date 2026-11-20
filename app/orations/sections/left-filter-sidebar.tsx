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
    <div className="filter-sidebar">
      <div className="group filter-sidebar__card">
        {/* Corner accents */}
        <div className="filter-sidebar__corner-accent--top-left" />
        <div className="filter-sidebar__corner-accent--bottom-right" />

        {/* Header */}
        <div className="filter-sidebar__header">
          <div className="filter-sidebar__header-row">
            <h3 className="filter-sidebar__title">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="filter-sidebar__clear-btn"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Sections */}
        <div className="filter-sidebar__body">
          {/* Content Type */}
          <div>
            <h4 className="filter-sidebar__section-title">
              Content Type
            </h4>
            <div className="filter-sidebar__options">
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
          <div className="filter-sidebar__divider" />

          {/* Available Translations */}
          <div>
            <h4 className="filter-sidebar__section-title">
              Available Translations
            </h4>
            <div className="filter-sidebar__options">
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
          <div className="filter-sidebar__divider" />

          {/* Themes */}
          <div>
            <h4 className="filter-sidebar__section-title">
              Themes
            </h4>
            <div className="filter-sidebar__options">
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
          <div className="filter-sidebar__divider" />

          {/* Difficulty Level */}
          <div>
            <h4 className="filter-sidebar__section-title">
              Difficulty Level
            </h4>
            <div className="filter-sidebar__options">
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
          <div className="filter-sidebar__divider" />

          {/* Content Length */}
          <div>
            <h4 className="filter-sidebar__section-title">
              Content Length
            </h4>
            <div className="filter-sidebar__options">
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

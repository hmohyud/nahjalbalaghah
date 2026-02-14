'use client';
import React from 'react';
import ListingCard from '@/app/components/cards/listing';
import { Pagination } from '@/app/components/content-widgets';
import { type Post } from '@/api/posts';

interface OrationsListingProps {
  orations: Post[];
  onOrationsClick?: (oration: Post) => void;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  total?: number;
  currentPage?: number;
  totalPages?: number;
  title?: string;
  subtitle?: string;
}

export default function OrationsListing({
  orations,
  onOrationsClick,
  onPageChange,
  loading = false,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  title = "Orations",
  subtitle
}: OrationsListingProps) {
  return (
    <div className="lg:w-3/4 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl lg:text-3xl text-[var(--color-ink)]">{title}</h2>
          <p className="text-[var(--color-warm-gray)] mt-2 font-body text-sm">
            {loading ? "Loading..." : (subtitle || `Showing ${orations.length} of ${total} results`)}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="bg-white border border-[var(--color-stone)] overflow-hidden animate-pulse">
              <div className="h-40 bg-[var(--color-stone)]"></div>
              <div className="p-5">
                <div className="h-5 bg-[var(--color-stone)] mb-3"></div>
                <div className="h-4 bg-[var(--color-stone)] mb-2 w-4/5"></div>
                <div className="h-4 bg-[var(--color-stone)] mb-3 w-3/5"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-[var(--color-stone)] w-16"></div>
                  <div className="h-6 bg-[var(--color-stone)] w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orations.map((oration) => (
              <ListingCard
                key={oration.id}
                oration={oration}
                onClick={() => onOrationsClick?.(oration)}
                contentType="orations"
              />
            ))}
          </div>
          
          {totalPages > 1 && onPageChange && (
            <div className="mt-16">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showRange={true}
                loading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

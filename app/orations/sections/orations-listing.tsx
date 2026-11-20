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
    <div className="orations-listing">
      {/* Section Header */}
      <div className="orations-listing__header">
        <div>
          <h2 className="orations-listing__title">{title}</h2>
          <p className="orations-listing__subtitle">
            {loading ? "Loading..." : (subtitle || `Showing ${orations.length} of ${total} results`)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="orations-listing__grid">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="orations-listing__skeleton">
              <div className="orations-listing__skeleton-image"></div>
              <div className="orations-listing__skeleton-body">
                <div className="orations-listing__skeleton-line"></div>
                <div className="orations-listing__skeleton-line orations-listing__skeleton-line--medium"></div>
                <div className="orations-listing__skeleton-line orations-listing__skeleton-line--short"></div>
                <div className="orations-listing__skeleton-tags">
                  <div className="orations-listing__skeleton-tag orations-listing__skeleton-tag--small"></div>
                  <div className="orations-listing__skeleton-tag orations-listing__skeleton-tag--large"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="orations-listing__grid">
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
            <div className="orations-listing__pagination">
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

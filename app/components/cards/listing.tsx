'use client';
import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { type Post } from '@/api/posts';

interface ListingCardProps {
  oration: Post;
  onClick?: () => void;
  contentType: 'orations' | 'letters' | 'sayings';
}

const ListingCard: React.FC<ListingCardProps> = ({
  oration,
  onClick,
  contentType
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Link
      href={`/${contentType}/details/${oration.id}`}
      onClick={onClick}
      className="group block"
    >
      <div className="listing-card relative h-full">
        {/* Corner accents on hover */}
        <div className="corner-accent-hover corner-accent-hover--top-left" />
        <div className="corner-accent-hover corner-accent-hover--bottom-right" />

        {/* Header with number */}
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="listing-card__number-box flex items-center justify-center">
                {oration.sermonNumber || oration.id}
              </div>
              <div className="listing-card__type-label">
                {contentType === 'orations' ? 'Oration' : contentType === 'letters' ? 'Letter' : 'Saying'}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-warm-gray)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-0">
          {/* Heading */}
          {oration.heading && (
            <h3 className="listing-card__heading mb-3 leading-snug">
              {truncateText(oration.heading, 80)}
            </h3>
          )}

          {/* Arabic Preview */}
          {oration.title && (
            <p className="text-right text-base text-[var(--color-charcoal)] font-taha leading-relaxed mb-4 line-clamp-2" dir="rtl">
              {truncateText(oration.title, 100)}
            </p>
          )}

          {/* TocEnglish Preview */}
          {oration.TocEnglish && (
            <p className="text-sm text-[var(--color-warm-gray)] font-body leading-relaxed line-clamp-2">
              {truncateText(oration.TocEnglish, 120)}
            </p>
          )}

          {/* Tags */}
          {oration.tags && oration.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-stone)]">
              {oration.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="listing-card__tag"
                >
                  {tag.name}
                </span>
              ))}
              {oration.tags.length > 3 && (
                <span className="px-2 py-1 text-xs font-body text-[var(--color-warm-gray)]">
                  +{oration.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer indicator */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-0 bg-[var(--color-accent)] group-hover:w-8 transition-all duration-300" />
            <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-body">
              Read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;

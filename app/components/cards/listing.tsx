'use client';
import React from 'react';
import { Book, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type Post } from '@/api/posts';
import { formatTextWithFootnotes, isArabicText } from '@/app/utils/text-formatting';

interface ListingCardProps {
  sermon?: {
    id: number;
    title: string;
    arabicTitle: string;
    description: string;
    chapter: number;
    type: string;
    date: string;
  };
  oration?: Post;
  onClick?: () => void;
  contentType?: 'orations' | 'letters' | 'sayings';
}

export default function ListingCard({ sermon, oration, onClick, contentType = 'orations' }: ListingCardProps) {
  const searchParams = useSearchParams();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCardLink = () => {
    if (oration) {
      const currentPage = searchParams.get('page');
      const baseUrl = `/content/details/${contentType}/${oration.id}`;
      return currentPage ? `${baseUrl}?returnPage=${currentPage}` : baseUrl;
    } else if (sermon) {
      return `/listings/details/${sermon.id}`;
    }
    return '#';
  };

  const isOration = !!oration;
  const data = isOration ? oration : sermon;

  if (!data) return null;

  const tocData = isOration ? (() => {
    const post = oration!;

    return {
      heading: post.heading || '',
      TocEnglish: post.TocEnglish || '',
      TocArabic: post.TocArabic || ''
    };
  })() : null;

  const title = isOration ? oration!.title : sermon!.title;
  const englishTranslation = isOration
    ? oration!.translations?.find((t: any) => t.type === 'en')?.text || ''
    : sermon!.description;

  const displayTitle = isOration ? (tocData?.heading || oration!.heading || englishTranslation || title) : title;
  const displayNumber = isOration ? String(oration!.sermonNumber || '') : '';

  return (
    <Link href={getCardLink()} className="listing-grid-card__link">
      <div className="listing-grid-card group">
        <div className="listing-grid-card__header">
          <div className="listing-grid-card__header-overlay">
            {isOration && displayNumber ? (
              <div className="listing-grid-card__number-wrapper">
                <span className="listing-grid-card__number">
                  {displayNumber}
                </span>
                <div className="listing-grid-card__glow-overlay">
                  <span className="listing-grid-card__number-glow">
                    {displayNumber}
                  </span>
                </div>
              </div>
            ) : (
              <div className="listing-grid-card__icon-wrapper">
                <Book className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="listing-grid-card__gradient-fade"></div>
        </div>
        <div className="listing-grid-card__body">
          <div>
            {isOration && tocData && (tocData.heading || tocData.TocEnglish || tocData.TocArabic) ? (
              <div className="listing-grid-card__toc-section">
                {tocData.heading && (
                  <h4 className="listing-grid-card__toc-heading">
                    {truncateText(tocData.heading, 80)}
                  </h4>
                )}
                {tocData.TocEnglish && (
                  <p className="listing-grid-card__toc-english">
                    {truncateText(tocData.TocEnglish, 120)}
                  </p>
                )}
                {tocData.TocArabic && (
                  <p className="listing-grid-card__toc-arabic" dir="rtl">
                    {truncateText(tocData.TocArabic, 120)}
                  </p>
                )}
              </div>
            ) : (
              <h3 className={`listing-grid-card__title ${typeof displayTitle === 'string' && isArabicText(displayTitle) ? 'font-taha' : ''}`} dir={typeof displayTitle === 'string' && isArabicText(displayTitle) ? 'rtl' : undefined}>
                {typeof displayTitle === 'string'
                  ? formatTextWithFootnotes(truncateText(displayTitle, 120), (oration?.footnotes || []), isArabicText(displayTitle), oration?.sermonNumber || undefined)
                  : truncateText(displayTitle, 120)
                }
              </h3>
            )}
            {isOration && oration!.tags && oration!.tags.length > 0 && (
              <div className="listing-grid-card__tags-row">
                {oration!.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="listing-grid-card__tag"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
                {oration!.tags.length > 3 && (
                  <span className="listing-grid-card__tag-overflow">
                    +{oration!.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

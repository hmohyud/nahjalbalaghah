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
      const baseUrl = `/${contentType}/details/${oration.id}`;
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
    <Link href={getCardLink()} className="block h-full">
      <div className="listing-grid-card group h-full flex flex-col">
        <div className="listing-grid-card__header relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-start pl-6">
            {isOration && displayNumber ? (
              <div className="relative">
                <span className="listing-grid-card__number select-none">
                  {displayNumber}
                </span>
                <div className="absolute inset-0 flex items-center justify-start">
                  <span className="text-7xl font-black text-white/20 blur-sm group-hover:text-white/30 transition-all duration-300">
                    {displayNumber}
                  </span>
                </div>
              </div>
            ) : (
              <div className="listing-grid-card__icon-wrapper flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            {isOration && tocData && (tocData.heading || tocData.TocEnglish || tocData.TocArabic) ? (
              <div className="space-y-2">
                {tocData.heading && (
                  <h4 className="text-xs font-semibold text-[#43896B] line-clamp-1">
                    {truncateText(tocData.heading, 80)}
                  </h4>
                )}
                {tocData.TocEnglish && (
                  <p className="text-sm text-gray-700 line-clamp-2 font-brill leading-snug">
                    {truncateText(tocData.TocEnglish, 120)}
                  </p>
                )}
                {tocData.TocArabic && (
                  <p className="text-sm font-taha text-gray-800 line-clamp-2 leading-snug" dir="rtl">
                    {truncateText(tocData.TocArabic, 120)}
                  </p>
                )}
              </div>
            ) : (
              <h3 className={`font-medium text-gray-900 text-base line-clamp-3 group-hover:text-[#43896B] transition-colors mb-3 leading-relaxed ${typeof displayTitle === 'string' && isArabicText(displayTitle) ? 'font-taha' : ''}`}>
                {typeof displayTitle === 'string' 
                  ? formatTextWithFootnotes(truncateText(displayTitle, 120), (oration?.footnotes || []), isArabicText(displayTitle), oration?.sermonNumber || undefined)
                  : truncateText(displayTitle, 120)
                }
              </h3>
            )}
            {isOration && oration!.tags && oration!.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
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
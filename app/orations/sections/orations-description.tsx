import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { type Post } from '@/api/posts';
import { formatTextWithFootnotes, isArabicText } from '@/app/utils/text-formatting';

interface OrationsDescriptionProps {
  oration: Post;
}

const OrationsDescription = ({ oration }: OrationsDescriptionProps) => {
  const heading = oration.heading;
  
  const sortedParagraphs = [...oration.paragraphs].sort((a, b) => {
    const parseNumber = (num: string) => {
      return num.split('.').map(n => parseInt(n, 10));
    };
    
    const aNumbers = parseNumber(a.number);
    const bNumbers = parseNumber(b.number);
    
    for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
      const aNum = aNumbers[i] || 0;
      const bNum = bNumbers[i] || 0;
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }
    return 0;
  });

  const mainTranslation = oration.translations?.find(t => t.type === 'en');

  return (
    <div className="relative bg-white border border-[var(--color-stone)]">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

      <div className="p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-10 pb-8 border-b border-[var(--color-stone)]">
          <h1 className="font-display text-3xl lg:text-4xl text-[var(--color-ink)] mb-6 leading-relaxed">
            {heading || 'Oration Details'}
          </h1>

          {oration.tags && oration.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {oration.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase font-body
                    bg-[var(--color-primary)]/10 text-[var(--color-primary)] 
                    border border-[var(--color-primary)]/20 
                    hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Main Title and Translation */}
        {(oration.title || mainTranslation) && (
          <div className="mb-10">
            {/* Arabic Title Block */}
            <div className="relative bg-[var(--color-parchment)] p-6 lg:p-8 mb-6 border-r-4 border-[var(--color-primary)]">
              <div className="text-right">
                <p className="text-xl lg:text-2xl leading-[2] text-[var(--color-ink)] font-taha">
                  {formatTextWithFootnotes(oration.title, oration.footnotes || [], true, 'main')}
                </p>
              </div>
            </div>
            
            {/* English Translation Block */}
            {mainTranslation && (
              <div className="bg-white border border-[var(--color-stone)] p-6 lg:p-8">
                <p className="text-lg leading-relaxed text-[var(--color-charcoal)] font-body whitespace-pre-wrap">
                  {formatTextWithFootnotes(mainTranslation.text, oration.footnotes || [], false, 'main')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Decorative Divider */}
        {sortedParagraphs.length > 0 && (oration.title || mainTranslation) && (
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-stone)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-stone)]" />
          </div>
        )}

        {/* Paragraphs */}
        {sortedParagraphs.length > 0 && (
          <div className="space-y-10">
            {sortedParagraphs.map((paragraph) => {
              const englishTranslation = paragraph.translations?.find(t => t.type === 'en')?.text;
              
              return (
                <div key={paragraph.id} className="group">
                  {/* Paragraph Number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--color-primary)] text-white flex items-center justify-center font-body text-sm">
                      {paragraph.number}
                    </div>
                    <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                  </div>
                  
                  {/* Arabic Text */}
                  <div className="mb-6">
                    <div className="text-right leading-[2] text-xl lg:text-2xl text-[var(--color-ink)] font-taha" dir="rtl">
                      {formatTextWithFootnotes(paragraph.arabic, [...(oration.footnotes || []), ...(paragraph.footnotes || [])], true, paragraph.number)}
                    </div>
                  </div>
                  
                  {/* English Translation */}
                  {englishTranslation && (
                    <div className="bg-[var(--color-cream)] border-l-4 border-[var(--color-accent)] p-6">
                      <div className="leading-relaxed text-[var(--color-charcoal)] font-body whitespace-pre-wrap">
                        {formatTextWithFootnotes(englishTranslation, [...(oration.footnotes || []), ...(paragraph.footnotes || [])], false, paragraph.number)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {sortedParagraphs.length === 0 && !(oration.title || mainTranslation) && (
          <div className="text-center py-16">
            <p className="text-[var(--color-warm-gray)] font-body">No content available for this oration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrationsDescription;

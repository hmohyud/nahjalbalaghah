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
    <div className="orations-desc">
      {/* Corner accents */}
      <div className="orations-desc__corner-accent--top-left" />
      <div className="orations-desc__corner-accent--bottom-right" />

      <div className="orations-desc__body">
        {/* Header Section */}
        <div className="orations-desc__header">
          <h1 className="orations-desc__title">
            {heading || 'Oration Details'}
          </h1>

          {oration.tags && oration.tags.length > 0 && (
            <div className="orations-desc__tags">
              {oration.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="orations-desc__tag"
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
          <div className="orations-desc__main-content">
            {/* Arabic Title Block */}
            <div className="orations-desc__arabic-block">
              <div className="orations-desc__arabic-block-inner">
                <p className="orations-desc__arabic-text">
                  {formatTextWithFootnotes(oration.title, oration.footnotes || [], true, 'main')}
                </p>
              </div>
            </div>

            {/* English Translation Block */}
            {mainTranslation && (
              <div className="orations-desc__english-block">
                <p className="orations-desc__english-text">
                  {formatTextWithFootnotes(mainTranslation.text, oration.footnotes || [], false, 'main')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Decorative Divider */}
        {sortedParagraphs.length > 0 && (oration.title || mainTranslation) && (
          <div className="orations-desc__divider">
            <div className="orations-desc__divider-line" />
            <div className="orations-desc__divider-diamond" />
            <div className="orations-desc__divider-line orations-desc__divider-line--reverse" />
          </div>
        )}

        {/* Paragraphs */}
        {sortedParagraphs.length > 0 && (
          <div className="orations-desc__paragraphs">
            {sortedParagraphs.map((paragraph) => {
              const englishTranslation = paragraph.translations?.find(t => t.type === 'en')?.text;

              return (
                <div key={paragraph.id} className="group">
                  {/* Paragraph Number */}
                  <div className="orations-desc__paragraph-header">
                    <div className="orations-desc__paragraph-number">
                      {paragraph.number}
                    </div>
                    <div className="orations-desc__paragraph-line" />
                  </div>

                  {/* Arabic Text */}
                  <div className="orations-desc__paragraph-arabic">
                    <div className="orations-desc__paragraph-arabic-text" dir="rtl">
                      {formatTextWithFootnotes(paragraph.arabic, [...(oration.footnotes || []), ...(paragraph.footnotes || [])], true, paragraph.number)}
                    </div>
                  </div>

                  {/* English Translation */}
                  {englishTranslation && (
                    <div className="orations-desc__paragraph-english">
                      <div className="orations-desc__paragraph-english-text">
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
          <div className="orations-desc__empty">
            <p className="orations-desc__empty-text">No content available for this oration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrationsDescription;

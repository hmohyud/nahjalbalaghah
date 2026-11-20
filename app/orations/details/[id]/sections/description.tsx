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
    <div className="oration-detail">
      <div className="oration-detail__header">
        <h1 className="oration-detail__title">
          {heading || 'Oration Details'}
        </h1>

        {oration.tags && oration.tags.length > 0 && (
          <div className="oration-detail__tags-section">
            <div className="oration-detail__tags-row">
              {oration.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="oration-detail__tag"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Title and Translation as First Paragraph */}
      {(oration.title || mainTranslation) && (
        <div className="oration-detail__main-section">
          <div className="oration-detail__section-divider">
            <div className="oration-detail__arabic-block">
              <div className="oration-detail__arabic-block-inner">
                <p className="oration-detail__arabic-text">
                  {formatTextWithFootnotes(oration.title, oration.footnotes || [], true, 'main')}
                </p>
              </div>
            </div>

            {mainTranslation && (
              <div className="oration-detail__english-block">
                <p className="oration-detail__english-text">
                  {formatTextWithFootnotes(mainTranslation.text, oration.footnotes || [], false, 'main')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {sortedParagraphs.length > 0 && (
        <div className="oration-detail__paragraphs">
          {sortedParagraphs.map((paragraph) => {
            const englishTranslation = paragraph.translations?.find(t => t.type === 'en')?.text;

            return (
              <div key={paragraph.id} className="oration-detail__paragraph">
                <div className="oration-detail__paragraph-header">
                  <span className="oration-detail__paragraph-number">
                    {paragraph.number}
                  </span>
                </div>

                <div className="oration-detail__paragraph-arabic" dir="rtl">
                  {formatTextWithFootnotes(paragraph.arabic, [...(oration.footnotes || []), ...(paragraph.footnotes || [])], true, paragraph.number)}
                </div>

                {englishTranslation && (
                  <div className="oration-detail__paragraph-english-block">
                    <div className="oration-detail__paragraph-english-text">
                      {formatTextWithFootnotes(englishTranslation, [...(oration.footnotes || []), ...(paragraph.footnotes || [])], false, paragraph.number)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sortedParagraphs.length === 0 && !(oration.title || mainTranslation) && (
        <div className="oration-detail__empty">
          <p className="oration-detail__empty-text">No content available for this oration.</p>
        </div>
      )}
    </div>
  );
};

export default OrationsDescription;

'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { manuscriptCatalogApi, getManuscriptOpenings, type ManuscriptCatalogEntry, type ManuscriptOpening } from '@/api/manuscripts';

const Field = ({ label, value, arabic = false, wide = false }: { label: string; value?: string; arabic?: boolean; wide?: boolean }) =>
  value && value !== 'n/a' ? (
    <div className={wide ? 'ms-info__field ms-info__field--wide' : 'ms-info__field'}>
      <dt className="ms-info__field-label">{label}</dt>
      <dd className={arabic ? 'ms-info__field-value ms-info__field-value--arabic' : 'ms-info__field-value'} dir={arabic ? 'rtl' : undefined}>{value}</dd>
    </div>
  ) : null;

/**
 * Each manuscript's catalogue record. On /manuscripts/information it is the whole page; on
 * /manuscripts it sits inside the collection's "Manuscript information" section (embedded).
 */
export default function ManuscriptInformation({ embedded = false }: { embedded?: boolean }) {
  const [entries, setEntries] = useState<ManuscriptCatalogEntry[] | null>(null);
  const [openings, setOpenings] = useState<Map<string, ManuscriptOpening | null> | null>(null);
  const [openingsFailed, setOpeningsFailed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    manuscriptCatalogApi.getCatalog()
      .then(catalog => {
        setEntries(catalog);
        // Where each manuscript's pages start (some lack Oration 1; some aren't digitized yet).
        // Kept separate so a failure here never hides the catalogue itself.
        getManuscriptOpenings(catalog)
          .then(setOpenings)
          .catch(err => { console.error(err); setOpeningsFailed(true); });
      })
      .catch((err) => { console.error(err); setError(true); });
  }, []);

  // The page has its own section and margins; embedded, the surrounding section provides them
  const frame = (content: React.ReactNode, centered = false) => (embedded ? (
    <div className={centered ? 'ms-info__embedded ms-info__embedded--centered' : 'ms-info__embedded'}>{content}</div>
  ) : (
    <section className="ms-info">
      <div className={centered ? 'ms-info__inner ms-info__inner--centered' : 'ms-info__inner'}>{content}</div>
    </section>
  ));
  // Embedded, the cards sit under the section's own h3
  const CardTitle = embedded ? 'h4' : 'h2';

  if (error) {
    return frame(<p className="ms-info__error">Failed to load manuscript information. Please try again later.</p>);
  }

  if (!entries) {
    return frame(<Loader2 className="w-10 h-10 ms-info__spinner" />, true);
  }

  const manuscripts = entries.map(entry => ({
    id: entry.id,
    name: entry.name,
    siglaEnglish: entry.siglaEnglish,
    siglaArabic: entry.siglaArabic,
    library: entry.holdingLibrary,
    city: entry.city,
    country: entry.country,
    date: entry.date,
    catalogNumber: entry.details.catalogNumber,
    scribe: entry.details.scribe,
    dimensions: entry.details.dimensions,
    completeness: entry.details.completeness,
    features: entry.details.features,
  }));

  return frame(
    <div className="ms-info__grid">
      {manuscripts.map((ms) => (
        <article key={ms.id} className="ms-info__card">
          <div className="ms-info__card-corner ms-info__card-corner--tl" />
          <div className="ms-info__card-corner ms-info__card-corner--br" />
          <div className="ms-info__card-header">
            <CardTitle className="ms-info__card-title">{ms.name}</CardTitle>
            {(ms.siglaEnglish || ms.siglaArabic) && (
              <span className="ms-info__sigla">
                {ms.siglaEnglish}
                {ms.siglaEnglish && ms.siglaArabic && ' / '}
                {ms.siglaArabic && <span className="ms-info__sigla-arabic" dir="rtl">{ms.siglaArabic}</span>}
              </span>
            )}
          </div>
          <dl className="ms-info__fields">
            <Field label="Library" value={ms.library} />
            <Field label="Location" value={[ms.city, ms.country].filter(Boolean).join(', ')} />
            <Field label="Date (Hijri/Gregorian)" value={ms.date} />
            <Field label="Catalog no." value={ms.catalogNumber} />
            <Field label="Scribe" value={ms.scribe} />
            <Field label="Dimensions" value={ms.dimensions} />
            <Field label="Completeness" value={ms.completeness} wide />
            <Field label="Features" value={ms.features} wide />
          </dl>
          {!openings && !openingsFailed ? (
            <p className="ms-info__not-digitized">Finding pages…</p>
          ) : openings?.get(ms.id) === null ? (
            <p className="ms-info__not-digitized">Not yet digitized here</p>
          ) : (
            <Link
              href={`/manuscripts/view?section=${openings?.get(ms.id)?.section ?? '1.1'}&ms=${ms.id}`}
              className="ms-info__link"
            >
              <BookOpen className="w-4 h-4" />
              View manuscript
              <ArrowRight className="w-4 h-4 ms-info__link-arrow" />
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}

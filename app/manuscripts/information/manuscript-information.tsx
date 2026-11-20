'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { manuscriptCatalogApi, type ManuscriptCatalogEntry } from '@/api/manuscripts';

const Field = ({ label, value, arabic = false, wide = false }: { label: string; value?: string; arabic?: boolean; wide?: boolean }) =>
  value && value !== 'n/a' ? (
    <div className={wide ? 'ms-info__field ms-info__field--wide' : 'ms-info__field'}>
      <dt className="ms-info__field-label">{label}</dt>
      <dd className={arabic ? 'ms-info__field-value ms-info__field-value--arabic' : 'ms-info__field-value'} dir={arabic ? 'rtl' : undefined}>{value}</dd>
    </div>
  ) : null;

export default function ManuscriptInformation() {
  const [entries, setEntries] = useState<ManuscriptCatalogEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    manuscriptCatalogApi.getCatalog()
      .then(setEntries)
      .catch((err) => { console.error(err); setError(true); });
  }, []);

  if (error) {
    return (
      <section className="ms-info">
        <div className="ms-info__inner">
          <p className="ms-info__error">Failed to load manuscript information. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!entries) {
    return (
      <section className="ms-info">
        <div className="ms-info__inner ms-info__inner--centered">
          <Loader2 className="w-10 h-10 ms-info__spinner" />
        </div>
      </section>
    );
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

  return (
    <section className="ms-info">
      <div className="ms-info__inner">
        <div className="ms-info__grid">
          {manuscripts.map((ms) => (
            <article key={ms.id} className="ms-info__card">
              <div className="ms-info__card-corner ms-info__card-corner--tl" />
              <div className="ms-info__card-corner ms-info__card-corner--br" />
              <div className="ms-info__card-header">
                <h2 className="ms-info__card-title">{ms.name}</h2>
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
              <Link
                href={`/manuscripts/view?section=1.1&ms=${ms.id}`}
                className="ms-info__link"
              >
                <BookOpen className="w-4 h-4" />
                View manuscript
                <ArrowRight className="w-4 h-4 ms-info__link-arrow" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

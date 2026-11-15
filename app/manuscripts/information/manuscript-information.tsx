'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen } from 'lucide-react';
import { librariesApi, convertLibraryItemToManuscriptDetails, type Library } from '@/api/manuscripts';

type Details = ReturnType<typeof convertLibraryItemToManuscriptDetails>;

const Field = ({ label, value, arabic = false }: { label: string; value?: string; arabic?: boolean }) =>
  value && value !== 'n/a' ? (
    <div>
      <dt className="font-semibold text-gray-800 mb-0.5">{label}</dt>
      <dd className={arabic ? 'font-taha text-gray-600' : 'text-gray-600'} dir={arabic ? 'rtl' : undefined}>{value}</dd>
    </div>
  ) : null;

export default function ManuscriptInformation() {
  const [libraries, setLibraries] = useState<Library[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    librariesApi.getAllLibraries(1, 100)
      .then(res => setLibraries(res.data || []))
      .catch((err) => { console.error(err); setError(true); });
  }, []);

  if (error) {
    return <p className="text-center text-red-600 py-16">Failed to load manuscript information. Please try again later.</p>;
  }

  if (!libraries) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-[#43896B] animate-spin" />
      </div>
    );
  }

  const manuscripts: Details[] = libraries.map(lib => convertLibraryItemToManuscriptDetails(lib));

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {manuscripts.map((ms) => (
          <article key={ms.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900">{ms.name}</h2>
              {(ms.siglaEnglish || ms.siglaArabic) && (
                <span className="flex-shrink-0 px-3 py-1 bg-[#43896B]/10 text-[#43896B] rounded-full text-xs font-semibold">
                  {ms.siglaEnglish}
                  {ms.siglaEnglish && ms.siglaArabic && ' / '}
                  {ms.siglaArabic && <span className="font-taha" dir="rtl">{ms.siglaArabic}</span>}
                </span>
              )}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
              <Field label="Library" value={ms.library} />
              <Field label="Location" value={[ms.city, ms.country].filter(Boolean).join(', ')} />
              <Field label="Date (Hijri/Gregorian)" value={ms.date} />
              <Field label="Catalog no." value={ms.catalogNumber} />
              <Field label="Scribe" value={ms.scribe} />
              <Field label="Dimensions" value={ms.dimensions} />
              <div className="sm:col-span-2"><Field label="Completeness" value={ms.completeness} /></div>
              <div className="sm:col-span-2"><Field label="Features" value={ms.features} /></div>
            </dl>
            <Link
              href={`/manuscripts/view?mode=single&library=${ms.id}`}
              className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#43896B] hover:text-[#367556]"
            >
              <BookOpen className="w-4 h-4" />
              View manuscript
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

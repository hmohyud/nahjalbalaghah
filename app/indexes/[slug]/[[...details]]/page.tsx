'use client';

import React, { Suspense } from 'react';
import { useParams, notFound } from 'next/navigation';
import NamesPlacesContent from '@/app/components/indexes/NamesPlacesContent';
import IndexTermsContent from '@/app/components/indexes/IndexTermsContent';
import QuranHadithContent from '@/app/components/indexes/QuranHadithContent';
import ReligiousConceptsContent from '@/app/components/indexes/ReligiousConceptsContent';
import GlossaryContent from '@/app/components/indexes/GlossaryContent';
import IndexDetailDispatcher from '@/app/components/indexes/index-detail-dispatcher';

const VALID_SLUGS = ['names-places', 'terms', 'quran-hadith', 'religious-concepts', 'glossary'];

const listingComponents: Record<string, React.FC> = {
  'names-places': NamesPlacesContent,
  'terms': IndexTermsContent,
  'quran-hadith': QuranHadithContent,
  'religious-concepts': ReligiousConceptsContent,
  'glossary': GlossaryContent,
};

function IndexLoadingFallback() {
  return (
    <div className="index-loading">
      <div className="index-loading__inner">
        <div className="index-loading__spinner"></div>
        <p className="index-loading__text">Loading index...</p>
      </div>
    </div>
  );
}

export default function IndexSlugPage() {
  const params = useParams();
  let slug = params.slug as string;
  let details = params.details as string[] | undefined;

  // Legacy /indexes/details/<slug>/<term> URLs: shift past the 'details' segment
  if (slug === 'details' && details && details.length > 0) {
    slug = details[0];
    details = details.slice(1);
  }

  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  // No details means listing page
  if (!details || details.length === 0) {
    const ListingComponent = listingComponents[slug];
    if (!ListingComponent) {
      notFound();
    }
    return (
      <Suspense fallback={<IndexLoadingFallback />}>
        <ListingComponent />
      </Suspense>
    );
  }

  // Has details means detail/dispatcher page
  return (
    <Suspense fallback={<IndexLoadingFallback />}>
      <IndexDetailDispatcher />
    </Suspense>
  );
}

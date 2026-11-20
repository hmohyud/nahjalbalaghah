'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  manuscriptCatalogApi,
  groupSectionRecords,
  toPageImage,
  type ManuscriptCatalogEntry,
} from '@/api/manuscripts';

type CollectionItem = {
  entry: ManuscriptCatalogEntry;
  cover: string | null;
  /** Section the card opens; null when no pages have been digitized yet */
  section: string | null;
};

const OPENING_SECTION = '1.1';

/** The manuscripts, each with the first page of Oration 1 (or of its first digitized section). */
export default function ManuscriptCollection() {
  const [items, setItems] = useState<CollectionItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalog, records] = await Promise.all([
          manuscriptCatalogApi.getCatalog(),
          manuscriptCatalogApi.getSectionRecords(OPENING_SECTION),
        ]);
        const opening = new Map(groupSectionRecords(records, catalog).map(item => [item.entry.id, item]));
        const others = catalog.filter(entry => !opening.has(entry.id));
        const samples = await Promise.all(
          others.map(entry => manuscriptCatalogApi.getSampleRecord(entry.id).catch(() => null))
        );
        const sampleById = new Map(others.map((entry, i) => [entry.id, samples[i]]));

        const result = catalog.map<CollectionItem>(entry => {
          const atOpening = opening.get(entry.id);
          if (atOpening?.pages[0]) {
            return { entry, cover: atOpening.pages[0].preview, section: OPENING_SECTION };
          }
          const sample = sampleById.get(entry.id);
          if (sample?.files?.length) {
            return { entry, cover: toPageImage(sample.files[0]).preview, section: (sample.section || OPENING_SECTION).trim() };
          }
          return { entry, cover: null, section: null };
        });
        if (!cancelled) setItems(result);
      } catch (err) {
        console.error('Error loading the manuscript collection:', err);
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <p className="ms-hub-collection__status">The collection couldn’t be loaded. Please try again later.</p>;
  }

  if (!items) {
    return (
      <div className="ms-hub-collection__grid" aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="ms-col-card ms-col-card--skeleton">
            <span className="ms-col-card__cover" />
            <span className="ms-col-card__body"><Loader2 className="mss-spin" /></span>
          </div>
        ))}
      </div>
    );
  }

  const digitized = items.filter(item => item.section);
  const catalogued = items.filter(item => !item.section);

  return (
    <>
      <div className="ms-hub-collection__grid">
        {digitized.map(({ entry, cover, section }) => {
          const facts = [entry.date, [entry.city, entry.country].filter(Boolean).join(', ')].filter(Boolean);
          return (
            <Link
              key={entry.id}
              href={`/manuscripts/view?section=${section}&ms=${entry.id}`}
              className="ms-col-card group"
            >
              <span className="ms-col-card__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover && <img src={cover} alt={`First page of ${entry.name}`} loading="lazy" />}
              </span>
              <span className="ms-col-card__body">
                <span className="ms-col-card__title">
                  {entry.name}
                  {entry.siglaArabic && <span className="ms-col-card__sigla" lang="ar">{entry.siglaArabic}</span>}
                </span>
                {facts.length > 0 ? (
                  facts.map(fact => <span key={fact} className="ms-col-card__fact">{fact}</span>)
                ) : (
                  <span className="ms-col-card__fact ms-col-card__fact--muted">Catalogue details to come</span>
                )}
                <span className="ms-col-card__cta">
                  View pages <ArrowRight />
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {catalogued.length > 0 && (
        <div className="ms-hub-collection__also">
          <p className="ms-hub-collection__also-label">Also catalogued, not yet digitized here</p>
          <ul className="ms-hub-collection__also-list">
            {catalogued.map(({ entry }) => <li key={entry.id}>{entry.name}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}

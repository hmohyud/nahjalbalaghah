'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  manuscriptCatalogApi,
  getManuscriptOpenings,
  type ManuscriptCatalogEntry,
  type ManuscriptOpening,
} from '@/api/manuscripts';

type CollectionItem = {
  entry: ManuscriptCatalogEntry;
  opening: ManuscriptOpening | null;
};

/** The manuscripts, each with the first page of Oration 1 (or of its first digitized section). */
export default function ManuscriptCollection() {
  const [items, setItems] = useState<CollectionItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await manuscriptCatalogApi.getCatalog();
        const openings = await getManuscriptOpenings(catalog);
        if (!cancelled) {
          setItems(catalog.map(entry => ({
            entry,
            // A manuscript whose lookup failed is still offered (from Oration 1) rather than hidden
            opening: openings.has(entry.id) ? openings.get(entry.id) ?? null : { section: '1.1', cover: null },
          })));
        }
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

  const digitized = items.filter(item => item.opening);
  const catalogued = items.filter(item => !item.opening);

  return (
    <>
      <div className="ms-hub-collection__grid">
        {digitized.map(({ entry, opening }) => {
          const facts = [entry.date, [entry.city, entry.country].filter(Boolean).join(', ')].filter(Boolean);
          return (
            <Link
              key={entry.id}
              href={`/manuscripts/view?section=${opening!.section}&ms=${entry.id}`}
              className="ms-col-card group"
            >
              <span className="ms-col-card__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {opening!.cover && <img src={opening!.cover.preview} alt={`First page of ${entry.name}`} loading="lazy" />}
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

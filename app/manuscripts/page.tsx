import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import ManuscriptCollection from './sections/collection';

export const metadata: Metadata = {
  title: "Historical Manuscripts",
  description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world. Discover the rich history and preservation of this timeless text.",
  openGraph: {
    title: "Historical Manuscripts | Nahj al-Balaghah",
    description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world.",
    url: "https://nahj-al-balagha.com/manuscripts",
  }
};

const ways = [
  {
    key: 'single',
    title: 'Read a manuscript',
    description: 'Turn the pages of one manuscript, section by section, and zoom into the script.',
    href: '/manuscripts/view?section=1.1',
    action: 'Open the viewer',
  },
  {
    key: 'edition',
    title: 'Read with the edition',
    description: 'Set a manuscript page beside the critical edition text it was established from.',
    href: '/manuscripts/view?section=1.1&mode=edition',
    action: 'Read with the edition',
  },
  {
    key: 'compare',
    title: 'Compare manuscripts',
    description: 'Place two or three manuscripts side by side, and compare their pages and catalogue details.',
    href: '/manuscripts/view?section=1.1&mode=compare',
    action: 'Compare manuscripts',
  },
] as const;

/** Small page diagrams for the three ways of studying */
const WayIllustration = ({ kind }: { kind: typeof ways[number]['key'] }) => (
  <span className={`ms-hub-way__art ms-hub-way__art--${kind}`} aria-hidden="true">
    <span className="ms-hub-way__page"><i /><i /><i /><i /><i /></span>
    {kind === 'edition' && <span className="ms-hub-way__text"><i /><i /><i /><i /></span>}
    {kind === 'compare' && <span className="ms-hub-way__page"><i /><i /><i /><i /><i /></span>}
  </span>
);

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ManuscriptsPage({ searchParams }: { searchParams: SearchParams }) {
  // Older links (/manuscripts?section=1.5, ?id=...) open the viewer directly
  const params = await searchParams;
  if (params.section || params.id || params.mode || params.library) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') query.set(key, value);
    }
    redirect(`/manuscripts/view?${query.toString()}`);
  }

  return (
    <div className="ms-hub">
      <section className="ms-hub-hero">
        <div className="ms-hub-hero__inner">
          <p className="ms-hub-hero__eyebrow">Manuscripts</p>
          <h1 className="ms-hub-hero__title">The manuscript tradition</h1>
          <div className="ms-hub-hero__ornament" aria-hidden="true">
            <span /><i /><span />
          </div>
          <p className="ms-hub-hero__lead">
            High-resolution images of the earliest manuscripts of <em>Nahj al-Balāghah</em>, held in
            libraries across India, Iran, Iraq, Turkey and Ireland. Turn their pages, set them side by
            side, and read them against the critical edition.
          </p>
        </div>
      </section>

      <section className="ms-hub-ways" aria-label="Ways to study the manuscripts">
        <div className="ms-hub__container ms-hub-ways__grid">
          {ways.map(way => (
            <Link key={way.key} href={way.href} className="ms-hub-way group">
              <WayIllustration kind={way.key} />
              <span className="ms-hub-way__title">{way.title}</span>
              <span className="ms-hub-way__desc">{way.description}</span>
              <span className="ms-hub-way__action">
                {way.action} <ArrowRight />
              </span>
              <span className="corner-accent-hover corner-accent-hover--top-left" />
              <span className="corner-accent-hover corner-accent-hover--bottom-right" />
            </Link>
          ))}
        </div>
      </section>

      <section className="ms-hub-collection" aria-labelledby="ms-collection-heading">
        <div className="ms-hub__container">
          <div className="ms-hub-collection__head">
            <div>
              <h2 id="ms-collection-heading" className="ms-hub-collection__title">The collection</h2>
              <p className="ms-hub-collection__lead">Each manuscript, shown at the opening of Oration 1. Select one to read it.</p>
            </div>
            <Link href="/manuscripts/information" className="ms-hub-collection__more">
              Catalogue details <ArrowRight />
            </Link>
          </div>
          <ManuscriptCollection />
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Info, BookOpen, GitCompare, BookCopy, ArrowRight } from 'lucide-react';
import ManuscriptsHero from './sections/hero';

export const metadata: Metadata = {
  title: "Historical Manuscripts",
  description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world. Discover the rich history and preservation of this timeless text.",
  openGraph: {
    title: "Historical Manuscripts | Nahj al-Balaghah",
    description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world.",
    url: "https://nahj-al-balagha.com/manuscripts",
  }
};

const cards = [
  {
    icon: Info,
    title: 'Manuscript Information',
    description: 'Details of each manuscript: holding library, date, sigla, catalogue number, scribe and completeness.',
    href: '/manuscripts/information',
    buttonText: 'View Information',
  },
  {
    icon: BookOpen,
    title: 'View Full Manuscript',
    description: 'Browse the pages of a single manuscript, section by section, with zoom and full-screen viewing.',
    href: '/manuscripts/view?mode=single',
    buttonText: 'Open Viewer',
  },
  {
    icon: GitCompare,
    title: 'Compare Multiple Manuscripts',
    description: 'Place two or three manuscripts side by side to compare the same oration, letter or saying.',
    href: '/manuscripts/view?mode=comparison',
    buttonText: 'Compare Manuscripts',
  },
  {
    icon: BookCopy,
    title: 'Compare Critical Edition with Manuscripts',
    description: 'Read the critical edition text next to the manuscript pages it was established from.',
    href: '/manuscripts/view?mode=reading',
    buttonText: 'Compare with Edition',
  },
];

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
    <>
      <ManuscriptsHero />
      <section className="manuscripts-hub">
        <div className="manuscripts-hub__inner">
          <p className="manuscripts-hub__intro">
            Explore rare manuscripts of Nahj al-Balaghah from renowned libraries across the world.
          </p>
          <div className="manuscripts-hub__grid">
            {cards.map((card) => (
              <Link key={card.title} href={card.href} className="manuscripts-hub__card-link">
                <div className="manuscripts-hub__card">
                  <div className="manuscripts-hub__card-icon-box">
                    <card.icon className="w-6 h-6" style={{ color: 'white' }} />
                  </div>
                  <h2 className="manuscripts-hub__card-title">{card.title}</h2>
                  <p className="manuscripts-hub__card-desc">{card.description}</p>
                  <span className="manuscripts-hub__card-action">
                    <span className="manuscripts-hub__card-action-line" />
                    {card.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <div className="manuscripts-hub__card-corner manuscripts-hub__card-corner--tl" />
                  <div className="manuscripts-hub__card-corner manuscripts-hub__card-corner--br" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

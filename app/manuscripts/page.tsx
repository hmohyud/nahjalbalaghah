import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Info, BookOpen, GitCompare, BookCopy, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Historical Manuscripts | Nahj al-Balaghah",
  description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world. Discover the rich history and preservation of this timeless text.",
  openGraph: {
    title: "Historical Manuscripts | Nahj al-Balaghah",
    description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world.",
    url: "https://nahj-al-balagha.com/manuscripts",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Historical Manuscripts | Nahj al-Balaghah",
    description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world.",
    images: [
      {
        url: "/globe.svg",
        alt: "Nahj al-Balaghah Logo"
      }
    ]
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
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#43896B]/10 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            Historical Manuscripts
          </h1>
          <div className="h-1 bg-[#43896B] rounded-full w-24 mx-auto mt-6 mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Explore rare manuscripts of Nahj al-Balaghah from renowned libraries across the world.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#43896B]/30 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#43896B]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="w-6 h-6 text-[#43896B]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900 text-lg mb-2">{card.title}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{card.description}</p>
                  </div>
                </div>
                <span className="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-[#43896B] text-[#43896B] text-sm font-semibold group-hover:bg-[#43896B] group-hover:text-white transition-colors duration-300">
                  {card.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

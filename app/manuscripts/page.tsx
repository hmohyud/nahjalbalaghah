import React, { Suspense } from 'react';
import ManuscriptsHero from './sections/hero';
import ManuscriptsContent from './sections/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Historical Manuscripts | Nahj al-Balaghah",
  description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world. Discover the rich history and preservation of this timeless text.",
  openGraph: {
    title: "Historical Manuscripts | Nahj al-Balaghah",
    description: "Explore rare and ancient manuscripts of Nahj al-Balagha from renowned libraries across the Islamic world.",
    url: "https://nahj-al-balagha.com/manuscripts",
  }
};

export default function ManuscriptsPage() {
  return (
    <>
      <ManuscriptsHero />
      <Suspense fallback={
        <div className="min-h-[400px] bg-[var(--color-parchment)] flex items-center justify-center">
          <div className="text-[var(--color-warm-gray)] font-body">Loading manuscripts...</div>
        </div>
      }>
        <ManuscriptsContent />
      </Suspense>
    </>
  );
}

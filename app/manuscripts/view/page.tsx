import React, { Suspense } from 'react';
import ManuscriptsHero from '../sections/hero';
import ManuscriptsContent from '../sections/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Manuscript Viewer",
  description: "View, compare and read manuscripts of Nahj al-Balaghah alongside the critical edition.",
};

export default function ManuscriptViewerPage() {
  return (
    <>
      <ManuscriptsHero title="Manuscript Viewer" />
      <Suspense fallback={
        <div className="manuscripts-fallback">
          <div className="manuscripts-fallback__text">Loading manuscripts...</div>
        </div>
      }>
        <ManuscriptsContent />
      </Suspense>
    </>
  );
}

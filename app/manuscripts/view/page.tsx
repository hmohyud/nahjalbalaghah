import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import ManuscriptsContent from '../sections/content';

export const metadata: Metadata = {
  title: "Manuscript Viewer",
  description: "View, compare and read manuscripts of Nahj al-Balaghah alongside the critical edition.",
};

export default function ManuscriptViewerPage() {
  return (
    <div className="mss-page">
      <h1 className="sr-only">Manuscript viewer</h1>
      <Suspense fallback={
        <div className="mss-page__fallback">
          <Loader2 className="mss-spin" />
        </div>
      }>
        <ManuscriptsContent />
      </Suspense>
    </div>
  );
}

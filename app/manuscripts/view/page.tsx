import React, { Suspense } from 'react';
import ManuscriptsContent from '../sections/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Manuscript Viewer | Nahj al-Balaghah",
  description: "View, compare and read manuscripts of Nahj al-Balaghah alongside the critical edition.",
};

export default function ManuscriptViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <ManuscriptsContent />
      </Suspense>
    </div>
  );
}

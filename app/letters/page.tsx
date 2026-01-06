'use client';
import React from 'react';
import ContentPage from '@/app/components/content/content-page';
import { lettersApi } from '@/api/posts';

const config = {
  contentType: 'letters' as const,
  title: 'Letters (Writings)',
  subtitle: 'The insightful letters of Imam Ali, addressing governance, administration, and spiritual guidance with wisdom and authority.',
  api: {
    getContent: lettersApi.getLetters,
    searchContent: lettersApi.searchLetters,
  }
};

export default function LettersPage() {
  return (
    <div className="pt-32 lg:pt-36 bg-[var(--color-parchment)] min-h-screen">
      <ContentPage config={config} />
    </div>
  );
}

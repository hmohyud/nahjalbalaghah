'use client';
import React from 'react';
import ContentPage from '@/app/components/content/content-page';
import { sayingsApi } from '@/api/posts';

const config = {
  contentType: 'sayings' as const,
  title: 'Sayings (Aphorisms)',
  subtitle: 'The profound wisdom and timeless aphorisms of Imam Ali, offering guidance for daily life and spiritual reflection.',
  api: {
    getContent: sayingsApi.getSayings,
    searchContent: sayingsApi.searchSayings,
  }
};

export default function SayingsPage() {
  return (
    <div className="pt-32 lg:pt-36 bg-[var(--color-parchment)] min-h-screen">
      <ContentPage config={config} />
    </div>
  );
}

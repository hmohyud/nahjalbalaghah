'use client';
import React from 'react';
import ContentPage from '@/app/components/content/content-page';
import { orationsApi } from '@/api/posts';

const config = {
  contentType: 'orations' as const,
  title: 'Orations (Sermons)',
  subtitle: 'The eloquent sermons of Imam Ali, covering themes of faith, justice, governance, and the human condition.',
  api: {
    getContent: orationsApi.getOrations,
    searchContent: orationsApi.searchOrations,
  }
};

export default function OrationsPage() {
  return (
    <div className="pt-32 lg:pt-36 bg-[var(--color-parchment)] min-h-screen">
      <ContentPage config={config} />
    </div>
  );
}

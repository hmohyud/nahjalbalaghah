'use client';

import React, { useMemo } from 'react';
import ContentDetailsPage from '@/app/components/content/content-details-page';
import { sayingsApi } from '@/api/posts';

export default function SayingDetailsPage() {
  const api = useMemo(() => ({
    getContentById: sayingsApi.getSayingById,
  }), []);

  return (
    <div className="pt-32 lg:pt-36 bg-[var(--color-parchment)] min-h-screen">
      <ContentDetailsPage
        contentType="sayings"
        title="Sayings"
        api={api}
      />
    </div>
  );
}

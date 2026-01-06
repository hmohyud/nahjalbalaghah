'use client';

import React, { useMemo } from 'react';
import ContentDetailsPage from '@/app/components/content/content-details-page';
import { orationsApi } from '@/api/posts';

export default function OrationDetailsPage() {
  const api = useMemo(() => ({
    getContentById: orationsApi.getOrationById,
  }), []);

  return (
    <div className="pt-32 lg:pt-36 bg-[var(--color-parchment)] min-h-screen">
      <ContentDetailsPage
        contentType="orations"
        title="Orations"
        api={api}
      />
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import ContentDetailsPage from '@/app/components/content/content-details-page';
import ContentSubPathDispatcher from '@/app/components/content/content-sub-path-dispatcher';
import { orationsApi, lettersApi, sayingsApi } from '@/api/posts';

type ContentType = 'orations' | 'letters' | 'sayings';

const apiMap: Record<ContentType, (id: number) => Promise<any>> = {
  orations: orationsApi.getOrationById,
  letters: lettersApi.getLetterById,
  sayings: sayingsApi.getSayingById,
};

const titleMap: Record<ContentType, string> = {
  orations: 'Orations',
  letters: 'Letters',
  sayings: 'Sayings',
};

// /content/details/{type}/{id}            -> detail page
// /content/details/{type}/{id}/toc        -> table of contents + manuscripts
// /content/details/{type}/{id}/sources... -> sources list / source detail
export default function UnifiedContentDetailsPage() {
  const params = useParams();
  const paramsArray = (params.params as string[]) || [];
  const [type, id, ...rest] = paramsArray;

  const getContentById = apiMap[type as ContentType];
  const api = useMemo(() => ({ getContentById }), [getContentById]);

  if (paramsArray.length < 2) {
    return (
      <div className="content-wrapper">
        <p className="content-route-error">Invalid path</p>
      </div>
    );
  }

  if (!getContentById) {
    return (
      <div className="content-wrapper">
        <p className="content-route-error">Content type not found</p>
      </div>
    );
  }

  if (rest.length > 0) {
    return <ContentSubPathDispatcher type={type as ContentType} />;
  }

  return (
    <div className="content-wrapper">
      <ContentDetailsPage
        contentType={type as ContentType}
        title={titleMap[type as ContentType] || type}
        api={api}
        id={parseInt(id)}
      />
    </div>
  );
}

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
  },
  tocArabic: "باب المختار من خطب أمير المؤمنين صلىّ الله عليه وأوامره ويدخل في ذلك المختار من كلامه الجاري مجرى الخطب في المقامات المحضورة والمواقف المذكورة والخطوب الواردة",
  tocEnglish: "Chapter containing selections from the Commander of the Faithful’s orations and directives, including selections from his addresses that may be likened to orations, spoken in charged gatherings, famous battles, and times of danger"
};

export default function OrationsPage() {
  return (
    <div className="content-wrapper">
      <ContentPage config={config} />
    </div>
  );
}

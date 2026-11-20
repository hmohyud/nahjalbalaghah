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
  },
  tocArabic: "باب المختار من حكم أمير المؤمنين عليه السلام ومواعظه ويدخل في ذلك المختار من أجوبة مسائله والكلام القصير الخارج في سائر أغراضه",
  tocEnglish: "Chapter containing selections from the Commander of the Faithful’s wise sayings and words of counsel, including selections from his answers to questions and short texts from all genres of his literary production"
};

export default function SayingsPage() {
  return (
    <div className="content-wrapper">
      <ContentPage config={config} />
    </div>
  );
}

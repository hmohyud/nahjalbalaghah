import React from 'react';
import type { Metadata } from 'next';
import ManuscriptInformation from './manuscript-information';

export const metadata: Metadata = {
  title: "Manuscript Information | Nahj al-Balaghah",
  description: "Details of the Nahj al-Balaghah manuscripts: holding library, date, sigla, catalogue number, scribe and completeness.",
};

export default function ManuscriptInformationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#43896B]/10 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            Manuscript Information
          </h1>
          <div className="h-1 bg-[#43896B] rounded-full w-24 mx-auto mt-6"></div>
        </div>
      </section>
      <ManuscriptInformation />
    </div>
  );
}

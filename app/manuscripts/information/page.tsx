import React from 'react';
import type { Metadata } from 'next';
import ManuscriptsHero from '../sections/hero';
import ManuscriptInformation from './manuscript-information';

export const metadata: Metadata = {
  title: "Manuscript Information",
  description: "Details of the Nahj al-Balaghah manuscripts: holding library, date, sigla, catalogue number, scribe and completeness.",
};

export default function ManuscriptInformationPage() {
  return (
    <>
      <ManuscriptsHero title="Manuscript Information" />
      <ManuscriptInformation />
    </>
  );
}

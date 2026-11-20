import React from 'react';
import { BookOpen } from 'lucide-react';
import PDFViewer from '@/app/components/pdf-viewer';

type SearchParams = { [key: string]: string | string[] | undefined };

const getEditionPdfUrl = (edition: string): string => {
  const normalized = edition.trim().toLowerCase();

  if (normalized.includes('qutbuddin')) return '/pdfs/TQ-Notes-on-the-Edition-and-Translation.pdf';
  if (normalized.includes('djebli')) return '/pdfs/Nahdj al-Balagha_Djebli_EI2.pdf';

  return '/pdfs/TQ-Notes-on-the-Edition-and-Translation.pdf';
};

export default async function AboutEditionPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) || {};
  const editionRaw = params.edition;
  const edition = Array.isArray(editionRaw) ? editionRaw[0] : editionRaw;
  const editionTitle = (edition || 'Edition').trim();
  const pdfUrl = getEditionPdfUrl(editionTitle);

  return (
    <div className="static-page static-page--padded">
      <section className="static-page__hero--light">
        <div className="static-page__hero-light-inner">
          <div className="static-page__icon-box-wrapper">
            <div className="static-page__icon-box">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="static-page__title static-page__title--ink">
            About this edition
          </h1>

          <div className="static-page__ornament">
            <div className="static-page__ornament-line--right" />
            <div className="static-page__ornament-diamond" />
            <div className="static-page__ornament-line--left" />
          </div>

          <p className="static-page__subtitle static-page__subtitle--muted">
            {editionTitle}
          </p>
        </div>
      </section>

      <section className="static-page__main">
        <div className="static-page__main-inner">
          <div className="static-page__panel">
            <div className="static-page__panel-corner--tl" />
            <div className="static-page__panel-corner--br" />
            <PDFViewer pdfUrl={pdfUrl} title={editionTitle} />
          </div>
          <p className="edition-about__hint">
            Use the controls above to navigate pages, zoom, and view in fullscreen mode
          </p>
        </div>
      </section>
    </div>
  );
}

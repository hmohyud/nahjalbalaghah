import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Table of Contents | Nahj al-Balaghah",
  description: "Browse the complete table of contents for Nahj al-Balaghah with headings in English and Arabic, along with historical manuscript references.",
  openGraph: {
    title: "Table of Contents | Nahj al-Balaghah",
    description: "Browse the complete table of contents for Nahj al-Balaghah with headings in English and Arabic, along with historical manuscript references.",
    url: "https://nahj-al-balagha.com/toc",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Table of Contents | Nahj al-Balaghah",
    description: "Browse the complete table of contents for Nahj al-Balaghah with headings in English and Arabic, along with historical manuscript references.",
    images: [
      {
        url: "/globe.svg",
        alt: "Nahj al-Balaghah Logo"
      }
    ]
  }
};

export default function TOCIndexPage() {
  return (
    <div className="toc-page">
      {/* Hero Section */}
      <section className="toc-page__hero">
        <div className="toc-page__hero-inner">
          <div className="toc-page__hero-center">
            <div className="toc-page__hero-badge">
              <FileText className="w-8 h-8 toc-page__hero-badge-icon" />
              <span className="toc-page__hero-badge-text">Complete Reference</span>
            </div>
            <h1 className="toc-page__hero-title">
              Table of Contents
            </h1>
            <div className="toc-page__hero-divider"></div>
            <p className="toc-page__hero-desc">
              Access detailed table of contents entries with English and Arabic headings,
              along with historical manuscript images and metadata.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="toc-page__content-section">
        <div className="toc-page__content-inner">
          <div className="toc-page__content-grid">
            {/* Orations */}
            <Link
              href="/orations"
              className="toc-page__card toc-page__card--orations"
            >
              <div className="toc-page__card-header">
                <div className="toc-page__card-icon-box">
                  <BookOpen className="w-7 h-7 toc-page__card-icon" />
                </div>
                <div>
                  <h2 className="toc-page__card-title">
                    Orations
                  </h2>
                  <p className="toc-page__card-subtitle">Khutbah</p>
                </div>
              </div>
              <p className="toc-page__card-desc">
                View the table of contents for all orations (sermons) in Nahj al-Balaghah.
                Each entry includes the heading and opening lines in English and Arabic.
              </p>
              <div className="toc-page__card-link-row">
                <span>Browse Orations</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Letters */}
            <Link
              href="/letters"
              className="toc-page__card toc-page__card--letters"
            >
              <div className="toc-page__card-header">
                <div className="toc-page__card-icon-box">
                  <FileText className="w-7 h-7 toc-page__card-icon" />
                </div>
                <div>
                  <h2 className="toc-page__card-title">
                    Letters
                  </h2>
                  <p className="toc-page__card-subtitle">Maktoobat</p>
                </div>
              </div>
              <p className="toc-page__card-desc">
                Explore the table of contents for letters written by Imam Ali (AS).
                View headings and key excerpts with manuscript references.
              </p>
              <div className="toc-page__card-link-row">
                <span>Browse Letters</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Sayings */}
            <Link
              href="/sayings"
              className="toc-page__card toc-page__card--sayings"
            >
              <div className="toc-page__card-header">
                <div className="toc-page__card-icon-box">
                  <svg className="w-7 h-7 toc-page__card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="toc-page__card-title">
                    Sayings
                  </h2>
                  <p className="toc-page__card-subtitle">Hikam</p>
                </div>
              </div>
              <p className="toc-page__card-desc">
                Access the table of contents for short sayings and wisdom.
                Each saying is presented with English and Arabic text.
              </p>
              <div className="toc-page__card-link-row">
                <span>Browse Sayings</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="toc-page__features-section">
        <div className="toc-page__features-inner">
          <h2 className="toc-page__features-title">
            What You'll Find in the TOC
          </h2>
          <div className="toc-page__features-grid">
            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <FileText className="w-6 h-6 toc-page__feature-icon" />
              </div>
              <h3 className="toc-page__feature-title">Headings</h3>
              <p className="toc-page__feature-desc">
                Descriptive headings that capture the essence of each entry
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <BookOpen className="w-6 h-6 toc-page__feature-icon" />
              </div>
              <h3 className="toc-page__feature-title">English Text</h3>
              <p className="toc-page__feature-desc">
                Opening lines and key excerpts translated into English
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <span className="toc-page__feature-arabic-icon">ع</span>
              </div>
              <h3 className="toc-page__feature-title">Arabic Text</h3>
              <p className="toc-page__feature-desc">
                Original Arabic text in beautiful Taha font
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <svg className="w-6 h-6 toc-page__feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="toc-page__feature-title">Manuscripts</h3>
              <p className="toc-page__feature-desc">
                Historical manuscript images and metadata (available for sections 1.1, 1.2, 1.3)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight, Quote } from 'lucide-react';
import Link from 'next/link';

export default function ConclusionsPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="static-page static-page--padded">
      {/* Hero Section */}
      <section className="static-page__hero--light">
        <div className="static-page__hero-light-inner">
          {/* Icon */}
          <div
            className={`static-page__icon-box-wrapper fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            <div className="static-page__icon-box">
              <Bookmark className="icon--md icon--white" />
            </div>
          </div>

          {/* Title */}
          <h1
            className={`static-page__title static-page__title--ink fade-in-up fade-delay-100 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            Radi's Conclusion
          </h1>

          {/* Decorative ornament */}
          <div
            className={`static-page__ornament fade-in-up fade-delay-200 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
          >
            <div className="static-page__ornament-line--right" />
            <div className="static-page__ornament-diamond" />
            <div className="static-page__ornament-line--left" />
          </div>

          <p
            className={`static-page__subtitle static-page__subtitle--muted fade-in-up fade-delay-300 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            Reflections on the completion of this monumental work and its enduring legacy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="static-page__main">
        <div className="static-page__main-inner">
          <div className="static-page__panel">
            {/* Corner accents */}
            <div className="static-page__panel-corner--tl" />
            <div className="static-page__panel-corner--br" />

            <div className="static-page__panel-inner">
              {/* Quote Block */}
              <div className="static-page__quote-block">
                <Quote className="icon--lg static-page__quote-icon" strokeWidth={1} />
                <blockquote className="static-page__blockquote">
                  "The worth of every person is in their attainments."
                </blockquote>
                <div className="static-page__quote-attribution">
                  <div className="static-page__quote-line" />
                  <p className="static-page__quote-author">
                    Imam Ali ibn Abi Talib (AS)
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="static-page__divider">
                <div className="static-page__divider-line" />
                <div className="static-page__divider-diamond" />
                <div className="static-page__divider-line" />
              </div>

              <div className="static-page__body-text">
                <p className="static-page__body-text--lg">
                  The compilation of <span className="static-page__text-highlight">Nahj al-Balaghah</span> represents one of the most significant achievements in Islamic literary history. Through the dedicated efforts of al-Sharif al-Radi, the profound wisdom of Imam Ali has been preserved for generations of seekers.
                </p>

                <p>
                  This collection stands as a testament to the eloquence of the Arabic language and the depth of Islamic spiritual and ethical thought. Each sermon, letter, and saying contained within these pages offers guidance that remains as relevant today as it was over a millennium ago.
                </p>

                <p>
                  We hope that this digital platform serves as a humble contribution to making these timeless teachings accessible to seekers of knowledge worldwide. May the wisdom contained within Nahj al-Balaghah continue to illuminate hearts and minds for generations to come.
                </p>
              </div>

              {/* Arabic Closing */}
              <div className="static-page__arabic-closing">
                <p className="static-page__arabic-closing-text" dir="rtl">
                  وَالحَمْدُ لِلّٰهِ رَبِّ العَالَمِينَ
                </p>
                <p className="static-page__arabic-closing-translation">
                  All praise is due to Allah, Lord of all the worlds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="static-page__nav-section">
        <div className="static-page__nav-inner">
          <h2 className="static-page__nav-title">
            Continue Exploring
          </h2>
          <div className="static-page__nav-links">
            <Link href="/orations" className="btn-outline">
              <span>Orations</span>
              <ArrowRight className="icon--sm" />
            </Link>
            <Link href="/letters" className="btn-outline">
              <span>Letters</span>
              <ArrowRight className="icon--sm" />
            </Link>
            <Link href="/sayings" className="btn-outline">
              <span>Sayings</span>
              <ArrowRight className="icon--sm" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

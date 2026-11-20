'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Languages, Bookmark, Scale, ArrowRight, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';

export default function IndexesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const indexes = [
    {
      icon: MapPin,
      title: "Index of Names and Places",
      description: "Locate people, tribes, and geographic regions mentioned throughout Nahj al-Balaghah. This comprehensive index helps you trace historical figures and locations referenced in the text.",
      href: "/indexes/names-places",
      count: "500+"
    },
    {
      icon: Languages,
      title: "Index of Terms",
      description: "Understand key Arabic and Islamic terminology used in the sermons, letters, and sayings. Each term includes transliteration, translation, and contextual usage.",
      href: "/indexes/terms",
      count: "300+"
    },
    {
      icon: Bookmark,
      title: "Qur'an, Hadith & Poetry",
      description: "Find scriptural references, poetic verses, and traditional wisdom quoted throughout Nahj al-Balaghah. Includes cross-references to original sources.",
      href: "/indexes/quran-hadith",
      count: "200+"
    },
    {
      icon: Scale,
      title: "Religious & Ethical Concepts",
      description: "Explore core values and concepts like justice, piety, and ethics as emphasized by Imam Ali. Navigate by theme to find relevant passages.",
      href: "/indexes/concepts",
      count: "150+"
    }
  ];

  return (
    <div className="indexes-page">
      {/* Hero Section */}
      <section className="indexes-page__hero">
        <div className="indexes-page__hero-inner">
          {/* Icon */}
          <div
            className={`indexes-page__icon-wrap ${isVisible ? 'indexes-page__icon-wrap--visible' : ''}`}
          >
            <div className="indexes-page__icon-box">
              <BookOpen className="w-8 h-8" style={{ color: 'white' }} />
            </div>
          </div>

          {/* Title */}
          <h1
            className={`indexes-page__title ${isVisible ? 'indexes-page__title--visible' : ''}`}
          >
            Scholarly Indexes
          </h1>

          {/* Decorative ornament */}
          <div
            className={`indexes-page__ornament ${isVisible ? 'indexes-page__ornament--visible' : ''}`}
          >
            <div className="indexes-page__ornament-line indexes-page__ornament-line--left" />
            <div className="indexes-page__ornament-diamond" />
            <div className="indexes-page__ornament-line indexes-page__ornament-line--right" />
          </div>

          <p
            className={`indexes-page__description ${isVisible ? 'indexes-page__description--visible' : ''}`}
          >
            Navigate Nahj al-Balaghah through comprehensive indexes of names, places, terms,
            scriptural references, and religious concepts.
          </p>
        </div>
      </section>

      {/* Index Cards Section */}
      <section className="indexes-page__cards-section">
        <div className="indexes-page__cards-inner">
          <div className="indexes-page__cards-grid">
            {indexes.map((index, i) => (
              <Link
                href={index.href}
                key={index.title}
                className={`indexes-page__card-link ${isVisible ? 'indexes-page__card-link--visible' : ''}`}
                style={{ transitionDelay: `${400 + i * 100}ms` }}
              >
                <div className="indexes-page__card">
                  {/* Count badge */}
                  <div className="indexes-page__card-count">
                    {index.count} entries
                  </div>

                  {/* Icon */}
                  <div className="indexes-page__card-icon-box">
                    <index.icon className="w-7 h-7" style={{ color: 'white' }} />
                  </div>

                  {/* Content */}
                  <h3 className="indexes-page__card-title">{index.title}</h3>
                  <p className="indexes-page__card-desc">{index.description}</p>

                  {/* Hover indicator */}
                  <div className="indexes-page__card-hover-row">
                    <div className="indexes-page__card-hover-line" />
                    <span className="indexes-page__card-hover-text">Browse Index</span>
                    <ArrowRight className="w-4 h-4 indexes-page__card-hover-arrow" />
                  </div>

                  {/* Corner accents on hover */}
                  <div className="indexes-page__card-corner indexes-page__card-corner--tl" />
                  <div className="indexes-page__card-corner indexes-page__card-corner--br" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="indexes-page__bottom">
        <div className="indexes-page__bottom-inner">
          <div className="indexes-page__bottom-box">
            {/* Corner accents */}
            <div className="indexes-page__bottom-corner indexes-page__bottom-corner--tl" />
            <div className="indexes-page__bottom-corner indexes-page__bottom-corner--br" />

            <Search className="w-12 h-12 indexes-page__bottom-icon" />
            <h3 className="indexes-page__bottom-title">
              Can't Find What You're Looking For?
            </h3>
            <p className="indexes-page__bottom-text">
              Use our advanced search to find specific passages, themes, or references across the entire text of Nahj al-Balaghah.
            </p>
            <Link href="/search" className="indexes-page__cta-wrap">
              <button className="indexes-page__cta-btn">
                <span>Search the Text</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {/* Outer corners on hover */}
              <div className="indexes-page__cta-corner indexes-page__cta-corner--tl" />
              <div className="indexes-page__cta-corner indexes-page__cta-corner--br" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

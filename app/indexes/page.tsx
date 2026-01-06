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
    <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          {/* Icon */}
          <div 
            className={`flex justify-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="w-16 h-16 bg-[var(--color-primary)] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className={`font-display text-4xl lg:text-6xl text-[var(--color-ink)] mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Scholarly Indexes
          </h1>

          {/* Decorative ornament */}
          <div 
            className={`flex items-center justify-center gap-4 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>

          <p 
            className={`font-body text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Navigate Nahj al-Balaghah through comprehensive indexes of names, places, terms, 
            scriptural references, and religious concepts.
          </p>
        </div>
      </section>

      {/* Index Cards Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {indexes.map((index, i) => (
              <Link 
                href={index.href} 
                key={index.title}
                className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${400 + i * 100}ms` }}
              >
                <div className="relative h-full p-8 lg:p-10 bg-white border border-[var(--color-stone)] transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:-translate-y-1">
                  {/* Count badge */}
                  <div className="absolute top-6 right-6 text-xs tracking-[0.15em] text-[var(--color-warm-gray)]">
                    {index.count} entries
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-[var(--color-primary)] flex items-center justify-center mb-6">
                    <index.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-2xl text-[var(--color-ink)] mb-3">{index.title}</h3>
                  <p className="font-body text-[var(--color-warm-gray)] leading-relaxed mb-6">{index.description}</p>

                  {/* Hover indicator */}
                  <div className="flex items-center gap-3 text-[var(--color-primary)]">
                    <div className="h-[1px] w-0 bg-[var(--color-accent)] group-hover:w-8 transition-all duration-300" />
                    <span className="text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Browse Index</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Corner accents on hover */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-8 group-hover:h-8 transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-8 group-hover:h-8 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative bg-[var(--color-parchment)] border border-[var(--color-stone)] p-10 lg:p-14 text-center">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)]" />

            <Search className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-6" />
            <h3 className="font-display text-2xl lg:text-3xl text-[var(--color-ink)] mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="font-body text-[var(--color-warm-gray)] mb-8 max-w-lg mx-auto">
              Use our advanced search to find specific passages, themes, or references across the entire text of Nahj al-Balaghah.
            </p>
            <Link href="/search" className="group relative inline-block">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200">
                <span>Search the Text</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {/* Outer corners on hover */}
              <div className="absolute -top-1.5 -left-1.5 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
              <div className="absolute -bottom-1.5 -right-1.5 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

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
    <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          {/* Icon */}
          <div 
            className={`flex justify-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="w-16 h-16 bg-[var(--color-primary)] flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className={`font-display text-4xl lg:text-6xl text-[var(--color-ink)] mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Radi's Conclusion
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
            Reflections on the completion of this monumental work and its enduring legacy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="relative bg-[var(--color-parchment)] border border-[var(--color-stone)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)]" />

            <div className="p-8 lg:p-12">
              {/* Quote Block */}
              <div className="mb-10">
                <Quote className="w-10 h-10 text-[var(--color-accent)]/30 mb-6" strokeWidth={1} />
                <blockquote className="font-display text-2xl lg:text-3xl text-[var(--color-ink)] leading-snug italic mb-6">
                  "The worth of every person is in their attainments."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-[1px] bg-[var(--color-accent)]" />
                  <p className="font-display text-[var(--color-charcoal)]">
                    Imam Ali ibn Abi Talib (AS)
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
                <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
              </div>

              <div className="space-y-6 font-body text-[var(--color-charcoal)] leading-relaxed">
                <p className="text-lg">
                  The compilation of <span className="font-display italic text-[var(--color-primary)]">Nahj al-Balaghah</span> represents one of the most significant achievements in Islamic literary history. Through the dedicated efforts of al-Sharif al-Radi, the profound wisdom of Imam Ali has been preserved for generations of seekers.
                </p>

                <p>
                  This collection stands as a testament to the eloquence of the Arabic language and the depth of Islamic spiritual and ethical thought. Each sermon, letter, and saying contained within these pages offers guidance that remains as relevant today as it was over a millennium ago.
                </p>

                <p>
                  We hope that this digital platform serves as a humble contribution to making these timeless teachings accessible to seekers of knowledge worldwide. May the wisdom contained within Nahj al-Balaghah continue to illuminate hearts and minds for generations to come.
                </p>
              </div>

              {/* Arabic Closing */}
              <div className="mt-10 pt-8 border-t border-[var(--color-stone)]">
                <p className="font-taha text-2xl text-[var(--color-primary)] text-right leading-loose" dir="rtl">
                  وَالحَمْدُ لِلّٰهِ رَبِّ العَالَمِينَ
                </p>
                <p className="text-sm text-[var(--color-warm-gray)] text-right mt-2">
                  All praise is due to Allah, Lord of all the worlds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl text-[var(--color-ink)] mb-8">
            Continue Exploring
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/orations" className="btn-outline">
              <span>Orations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/letters" className="btn-outline">
              <span>Letters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sayings" className="btn-outline">
              <span>Sayings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

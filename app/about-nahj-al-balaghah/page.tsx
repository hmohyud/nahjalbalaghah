'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutNahjPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const themes = [
    { title: "Divine Unity and Faith", description: "Reflections on the nature of God, creation, and the purpose of life" },
    { title: "Justice and Governance", description: "Principles of just leadership and ethical administration" },
    { title: "Morality and Ethics", description: "Guidance on virtue, patience, humility, and piety" },
    { title: "Knowledge and Wisdom", description: "The value of learning, contemplation, and spiritual growth" },
    { title: "Social Responsibility", description: "The importance of compassion, charity, and community welfare" }
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
            About Nahj al-Balaghah
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
            className={`font-body text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            "The Way of Eloquence" — A masterpiece of Islamic literature containing the sermons, 
            letters, and sayings of Imam Ali ibn Abi Talib (AS).
          </p>

          {/* Download CTA */}
          <div 
            className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <Link 
              href="/pdfs/TQ-Introduction-to-Nahj-al-Balaghah.pdf" 
              target="_blank"
              className="group relative inline-block"
            >
              <button className="inline-flex items-center gap-3 px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-sm tracking-[0.1em] uppercase font-medium hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Download Introduction PDF</span>
              </button>
            </Link>
          </div>
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
              <div className="space-y-6 font-body text-[var(--color-charcoal)] leading-relaxed">
                <p className="text-lg">
                  <span className="font-display text-xl italic text-[var(--color-primary)]">Nahj al-Balaghah</span> (نَهْج البَلَاغَة, "The Way of Eloquence") is a collection of sermons, letters, and sayings attributed to Imam Ali ibn Abi Talib (AS), the cousin and son-in-law of Prophet Muhammad (PBUH), and the fourth caliph in Sunni Islam and the first Imam in Shia Islam.
                </p>
                
                <p>
                  Compiled in the 10th century CE by Sharif al-Radi, a renowned Shia scholar, this work is celebrated as one of the most significant pieces of Arabic literature and Islamic thought. It addresses themes of governance, justice, spirituality, ethics, and human nature with profound eloquence and wisdom.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 my-10">
                  <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                  <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
                  <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                </div>

                {/* Key Themes */}
                <div>
                  <h2 className="font-display text-2xl text-[var(--color-ink)] mb-6">Key Themes</h2>
                  <div className="space-y-4">
                    {themes.map((theme) => (
                      <div key={theme.title} className="flex items-start gap-4">
                        <div className="w-2 h-2 mt-2 bg-[var(--color-accent)] rotate-45 flex-shrink-0" />
                        <div>
                          <span className="font-display text-[var(--color-primary)]">{theme.title}:</span>
                          <span className="text-[var(--color-warm-gray)] ml-2">{theme.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-10">
                  <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                  <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
                  <div className="flex-1 h-[1px] bg-[var(--color-stone)]" />
                </div>

                <p>
                  The text is divided into three main sections: <span className="font-display text-[var(--color-primary)]">Khutab</span> (Sermons/Orations), <span className="font-display text-[var(--color-primary)]">Maktubat</span> (Letters), and <span className="font-display text-[var(--color-primary)]">Hikam</span> (Short Sayings). Each section offers unique insights into Imam Ali's teachings and his approach to leadership, spirituality, and daily life.
                </p>

                <p>
                  Nahj al-Balaghah has been studied by scholars across the Islamic world and beyond, transcending sectarian boundaries. Its eloquent Arabic prose is considered a masterpiece of classical literature, second only to the Quran in linguistic beauty and depth.
                </p>

                {/* Historical Significance Box */}
                <div className="bg-white border-l-4 border-[var(--color-primary)] p-6 my-8">
                  <h3 className="font-display text-xl text-[var(--color-primary)] mb-3">Historical Significance</h3>
                  <p className="text-[var(--color-warm-gray)]">
                    Throughout history, Nahj al-Balaghah has influenced Islamic jurisprudence, philosophy, mysticism, and political thought. It serves as a guide for Muslims seeking to understand the principles of righteous living, just governance, and spiritual enlightenment. Commentaries on this work have been written by scholars from various schools of thought, demonstrating its universal appeal and enduring relevance.
                  </p>
                </div>

                <p className="text-lg font-display text-[var(--color-ink)]">
                  This digital platform provides easy access to the complete text, enabling readers to explore, search, and reflect upon the timeless wisdom contained within Nahj al-Balaghah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-[var(--color-ink)] mb-6">
            Begin Your Journey
          </h2>
          <p className="font-body text-[var(--color-warm-gray)] mb-8 max-w-lg mx-auto">
            Explore the sermons, letters, and sayings that have inspired generations of seekers.
          </p>
          <Link href="/orations" className="group relative inline-block">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200">
              <span>Start Reading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="absolute -top-1.5 -left-1.5 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
            <div className="absolute -bottom-1.5 -right-1.5 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
          </Link>
        </div>
      </section>
    </div>
  );
}

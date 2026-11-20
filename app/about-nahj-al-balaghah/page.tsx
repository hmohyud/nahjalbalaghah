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

  const resourceLinks = [
    {
      label: "\"Introduction\" to Nahj al-Balāghah: The Wisdom and Eloquence of ʿAlī, edited by Tahera Qutbuddin",
      href: "/pdfs/TQ-Introduction-to-Nahj-al-Balaghah.pdf"
    },
    {
      label: "\"Nahj al-Balagha\", Qutbuddin, Tahera — Encyclopaedia of Islam, THREE",
      href: "/pdfs/Qutbuddin_Nahj al-Balagha_EI3.pdf"
    },
    {
      label: "\"Nahdj al-Balāgha\", Mukhtar Djebli — Encyclopaedia of Islam, Second Edition",
      href: "/pdfs/Nahdj al-Balagha_Djebli_EI2.pdf"
    }
  ];

  return (
    <div className="static-page static-page--padded">
      {/* Hero Section */}
      <section className="static-page__hero--light">
        <div className="static-page__hero-light-inner">
          {/* Icon */}
          <div
            className={`static-page__icon-box-wrapper transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="static-page__icon-box">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1
            className={`static-page__title static-page__title--ink transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            About Nahj al-Balaghah
          </h1>

          {/* Decorative ornament */}
          <div
            className={`static-page__ornament transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="static-page__ornament-line--right" />
            <div className="static-page__ornament-diamond" />
            <div className="static-page__ornament-line--left" />
          </div>

          <p
            className={`static-page__subtitle static-page__subtitle--muted transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
              download
              className="static-page__cta-wrapper"
            >
              <button className="static-page__cta-btn--outline">
                <Download className="w-4 h-4" />
                <span>Download Introduction PDF</span>
              </button>
            </Link>
          </div>
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
              <div className="static-page__body-text">
                <p className="static-page__body-text--lg">
                  <span className="static-page__text-highlight static-page__text-highlight--xl">Nahj al-Balaghah</span> (<span className="font-taha" dir="rtl" lang="ar">&#1606;&#1614;&#1607;&#1618;&#1580; &#1575;&#1604;&#1576;&#1614;&#1604;&#1614;&#1575;&#1594;&#1577;</span>, "The Way of Eloquence") is a collection of sermons, letters, and sayings attributed to Imam Ali ibn Abi Talib (AS), the cousin and son-in-law of Prophet Muhammad (PBUH), and the fourth caliph in Sunni Islam and the first Imam in Shia Islam.
                </p>

                <p>
                  Compiled in the 10th century CE by Sharif al-Radi, a renowned Shia scholar, this work is celebrated as one of the most significant pieces of Arabic literature and Islamic thought. It addresses themes of governance, justice, spirituality, ethics, and human nature with profound eloquence and wisdom.
                </p>

                {/* Divider */}
                <div className="static-page__divider">
                  <div className="static-page__divider-line" />
                  <div className="static-page__divider-diamond" />
                  <div className="static-page__divider-line" />
                </div>

                {/* Key Themes */}
                <div>
                  <h2 className="static-page__themes-title">Key Themes</h2>
                  <div className="static-page__themes-list">
                    {themes.map((theme) => (
                      <div key={theme.title} className="static-page__theme-item">
                        <div className="static-page__theme-bullet" />
                        <div>
                          <span className="static-page__theme-label">{theme.title}:</span>
                          <span className="static-page__theme-desc">{theme.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="static-page__divider">
                  <div className="static-page__divider-line" />
                  <div className="static-page__divider-diamond" />
                  <div className="static-page__divider-line" />
                </div>

                <p>
                  The text is divided into three main sections: <span className="static-page__text-highlight">Khutab</span> (Sermons/Orations), <span className="static-page__text-highlight">Maktubat</span> (Letters), and <span className="static-page__text-highlight">Hikam</span> (Short Sayings). Each section offers unique insights into Imam Ali's teachings and his approach to leadership, spirituality, and daily life.
                </p>

                <p>
                  Nahj al-Balaghah has been studied by scholars across the Islamic world and beyond, transcending sectarian boundaries. Its eloquent Arabic prose is considered a masterpiece of classical literature, second only to the Quran in linguistic beauty and depth.
                </p>

                {/* Historical Significance Box */}
                <div className="static-page__highlight-box">
                  <h3 className="static-page__highlight-title">Historical Significance</h3>
                  <p className="static-page__highlight-text">
                    Throughout history, Nahj al-Balaghah has influenced Islamic jurisprudence, philosophy, mysticism, and political thought. It serves as a guide for Muslims seeking to understand the principles of righteous living, just governance, and spiritual enlightenment. Commentaries on this work have been written by scholars from various schools of thought, demonstrating its universal appeal and enduring relevance.
                  </p>
                </div>

                <p className="static-page__closing-text">
                  This digital platform provides easy access to the complete text, enabling readers to explore, search, and reflect upon the timeless wisdom contained within Nahj al-Balaghah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Scholarly Resources */}
      <section className="static-page__main">
        <div className="static-page__main-inner">
          <h2 className="static-page__themes-title about-resources__title">Scholarly Resources</h2>
          <div className="about-resources__list">
            {resourceLinks.map((link) => (
              <div key={link.href} className="about-resources__item">
                <span className="about-resources__label">{link.label}</span>
                <a href={link.href} download className="about-resources__download">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="static-page__nav-section">
        <div className="static-page__nav-inner">
          <h2 className="static-page__nav-title static-page__nav-title--lg">
            Begin Your Journey
          </h2>
          <p className="static-page__nav-subtitle">
            Explore the sermons, letters, and sayings that have inspired generations of seekers.
          </p>
          <Link href="/orations" className="group static-page__cta-wrapper">
            <button className="static-page__cta-btn">
              <span>Start Reading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="static-page__cta-corner static-page__cta-corner--tl" />
            <div className="static-page__cta-corner static-page__cta-corner--br" />
          </Link>
        </div>
      </section>
    </div>
  );
}

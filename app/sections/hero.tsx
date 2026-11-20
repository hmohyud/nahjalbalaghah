"use client";
import React, { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { orationsApi, lettersApi, sayingsApi } from '@/api'
// Full title-page calligraphy (public/calligraphy/web/title.png)
import TitleCalligraphy from '@/public/calligraphy/web/title.png'
import EditionPicker from '@/app/components/edition-picker'

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({
    orations: 0,
    letters: 0,
    sayings: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    try {
      setIsLoading(true)
      const [orationsResponse, lettersResponse, sayingsResponse] = await Promise.all([
        orationsApi.getOrations(1, 1),
        lettersApi.getLetters(1, 1),
        sayingsApi.getSayings(1, 1)
      ])

      setCounts({
        orations: orationsResponse.meta.pagination.total,
        letters: lettersResponse.meta.pagination.total,
        sayings: sayingsResponse.meta.pagination.total
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
      setCounts({
        orations: 241,
        letters: 79,
        sayings: 489
      })
    } finally {
      setIsLoading(false)
    }
  }
  const contentTypes = [
    {
      arabic: "الخطب",
      calligraphy: "orations",
      label: "Orations",
      count: isLoading ? "..." : counts.orations.toString(),
      href: "/orations",
      description: "Sermons & discourses"
    },
    {
      arabic: "الكتب",
      calligraphy: "letters",
      label: "Letters",
      count: isLoading ? "..." : counts.letters.toString(),
      href: "/letters",
      description: "Epistles & correspondence"
    },
    {
      arabic: "الحِكَم",
      calligraphy: "sayings",
      label: "Sayings",
      count: isLoading ? "..." : counts.sayings.toString(),
      href: "/sayings",
      description: "Wisdom & aphorisms"
    }
  ]

  return (
    <>
      <section className="hero-section">
        {/* Background */}
        <div className="hero-background">
          <div className="hero-background-texture bg-pattern-cross" />
        </div>

        {/* Decorative page frame - like manuscript edges */}
        <div className="hero-page-frame">
          <div className="hero-page-frame__corner hero-page-frame__corner--tl" />
          <div className="hero-page-frame__corner hero-page-frame__corner--tr" />
          <div className="hero-page-frame__corner hero-page-frame__corner--bl" />
          <div className="hero-page-frame__corner hero-page-frame__corner--br" />
        </div>

        {/* Main Content */}
        <div className="hero-main">
          <div className="hero-backdrop">
            {/* Arabic Title Image */}
            <div className="hero-title-image-wrapper">
              <Image
                src={TitleCalligraphy}
                alt="نهج البلاغة من كلام أمير المؤمنين علي بن أبي طالب صلوات الله عليه للشريف الرضي محمد بن الحسين بن موسى"
                className="hero-title-image"
                priority
              />
            </div>

            {/* Decorative Ornament */}
            <div className={`hero-ornament-row fade-in-up--slow hero-ornament-delay ${isVisible ? "fade-in--visible" : "fade-in--hidden"}`}
            >
              <div className="hero-ornament-line hero-ornament-line--right" />
              <div className="hero-ornament-diamond" />
              <div className="hero-ornament-line hero-ornament-line--left" />
            </div>

            {/* English Title */}
            <h1 className={`hero-english-title fade-in-up--slow fade-delay-300 ${isVisible ? "fade-in-up--visible" : "fade-in-up--hidden"}`}>
              The Way of Eloquence
            </h1>

            {/* Subtitle */}
            <p className={`hero-subtitle fade-in-up--slow fade-delay-400 ${isVisible ? "fade-in-up--visible" : "fade-in-up--hidden"}`}>
              Selections from the Words of the Commander of the Faithful
            </p>

            {/* Name */}
            <p className={`hero-author-name fade-in-up--slow fade-delay-500 ${isVisible ? "fade-in-up--visible" : "fade-in-up--hidden"}`}>
              ʿAli ibn Abi Talib
            </p>

            {/* Compiler Credit */}
            <div className={`compiled-cred fade-in-up--slow fade-delay-600 ${isVisible ? "fade-in-up--visible" : "fade-in-up--hidden"}`}>
              <p className="hero-compiler-label">
                Compiled by
              </p>
              <p className="hero-compiler-name">
                al-Sharif al-Radi
              </p>
            </div>
          </div>
        </div>

        {/* Content Type Cards */}
        <div className="hero-cards-section hero-content-cards">
          <div className="hero-cards-container">
            {/* Edition used across listing & details pages (saved as a preference) */}
            <EditionPicker className={`hero-edition-picker fade-in-up--slow fade-delay-700 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`} />
            <div className="hero-cards-grid">
              {contentTypes.map((content, index) => (
                <Link
                  href={content.href}
                  key={content.label}
                  className={`group block fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up-lg--hidden'}`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <div className="hero-content-card">
                    {/* Arabic */}
                    <span
                      className={`calligraphy-mark calligraphy-mark--${content.calligraphy} hero-content-card-calligraphy`}
                      role="img"
                      aria-label={content.arabic}
                    />

                    {/* English */}
                    <h3 className="hero-content-card-title">
                      {content.label}
                    </h3>
                    <p className="hero-content-card-desc">
                      {content.description}
                    </p>

                    {/* Hover indicator line */}
                    <div className="hero-hover-indicator">
                      <div className="hero-hover-indicator__line" />
                      <span className="hero-hover-indicator__text">
                        Explore
                      </span>
                    </div>

                    {/* Corner accents - appear on hover */}
                    <div className="corner-accent-hover corner-accent-hover--top-left" />
                    <div className="corner-accent-hover corner-accent-hover--bottom-right" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Radi's Introduction & Conclusion */}
        <div className="hero-radi-section">
          {/* Decorative top line */}
          <div className="hero-radi-divider" />

          <div className="hero-radi-container">
            <div className="hero-radi-grid">
              {/* Left link - right aligned */}
              <Link href="/radis" className="group hero-radi-link-left">
                <span className="hero-radi-link">
                  ← Radi's Introduction
                </span>
              </Link>

              {/* Center ornament */}
              <div className="hero-radi-ornament-row">
                <div className="hero-ornament-line hero-ornament-line--right" />
                <div className="hero-ornament-diamond" />
                <div className="hero-ornament-line hero-ornament-line--left" />
              </div>

              {/* Right link - left aligned */}
              <Link href="/conclusions" className="group text-left">
                <span className="hero-radi-link">
                  Radi's Conclusion →
                </span>
              </Link>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="hero-radi-container hero-radi-scroll-wrapper">
            <div className={`hero-radi-grid fade-in-up--slow fade-delay-1000 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}>
              <div />
              <ChevronDown className="hero-scroll-indicator animate-bounce" />
              <div />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroSection

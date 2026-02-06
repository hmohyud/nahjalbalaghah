"use client";
import React, { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { orationsApi, lettersApi, sayingsApi } from '@/api'
import TitleImage from '@/app/assets/images/title.png'

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
      label: "Orations",
      count: isLoading ? "..." : counts.orations.toString(),
      href: "/orations",
      description: "Sermons & discourses"
    },
    {
      arabic: "الكتب",
      label: "Letters",
      count: isLoading ? "..." : counts.letters.toString(),
      href: "/letters",
      description: "Epistles & correspondence"
    },
    {
      arabic: "الحكم",
      label: "Sayings",
      count: isLoading ? "..." : counts.sayings.toString(),
      href: "/sayings",
      description: "Wisdom & aphorisms"
    }
  ]

  return (
    <>
      <section className="relative min-h-screen flex flex-col">
        {/* Background */}
        <div className="absolute inset-0 bg-[var(--color-parchment)]">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Decorative page frame - like manuscript edges */}
        <div className="absolute inset-8 lg:inset-12 pointer-events-none">
          <div className="absolute top-0 left-0 w-16 lg:w-20 h-16 lg:h-20 border-l border-t border-[var(--color-accent)]/15" />
          <div className="absolute top-0 right-0 w-16 lg:w-20 h-16 lg:h-20 border-r border-t border-[var(--color-accent)]/15" />
          <div className="absolute bottom-0 left-0 w-16 lg:w-20 h-16 lg:h-20 border-l border-b border-[var(--color-accent)]/15" />
          <div className="absolute bottom-0 right-0 w-16 lg:w-20 h-16 lg:h-20 border-r border-b border-[var(--color-accent)]/15" />
        </div>

{/* Main Content */}
<div className="hero-main relative flex-1 flex items-center justify-center pt-28 pb-8 px-6 lg:px-8">
  <div
    className={`hero-backdrop max-w-3xl mx-auto text-center`}
  >
    {/* Arabic Title Image */}
    <div className="mb-6">
      <Image
        src={TitleImage}
        alt="نهج البلاغة"
        className="h-20 sm:h-24 lg:h-32 w-auto mx-auto"
        priority
      />
    </div>

    {/* Decorative Ornament */}
    <div className={`flex items-center justify-center gap-4 mb-6 transition-all duration-1000 delay-200 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
      <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
      <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
    </div>

    {/* English Title */}
    <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-[var(--color-ink)] leading-[1.1] mb-4
      transition-all duration-1000 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      The Way of Eloquence
    </h1>

    {/* Subtitle */}
    <p className={`font-body text-sm sm:text-base text-[var(--color-charcoal)] max-w-2xl mx-auto leading-relaxed mb-2
      transition-all duration-1000 delay-400 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      Selections from the Words of the Commander of the Faithful
    </p>

    {/* Name */}
    <p className={`font-display text-lg sm:text-xl text-[var(--color-ink)] italic mb-8
      transition-all duration-1000 delay-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      ʿAlī ibn Abī Ṭālib
    </p>

    {/* Compiler Credit */}
    <div className={`compiled-cred transition-all duration-1000 delay-600 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-charcoal)] mb-1">
        Compiled by
      </p>
      <p className="font-display text-base text-[var(--color-ink)]">
        al-Sharīf al-Raḍī
      </p>
    </div>
  </div>
</div>



        {/* Content Type Cards */}
        <div className="hero-content-cards relative bg-[var(--color-cream)] py-8 lg:py-10">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
              {contentTypes.map((content, index) => (
                <Link
                  href={content.href}
                  key={content.label}
                  className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <div className="hero-content-card relative bg-white border border-[var(--color-stone)] p-6 lg:p-8 transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1">
                    {/* Count badge */}
                    {/* <div className="absolute top-4 right-4 text-xs tracking-[0.15em] text-[var(--color-warm-gray)]">
                      {content.count}
                    </div> */}

                    {/* Arabic */}
                    <div className="font-taha text-3xl text-[var(--color-primary)] mb-3 transition-colors duration-300 group-hover:text-[var(--color-primary-dark)]">
                      {content.arabic}
                    </div>

                    {/* English */}
                    <h3 className="font-display text-xl text-[var(--color-ink)] mb-1">
                      {content.label}
                    </h3>
                    <p className="text-sm text-[var(--color-warm-gray)]">
                      {content.description}
                    </p>

                    {/* Hover indicator line */}
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-[1px] w-0 bg-[var(--color-accent)] group-hover:w-8 transition-all duration-300" />
                      <span className="text-xs tracking-[0.15em] uppercase text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore
                      </span>
                    </div>

                    {/* Corner accents - appear on hover */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Raḍī's Introduction & Conclusion */}
        <div className="relative bg-[var(--color-cream)] py-6">
          {/* Decorative top line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[var(--color-stone)] to-transparent" />

          <div className="max-w-2xl mx-auto px-6">
            {/* Grid: 3 columns with diamond fixed in center */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* Left link - right aligned */}
              <Link
                href="/radis"
                className="group text-right"
              >
                <span className="font-display text-base text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                  Raḍī's Introduction
                </span>
              </Link>

              {/* Center ornament */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
                <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
              </div>

              {/* Right link - left aligned */}
              <Link
                href="/conclusions"
                className="group text-left"
              >
                <span className="font-display text-base text-[var(--color-warm-gray)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                  Raḍī's Conclusion
                </span>
              </Link>
            </div>
          </div>

          {/* Scroll Indicator - same grid centering approach */}
          <div className="max-w-2xl mx-auto px-6 mt-6">
            <div
              className={`grid grid-cols-[1fr_auto_1fr] transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              <div />
              <ChevronDown className="w-5 h-5 text-[var(--color-warm-gray)] opacity-50 animate-bounce" />
              <div />
            </div>
          </div>
        </div>

      </section>
    </>
  )
}

export default HeroSection

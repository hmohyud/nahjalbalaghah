"use client";
import React, { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { orationsApi, lettersApi, sayingsApi } from '@/api'

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
    <section className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-parchment)]">
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-cream)]" />
      </div>

      {/* Decorative corner - top left */}
      <div className="absolute top-28 left-8 lg:left-16 w-24 lg:w-32 h-24 lg:h-32 border-l-2 border-t-2 border-[var(--color-accent)]/30" />
      
      {/* Decorative corner - top right */}
      <div className="absolute top-28 right-8 lg:right-16 w-24 lg:w-32 h-24 lg:h-32 border-r-2 border-t-2 border-[var(--color-accent)]/30" />

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Arabic Title */}
          <div 
            className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="font-taha text-6xl sm:text-7xl lg:text-8xl text-[var(--color-primary)] leading-none tracking-wide">
              نهج البلاغة
            </span>
          </div>

          {/* Decorative Ornament */}
          <div 
            className={`flex items-center justify-center gap-4 mb-10 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>

          {/* English Title */}
          <h1 
            className={`font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[var(--color-ink)] leading-[1.1] mb-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            The Peak of Eloquence
          </h1>

          {/* Subtitle */}
          <p 
            className={`font-body text-base sm:text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto leading-relaxed mb-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Selections from the Words of the Commander of the Faithful
          </p>
          <p 
            className={`font-display text-xl sm:text-2xl text-[var(--color-charcoal)] italic mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            ʿAlī ibn Abī Ṭālib
          </p>

          {/* Compiler Credit */}
          <div 
            className={`mb-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-warm-gray)] mb-2">
              Compiled by
            </p>
            <p className="font-display text-lg text-[var(--color-charcoal)]">
              al-Sharīf al-Raḍī
            </p>
            <p className="text-sm text-[var(--color-warm-gray)] mt-1">
              10th Century CE
            </p>
          </div>

          {/* CTA */}
          <div 
            className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <Link href="/radis">
              <button className="group relative inline-flex items-center gap-4 px-8 py-4 bg-[var(--color-primary)] text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-[var(--color-primary-dark)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary)]/20 overflow-hidden">
                {/* Corner accents on hover */}
                <span className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-white/50 transition-all duration-300" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-white/50 transition-all duration-300" />
                <span>Begin Reading</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="relative bg-[var(--color-cream)] py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {contentTypes.map((content, index) => (
              <Link 
                href={content.href} 
                key={content.label}
                className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className="relative bg-white border border-[var(--color-stone)] p-8 lg:p-10 transition-all duration-500 hover:border-[var(--color-accent)] hover:shadow-2xl hover:shadow-[var(--color-primary)]/5 hover:-translate-y-2 overflow-hidden">
                  {/* Number badge */}
                  <div className="absolute top-6 right-6 text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)]">
                    {content.count}
                  </div>
                  
                  {/* Arabic */}
                  <div className="font-taha text-4xl text-[var(--color-primary)] mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-500">
                    {content.arabic}
                  </div>
                  
                  {/* English */}
                  <h3 className="font-display text-2xl text-[var(--color-ink)] mb-2">
                    {content.label}
                  </h3>
                  <p className="text-sm text-[var(--color-warm-gray)]">
                    {content.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-8 flex items-center gap-2 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 transition-all duration-500">
                    <span className="text-xs tracking-[0.15em] uppercase">Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Corner accent - top left on hover */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-500 transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                  
                  {/* Corner accent - bottom right on hover */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-500 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center gap-2 text-[var(--color-warm-gray)]">
          <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection

'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FileText, BookOpen, ScrollText, Bookmark, Info, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const MainCardsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const cards = [
    {
      icon: FileText,
      title: "Manuscripts",
      description: "Explore rare historical manuscripts from renowned libraries across the Islamic world",
      href: "/manuscripts",
      accent: true
    },
    {
      icon: BookOpen,
      title: "Indexes",
      description: "Browse comprehensive indexes including names, places, terms, and religious concepts",
      href: "/indexes",
      accent: false
    },
    {
      icon: ScrollText,
      title: "Introduction",
      description: "Read the enlightening introduction by al-Sharīf al-Raḍī, the compiler",
      href: "/radis",
      accent: false
    },
    {
      icon: Bookmark,
      title: "Conclusion",
      description: "Explore the concluding remarks on the completion of this monumental work",
      href: "/conclusions",
      accent: false
    },
    {
      icon: Info,
      title: "About",
      description: "Learn about the history, significance, and lasting impact of Nahj al-Balaghah",
      href: "/about-nahj-al-balaghah",
      accent: false
    }
  ]

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-parchment)] to-transparent opacity-50" />
      
      {/* Decorative corner - bottom left */}
      <div className="absolute bottom-16 left-16 w-40 h-40 border-l border-b border-[var(--color-stone)]" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 lg:mb-24">
          <div 
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-medium">
              Scholarly Resources
            </span>
          </div>
          
          <h2 
            className={`font-display text-4xl lg:text-5xl xl:text-6xl font-light text-[var(--color-ink)] mt-4 mb-6 leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Explore the Archive
          </h2>
          
          <div 
            className={`w-24 h-[2px] bg-[var(--color-accent)] transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 w-24' : 'opacity-0 w-0'}`}
          />
          
          <p 
            className={`text-[var(--color-warm-gray)] text-lg leading-relaxed mt-6 max-w-xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Access manuscripts, scholarly indexes, introductions, and supplementary materials 
            to deepen your understanding of this timeless text.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <Link 
              href={card.href} 
              key={card.title}
              className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <div className={`relative h-full p-8 lg:p-10 border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                card.accent 
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white hover:shadow-2xl hover:shadow-[var(--color-primary)]/20' 
                  : 'bg-white border-[var(--color-stone)] hover:border-[var(--color-accent)] hover:shadow-xl hover:shadow-black/5'
              }`}>
                {/* Icon */}
                <div className={`mb-6 transition-transform duration-500 group-hover:scale-110 ${
                  card.accent ? 'text-white/80' : 'text-[var(--color-primary)]'
                }`}>
                  <card.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className={`font-display text-2xl mb-3 ${
                  card.accent ? 'text-white' : 'text-[var(--color-ink)]'
                }`}>
                  {card.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  card.accent ? 'text-white/70' : 'text-[var(--color-warm-gray)]'
                }`}>
                  {card.description}
                </p>

                {/* Arrow */}
                <div className={`mt-8 flex items-center gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 ${
                  card.accent ? 'text-white/80' : 'text-[var(--color-primary)]'
                }`}>
                  <span className="text-xs tracking-[0.15em] uppercase font-medium">View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Corner accents - different style for accent card */}
                {card.accent ? (
                  <>
                    {/* Accent card: small corners, white */}
                    <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/20 group-hover:border-white/50 group-hover:w-10 group-hover:h-10 transition-all duration-500" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-white/20 group-hover:border-white/50 group-hover:w-10 group-hover:h-10 transition-all duration-500" />
                  </>
                ) : (
                  <>
                    {/* Regular card: corner grows on hover */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-2 border-r-2 border-transparent group-hover:w-12 group-hover:h-12 group-hover:border-[var(--color-accent)] transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 w-0 h-0 border-b border-l border-transparent group-hover:w-8 group-hover:h-8 group-hover:border-[var(--color-stone)] transition-all duration-500" />
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Ornament */}
        <div 
          className={`flex items-center justify-center gap-4 mt-20 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-stone)]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[var(--color-accent)]" />
          <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-stone)]" />
        </div>
      </div>
    </section>
  )
}

export default MainCardsSection

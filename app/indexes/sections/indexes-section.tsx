'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Languages, Bookmark, Scale, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const IndexesSection = () => {
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

  const indexes = [
    {
      icon: MapPin,
      title: "Names and Places",
      description: "Locate people, tribes, and geographic regions mentioned in Nahj al-Balaghah",
      href: "/indexes/names-places"
    },
    {
      icon: Languages,
      title: "Terms",
      description: "Understand key Arabic and Islamic terminology used throughout the text",
      href: "/indexes/terms"
    },
    {
      icon: Bookmark,
      title: "Qur'an & Hadith",
      description: "Find scriptural references, poetic verses, and traditional wisdom",
      href: "/indexes/quran-hadith"
    },
    {
      icon: Scale,
      title: "Religious Concepts",
      description: "Explore core values like justice, piety, and ethics",
      href: "/indexes/concepts"
    }
  ]

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div 
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-medium">
              Deeper Exploration
            </span>
          </div>
          
          <h2 
            className={`font-display text-4xl lg:text-5xl font-light text-[var(--color-ink)] mt-4 mb-6 leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Scholarly Indexes
          </h2>
          
          <div 
            className={`w-16 h-[2px] bg-[var(--color-accent)] transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          
          <p 
            className={`text-[var(--color-warm-gray)] text-lg leading-relaxed mt-6 max-w-xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Navigate Nahj al-Balaghah through comprehensive indexes of names, places, terms, and religious concepts.
          </p>
        </div>

        {/* Index Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {indexes.map((index, i) => (
            <Link 
              href={index.href} 
              key={index.title}
              className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="relative h-full p-8 bg-[var(--color-parchment)] border border-[var(--color-stone)] transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:bg-white hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                    <index.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-[var(--color-ink)] mb-2">{index.title}</h3>
                    <p className="text-sm text-[var(--color-warm-gray)] leading-relaxed">{index.description}</p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center gap-3 text-[var(--color-primary)]">
                  <div className="h-[1px] w-0 bg-[var(--color-accent)] group-hover:w-6 transition-all duration-300" />
                  <span className="text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Browse</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Corner accents on hover */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Ornament */}
        <div 
          className={`flex items-center justify-center gap-4 mt-20 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-stone)]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[var(--color-accent)]" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-stone)]" />
        </div>
      </div>
    </section>
  )
}

export default IndexesSection

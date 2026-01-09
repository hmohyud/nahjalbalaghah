'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FileText, BookOpen, Info, ArrowRight } from 'lucide-react'
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
      featured: true
    },
    {
      icon: BookOpen,
      title: "Indexes",
      description: "Browse comprehensive indexes including names, places, terms, and religious concepts",
      href: "/indexes",
      featured: false
    },
    {
      icon: Info,
      title: "About",
      description: "Learn about the history, significance, and lasting impact of Nahj al-Balaghah",
      href: "/about-nahj-al-balaghah",
      featured: false
    }
  ]

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-parchment)]/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 lg:mb-20">
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
            className={`w-16 h-[2px] bg-[var(--color-accent)] transition-all duration-700 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          
          <p 
            className={`text-[var(--color-warm-gray)] text-lg leading-relaxed mt-6 max-w-xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Access manuscripts, scholarly indexes, and supplementary materials 
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
              style={{ transitionDelay: `${400 + index * 80}ms` }}
            >
              {card.featured ? (
                // Featured card with always-visible corner framing
                <div className="relative">
                  {/* Corner brackets for featured card */}
                  <div className="absolute -top-2 -left-2 w-10 h-10 border-l-2 border-t-2 border-white/30" />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 border-r-2 border-b-2 border-white/30" />
                  
                  <div className="relative h-full p-8 lg:p-10 bg-[var(--color-primary)] text-white transition-all duration-300 hover:bg-[var(--color-primary-dark)] hover:shadow-xl hover:shadow-[var(--color-primary)]/15 hover:-translate-y-1">
                    <div className="mb-6 text-white/80">
                      <card.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-2xl text-white mb-3">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-white/70">{card.description}</p>
                    
                    <div className="mt-8 flex items-center gap-3 text-white/70">
                      <div className="h-[1px] w-0 bg-white/50 group-hover:w-6 transition-all duration-300" />
                      <span className="text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">View</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </div>
              ) : (
                // Regular cards with hover corner reveal
                <div className="relative h-full p-8 lg:p-10 bg-white border border-[var(--color-stone)] transition-all duration-300 hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1">
                  <div className="mb-6 text-[var(--color-primary)]">
                    <card.icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-2xl text-[var(--color-ink)] mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-warm-gray)]">{card.description}</p>
                  
                  <div className="mt-8 flex items-center gap-3 text-[var(--color-primary)]">
                    <div className="h-[1px] w-0 bg-[var(--color-accent)] group-hover:w-6 transition-all duration-300" />
                    <span className="text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">View</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Corner accents on hover - selection effect */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                </div>
              )}
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

export default MainCardsSection

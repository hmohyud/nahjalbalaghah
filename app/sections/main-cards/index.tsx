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
      title: "About Nahj al-Balaghah",
      description: "Learn about the history, significance, and lasting impact of Nahj al-Balaghah",
      href: "/about-nahj-al-balaghah",
      featured: false
    },
    {
      icon: Info,
      title: "About Us",
      description: "Learn about us and our partners, and how we are working to make Nahj al-Balaghah accessible to all",
      href: "/about-us",
      featured: false
    }
  ]

  return (
    <section ref={sectionRef} className="section-white">
      {/* Subtle background gradient */}
      <div className="main-cards-bg-gradient" />

      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-wrapper">
          <div
            className={`fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            <span className="section-label">
              Scholarly Resources
            </span>
          </div>

          <h2
            className={`section-title fade-in-up fade-delay-100 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            Explore the Archive
          </h2>

          <div
            className={`section-accent-bar fade-in-up fade-delay-200 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
          />

          <p
            className={`section-description fade-in-up fade-delay-300 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
          >
            Access manuscripts, scholarly indexes, and supplementary materials
            to deepen your understanding of this timeless text.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid-2-3">
          {cards.map((card, index) => (
            <Link
              href={card.href}
              key={card.title}
              className={`group block fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up-lg--hidden'}`}
              style={{ transitionDelay: `${400 + index * 80}ms` }}
            >
              {card.featured ? (
                // Featured card with always-visible corner framing
                <div className="relative">
                  {/* Corner brackets for featured card */}
                  <div className="main-card-featured__bracket main-card-featured__bracket--tl" />
                  <div className="main-card-featured__bracket main-card-featured__bracket--br" />

                  <div className="main-card-featured">
                    <div className="main-card-featured__icon">
                      <card.icon className="main-card-icon" strokeWidth={1.5} />
                    </div>
                    <h3 className="main-card-featured__title">{card.title}</h3>
                    <p className="main-card-featured__desc">{card.description}</p>

                    <div className="card-hover-indicator">
                      <div className="card-hover-indicator__line card-hover-indicator__line--white" />
                      <span className="card-hover-indicator__label">View</span>
                      <ArrowRight className="main-card-arrow" />
                    </div>
                  </div>
                </div>
              ) : (
                // Regular cards with hover corner reveal
                <div className="main-card-regular">
                  <div className="main-card-regular__icon">
                    <card.icon className="main-card-icon" strokeWidth={1.5} />
                  </div>
                  <h3 className="main-card-regular__title">{card.title}</h3>
                  <p className="main-card-regular__desc">{card.description}</p>

                  <div className="card-hover-indicator">
                    <div className="card-hover-indicator__line card-hover-indicator__line--accent" />
                    <span className="card-hover-indicator__label">View</span>
                    <ArrowRight className="main-card-arrow" />
                  </div>

                  {/* Corner accents on hover - selection effect */}
                  <div className="corner-accent-hover corner-accent-hover--top-left" />
                  <div className="corner-accent-hover corner-accent-hover--bottom-right" />
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Bottom Ornament */}
        <div
          className={`section-ornament fade-in-up fade-delay-1000 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
        >
          <div className="section-ornament__line section-ornament__line--to-right" />
          <div className="section-ornament__diamond" />
          <div className="section-ornament__line section-ornament__line--to-left" />
        </div>
      </div>
    </section>
  )
}

export default MainCardsSection

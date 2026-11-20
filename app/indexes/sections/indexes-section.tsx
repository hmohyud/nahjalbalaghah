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
      href: "/indexes/religious-concepts"
    }
  ]

  return (
    <section ref={sectionRef} className="indexes-section">
      <div className="indexes-section__container">
        {/* Header */}
        <div className="indexes-section__header">
          <div
            className={`indexes-section__animate ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden'}`}
          >
            <span className="indexes-section__label">
              Deeper Exploration
            </span>
          </div>

          <h2
            className={`indexes-section__title indexes-section__animate indexes-section__animate--delay-100 ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden'}`}
          >
            Scholarly Indexes
          </h2>

          <div
            className={`indexes-section__accent-line indexes-section__animate indexes-section__animate--delay-200 ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden-fade'}`}
          />

          <p
            className={`indexes-section__description indexes-section__animate indexes-section__animate--delay-300 ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden'}`}
          >
            Navigate Nahj al-Balaghah through comprehensive indexes of names, places, terms, and religious concepts.
          </p>
        </div>

        {/* Index Cards */}
        <div className="indexes-section__grid">
          {indexes.map((index, i) => (
            <Link
              href={index.href}
              key={index.title}
              className={`indexes-section__card-link indexes-section__animate ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden-far'}`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="indexes-section__card">
                <div className="indexes-section__card-content">
                  <div className="indexes-section__card-icon-box">
                    <index.icon className="indexes-section__card-icon" />
                  </div>
                  <div className="indexes-section__card-body">
                    <h3 className="indexes-section__card-title">{index.title}</h3>
                    <p className="indexes-section__card-desc">{index.description}</p>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="indexes-section__card-hover-indicator">
                  <div className="indexes-section__card-hover-line" />
                  <span className="indexes-section__card-hover-text">Browse</span>
                  <ArrowRight className="w-4 h-4 indexes-section__card-hover-arrow" />
                </div>

                {/* Corner accents on hover */}
                <div className="indexes-section__card-corner indexes-section__card-corner--top-left" />
                <div className="indexes-section__card-corner indexes-section__card-corner--bottom-right" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Ornament */}
        <div
          className={`indexes-section__bottom-ornament indexes-section__animate indexes-section__animate--delay-1000 ${isVisible ? 'indexes-section__animate--visible' : 'indexes-section__animate--hidden-fade'}`}
        >
          <div className="indexes-section__ornament-line--right" />
          <div className="indexes-section__ornament-diamond" />
          <div className="indexes-section__ornament-line--left" />
        </div>
      </div>
    </section>
  )
}

export default IndexesSection

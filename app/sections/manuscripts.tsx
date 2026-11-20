'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { manuscriptsApi, Manuscript, toPageImage } from '@/api/manuscripts'

const FeaturedManuscriptsSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        setLoading(true)
        const response = await manuscriptsApi.getAllManuscripts(1, 6)
        setManuscripts(response.data.slice(0, 3))
      } catch (err) {
        console.error('Error fetching manuscripts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchManuscripts()
  }, [])

  return (
    <section ref={sectionRef} className="section-dark section-dark--manuscripts">
      {/* Subtle dot pattern */}
      <div className="dot-pattern dot-pattern--manuscripts" />

      {/* Section frame corners - subtle, atmospheric */}
      <div className="corner-frame corner-frame--top-left corner-frame--gold" />
      <div className="corner-frame corner-frame--bottom-right corner-frame--gold" />

      <div className="section-container section-container--relative-z20">
        {/* Header */}
        <div className="manuscripts-header">
          <div>
            <span
              className={`section-label text-gold fade-in-up ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
            >
              Historical Treasures
            </span>
            <h2
              className={`section-title section-title--white fade-in-up fade-delay-100 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
            >
              Featured Manuscripts
            </h2>
            <div
              className={`section-accent-bar bg-gold mt-6 fade-in-up fade-delay-200 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
            />
          </div>

          <Link
            href="/manuscripts"
            className={`manuscripts-view-all group ${isVisible ? 'manuscripts-view-all--visible' : 'manuscripts-view-all--hidden'}`}
          >
            <span className="manuscripts-view-all__text">View All Manuscripts</span>
            <ArrowRight className="manuscripts-view-all__arrow" />
          </Link>
        </div>

        {/* Manuscripts Grid */}
        {loading ? (
          <div className="manuscripts-loading">
            <Loader2 className="manuscripts-spinner" />
          </div>
        ) : manuscripts.length > 0 ? (
          <div className="grid-3">
            {manuscripts.map((manuscript, index) => (
              <Link
                href={`/manuscripts/${manuscript.id}`}
                key={manuscript.id}
                className={`group block fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up-lg--hidden'}`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div className="relative-wrapper">
                  {/* Image container */}
                  <div className="manuscript-card-image bg-manuscript-dark">
                    {manuscript.files && manuscript.files.length > 0 ? (
                      <img
                        src={toPageImage(manuscript.files[0]).preview}
                        alt={manuscript.files[0].alternativeText || manuscript.bookName || 'Manuscript'}
                      />
                    ) : (
                      <div className="manuscript-no-image">
                        <span className="manuscript-no-image__text">No Image</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="manuscript-card-overlay" />
                  </div>

                  {/* Content */}
                  <div className="manuscript-card-content">
                    {manuscript.gregorianYear && (
                      <div className="manuscript-card-year text-gold">
                        {manuscript.gregorianYear}
                      </div>
                    )}
                    <h3 className="manuscript-card-title line-clamp-2 text-white-full">
                      {manuscript.bookName || `Section ${manuscript.section}`}
                    </h3>
                    {manuscript.holdingInstitution && (
                      <p className="manuscript-card-institution line-clamp-1 text-white-muted">
                        {manuscript.holdingInstitution}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="manuscripts-empty">
            <p>No manuscripts available</p>
          </div>
        )}

        {/* Bottom ornament */}
        <div
          className={`section-ornament fade-in-up fade-delay-1000 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
        >
          <div className="section-ornament__line section-ornament__line--light-right" />
          <div className="section-ornament__diamond--bordered border-gold" />
          <div className="section-ornament__line section-ornament__line--light-left" />
        </div>
      </div>
    </section>
  )
}

export default FeaturedManuscriptsSection

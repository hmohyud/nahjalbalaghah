'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { manuscriptsApi, Manuscript, getManuscriptImageUrl } from '@/api/manuscripts'

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
    <section ref={sectionRef} className="section-dark" style={{ backgroundColor: '#1A1816' }}>
      {/* Subtle dot pattern */}
      <div
        className="dot-pattern"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Section frame corners - subtle, atmospheric */}
      <div className="corner-frame corner-frame--top-left" style={{ borderColor: 'rgba(184, 149, 107, 0.15)' }} />
      <div className="corner-frame corner-frame--bottom-right" style={{ borderColor: 'rgba(184, 149, 107, 0.15)' }} />

      <div className="section-container relative z-20">
        {/* Header */}
        <div className="manuscripts-header">
          <div>
            <span
              className={`section-label fade-in-up ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
              style={{ color: '#B8956B' }}
            >
              Historical Treasures
            </span>
            <h2
              className={`section-title section-title--white fade-in-up fade-delay-100 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
              style={{ color: '#FFFFFF' }}
            >
              Featured Manuscripts
            </h2>
            <div
              className={`section-accent-bar mt-6 fade-in-up fade-delay-200 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
              style={{ backgroundColor: '#B8956B' }}
            />
          </div>

          <Link
            href="/manuscripts"
            className={`manuscripts-view-all group ${isVisible ? 'opacity-60' : 'opacity-0'}`}
            style={{ color: '#FFFFFF' }}
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
                <div className="relative">
                  {/* Image container */}
                  <div className="manuscript-card-image" style={{ backgroundColor: '#2C2825' }}>
                    {manuscript.files && manuscript.files.length > 0 ? (
                      <img
                        src={getManuscriptImageUrl(manuscript.files[0].url)}
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
                      <div className="manuscript-card-year" style={{ color: '#B8956B' }}>
                        {manuscript.gregorianYear}
                      </div>
                    )}
                    <h3 className="manuscript-card-title line-clamp-2" style={{ color: '#FFFFFF' }}>
                      {manuscript.bookName || `Section ${manuscript.section}`}
                    </h3>
                    {manuscript.holdingInstitution && (
                      <p className="manuscript-card-institution line-clamp-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
          <div className="section-ornament__diamond--bordered" style={{ borderColor: '#B8956B' }} />
          <div className="section-ornament__line section-ornament__line--light-left" />
        </div>
      </div>
    </section>
  )
}

export default FeaturedManuscriptsSection

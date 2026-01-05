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
        setManuscripts(response.data.slice(0, 3)) // Show only 3 featured
      } catch (err) {
        console.error('Error fetching manuscripts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchManuscripts()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-[var(--color-ink)] overflow-hidden">
      {/* Subtle pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Decorative corner - top left */}
      <div className="absolute top-12 left-12 w-32 h-32 border-l border-t border-[var(--color-accent)]/20" />
      
      {/* Decorative corner - bottom right */}
      <div className="absolute bottom-12 right-12 w-32 h-32 border-r border-b border-[var(--color-accent)]/20" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <span 
              className={`text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-medium transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              Historical Treasures
            </span>
            <h2 
              className={`font-display text-4xl lg:text-5xl font-light text-white mt-4 leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              Featured Manuscripts
            </h2>
            <div 
              className={`w-24 h-[2px] bg-[var(--color-accent)] mt-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 w-24' : 'opacity-0 w-0'}`}
            />
          </div>
          
          <Link 
            href="/manuscripts"
            className={`group inline-flex items-center gap-3 text-white/60 hover:text-white transition-all duration-500 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <span className="text-sm tracking-[0.1em] uppercase">View All Manuscripts</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Manuscripts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
          </div>
        ) : manuscripts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {manuscripts.map((manuscript, index) => (
              <Link 
                href={`/manuscripts/${manuscript.id}`}
                key={manuscript.id}
                className={`group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div className="relative overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-charcoal)]">
                    {manuscript.files && manuscript.files.length > 0 ? (
                      <img
                        src={getManuscriptImageUrl(manuscript.files[0].url)}
                        alt={manuscript.files[0].alternativeText || manuscript.bookName || 'Manuscript'}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/30 font-display text-lg">No Image</span>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Corner accents on hover - top right */}
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                    
                    {/* Corner accents on hover - bottom left */}
                    <div className="absolute bottom-20 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {manuscript.gregorianYear && (
                      <div className="text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] mb-2">
                        {manuscript.gregorianYear}
                      </div>
                    )}
                    <h3 className="font-display text-2xl text-white mb-2 line-clamp-2">
                      {manuscript.bookName || `Section ${manuscript.section}`}
                    </h3>
                    {manuscript.holdingInstitution && (
                      <p className="text-sm text-white/60 line-clamp-1">
                        {manuscript.holdingInstitution}
                      </p>
                    )}
                    {manuscript.siglaEnglish && (
                      <p className="text-xs text-white/40 mt-1">
                        {manuscript.siglaEnglish}
                      </p>
                    )}
                  </div>

                  {/* Full border on hover */}
                  <div className="absolute inset-0 border-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50">No manuscripts available</p>
          </div>
        )}

        {/* Bottom decorative element */}
        <div 
          className={`flex items-center justify-center gap-4 mt-20 transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[var(--color-accent)]" />
          <div className="w-20 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
    </section>
  )
}

export default FeaturedManuscriptsSection

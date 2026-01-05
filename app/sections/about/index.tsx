'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'
import { orationsApi, lettersApi, sayingsApi } from '@/api'

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ orations: 241, letters: 79, sayings: 489 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [orationsRes, lettersRes, sayingsRes] = await Promise.all([
          orationsApi.getOrations(1, 1),
          lettersApi.getLetters(1, 1),
          sayingsApi.getSayings(1, 1)
        ])
        setCounts({
          orations: orationsRes.meta.pagination.total,
          letters: lettersRes.meta.pagination.total,
          sayings: sayingsRes.meta.pagination.total
        })
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }
    fetchCounts()
  }, [])

  const stats = [
    { value: counts.orations.toString(), label: 'Sermons' },
    { value: counts.letters.toString(), label: 'Letters' },
    { value: counts.sayings.toString(), label: 'Sayings' },
    { value: '1000+', label: 'Years' },
  ]

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-[var(--color-parchment)] overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative corner - top right */}
      <div className="absolute top-16 right-16 w-24 h-24 border-t border-r border-[var(--color-accent)]/20" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column - Content */}
          <div>
            <div 
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <span className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)] font-medium">
                About the Text
              </span>
            </div>

            <h2 
              className={`font-display text-4xl lg:text-5xl font-light text-[var(--color-ink)] mt-4 mb-8 leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              A Treasury of<br />
              <span className="italic">Islamic Wisdom</span>
            </h2>

            <div 
              className={`w-24 h-[2px] bg-[var(--color-accent)] mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 w-24' : 'opacity-0 w-0'}`}
            />

            <div 
              className={`space-y-6 text-[var(--color-charcoal)] leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p>
                <span className="font-display text-xl italic text-[var(--color-primary)]">Nahj al-Balaghah</span>, 
                meaning "Peak of Eloquence," is a collection of sermons, letters, and sayings attributed 
                to Imam Ali ibn Abi Talib, compiled by Sharif al-Radi in the 10th century CE.
              </p>
              <p className="text-[var(--color-warm-gray)]">
                This masterwork addresses themes of governance, justice, spirituality, and ethics 
                with profound eloquence. Its Arabic prose is considered second only to the Quran 
                in linguistic beauty and depth, transcending sectarian and cultural boundaries 
                to inspire readers across the centuries.
              </p>
            </div>

            {/* Stats with corner accents */}
            <div 
              className={`relative mt-12 pt-12 border-t border-[var(--color-stone)] transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {/* Subtle corner accent on stats container */}
              <div className="absolute -top-px left-0 w-8 h-[2px] bg-[var(--color-accent)]" />
              
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center group">
                    <div className="font-display text-3xl lg:text-4xl text-[var(--color-primary)] mb-1 group-hover:text-[var(--color-accent)] transition-colors duration-300">
                      {stat.value}
                    </div>
                    <div className="text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quote Card */}
          <div 
            className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
          >
            <div className="relative bg-white p-10 lg:p-14 border border-[var(--color-stone)] group hover:border-[var(--color-accent)]/50 transition-all duration-500 hover:shadow-xl">
              {/* Decorative corner - top left - always visible */}
              <div className="absolute -top-3 -left-3 w-24 h-24 border-l-2 border-t-2 border-[var(--color-accent)] transition-all duration-500 group-hover:w-28 group-hover:h-28 group-hover:-top-4 group-hover:-left-4" />
              
              {/* Decorative corner - bottom right - always visible */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-r-2 border-b-2 border-[var(--color-accent)] transition-all duration-500 group-hover:w-28 group-hover:h-28 group-hover:-bottom-4 group-hover:-right-4" />
              
              {/* Small inner corners on hover */}
              <div className="absolute top-6 right-6 w-0 h-0 border-t border-r border-transparent group-hover:w-6 group-hover:h-6 group-hover:border-[var(--color-stone)] transition-all duration-500" />
              <div className="absolute bottom-6 left-6 w-0 h-0 border-b border-l border-transparent group-hover:w-6 group-hover:h-6 group-hover:border-[var(--color-stone)] transition-all duration-500" />
              
              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-[var(--color-accent)]/30 mb-6" />
              
              {/* Quote Text */}
              <blockquote className="font-display text-2xl lg:text-3xl text-[var(--color-ink)] leading-relaxed italic mb-8">
                "The worth of a man lies in what he does well."
              </blockquote>
              
              {/* Attribution */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-[var(--color-accent)]" />
                <div>
                  <p className="font-display text-lg text-[var(--color-charcoal)]">
                    Imam Ali ibn Abi Talib
                  </p>
                  <p className="text-sm text-[var(--color-warm-gray)]">
                    Nahj al-Balaghah, Saying 81
                  </p>
                </div>
              </div>

              {/* Arabic text */}
              <div className="mt-10 pt-8 border-t border-[var(--color-stone)]">
                <p className="font-taha text-2xl text-[var(--color-primary)] text-right leading-loose">
                  قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

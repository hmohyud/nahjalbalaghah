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

  return (
    <section ref={sectionRef} className="section-parchment">
      {/* Subtle background texture */}
      <div
        className="subtle-texture"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-container relative">
        <div className="about-content-grid">
          {/* Left Column - Content */}
          <div>
            <div
              className={`fade-in-up ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
            >
              <span className="section-label">
                About the Text
              </span>
            </div>

            <h2
              className={`section-title mb-8 fade-in-up fade-delay-100 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
            >
              A Treasury of<br />
              <span className="italic">Islamic Wisdom</span>
            </h2>

            <div
              className={`section-accent-bar mb-8 fade-in-up fade-delay-200 ${isVisible ? 'fade-in--visible' : 'fade-in--hidden'}`}
            />

            <div
              className={`about-body-text fade-in-up fade-delay-300 ${isVisible ? 'fade-in-up--visible' : 'fade-in-up--hidden'}`}
            >
              <p>
                <span className="about-lead-text">Nahj al-Balaghah</span>,
                meaning "Way of Eloquence," is a collection of sermons, letters, and sayings attributed
                to Imam Ali ibn Abi Talib, compiled by Sharif al-Radi in the 10th century CE.
              </p>
              <p className="about-secondary-text">
                This masterwork addresses themes of governance, justice, spirituality, and ethics
                with profound eloquence. Its Arabic prose is considered second only to the Quran
                in linguistic beauty and depth, transcending sectarian and cultural boundaries
                to inspire readers across the centuries.
              </p>
            </div>
          </div>

          {/* Right Column - Quote Card with corner framing */}
          <div
            className={`fade-in-up--slow fade-delay-400 ${isVisible ? 'fade-in-right--visible' : 'fade-in-right--hidden'}`}
          >
            {/* Outer wrapper for corner brackets */}
            <div className="relative">
              {/* Corner brackets - positioned outside the card */}
              <div className="about-quote-bracket about-quote-bracket--top-left" />
              <div className="about-quote-bracket about-quote-bracket--bottom-right" />

              {/* The card itself */}
              <div className="about-quote-card">
                {/* Quote Icon */}
                <Quote className="about-quote-icon" strokeWidth={1} />

                {/* Quote Text */}
                <blockquote className="about-quote-text">
                  "The worth of a man lies in what he does well."
                </blockquote>

                {/* Attribution */}
                <div className="about-quote-attribution">
                  <div className="about-quote-attribution__line" />
                  <div>
                    <p className="about-attribution-name">
                      Imam Ali ibn Abi Talib
                    </p>
                    <p className="about-attribution-source">
                      Nahj al-Balaghah, Saying 81
                    </p>
                  </div>
                </div>

                {/* Arabic text */}
                <div className="about-quote-arabic">
                  <p className="about-quote-arabic-text">
                    قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

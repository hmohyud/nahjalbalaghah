"use client";
import React, { useState, useEffect } from 'react'
import { BookOpen, Star, Heart, Calendar, MapPin } from 'lucide-react'

const AboutUsHero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const values = [
    {
      icon: BookOpen,
      title: "Knowledge",
      description: "Providing authentic Islamic scholarship rooted in classical tradition and contemporary understanding"
    },
    {
      icon: Heart,
      title: "Community",
      description: "Fostering a global network of learners united in faith, scholarship, and spiritual development"
    },
    {
      icon: Star,
      title: "Excellence",
      description: "Maintaining rigorous academic standards while creating an accessible learning environment"
    }
  ]

  return (
    <section className="about-us-hero">
      {/* Background pattern */}
      <div className="about-us-hero__bg-pattern bg-pattern-cross" />

      <div className="about-us-hero__container">
        {/* Header */}
        <div
          className={`about-us-hero__header transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="about-us-hero__subtitle">
            Our Mission & Values
          </p>
          <h1 className="about-us-hero__title">
            About Our Institution
          </h1>

          {/* Decorative ornament */}
          <div className="about-us-hero__ornament">
            <div className="about-us-hero__ornament-line about-us-hero__ornament-line--right" />
            <div className="about-us-hero__ornament-diamond" />
            <div className="about-us-hero__ornament-line about-us-hero__ornament-line--left" />
          </div>

          <p className="about-us-hero__description">
            A global center for Islamic scholarship and spiritual education
          </p>
        </div>

        {/* Who We Are - Centered Card */}
        <div
          className={`about-us-hero__header transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="about-us-hero__card">
            {/* Corner accents */}
            <div className="about-us-hero__card-corner about-us-hero__card-corner--tl" />
            <div className="about-us-hero__card-corner about-us-hero__card-corner--br" />

            <div className="about-us-hero__card-body">
              <h2 className="about-us-hero__card-title">Who We Are</h2>
              <div className="about-us-hero__card-text">
                <p>
                  Established in 2005, we are an internationally recognized institution dedicated to
                  Islamic education and scholarship. Our focus centers on the teachings of Nahj al-Balaghah,
                  the profound wisdom of Imam Ali (AS), and comprehensive Quranic studies.
                </p>
                <p>
                  We serve a diverse community of over 10,000 students across 45 countries, offering
                  structured programs in Islamic sciences, jurisprudence, and spiritual development
                  under the guidance of distinguished scholars.
                </p>
              </div>

              {/* Meta info */}
              <div className="about-us-hero__meta">
                <div className="about-us-hero__meta-item">
                  <MapPin size={16} className="about-us-hero__meta-icon" />
                  <span>Based in Qom, Iran</span>
                </div>
                <div className="about-us-hero__meta-item">
                  <Calendar size={16} className="about-us-hero__meta-icon" />
                  <span>Since {currentYear - 20}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div
          className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="about-us-hero__values-title">
            Our Values
          </h2>

          <div className="about-us-hero__values-grid">
            {values.map((value) => (
              <div
                key={value.title}
                className="about-us-hero__value-card"
              >
                <div className="about-us-hero__value-icon">
                  <value.icon />
                </div>
                <h3 className="about-us-hero__value-title">{value.title}</h3>
                <p className="about-us-hero__value-desc">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUsHero

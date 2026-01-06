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
    <section className="relative bg-[var(--color-parchment)] pt-32 lg:pt-36 pb-20">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
            Our Mission & Values
          </p>
          <h1 className="font-display text-4xl lg:text-6xl text-[var(--color-ink)] mb-6">
            About Our Institution
          </h1>
          
          {/* Decorative ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>
          
          <p className="font-body text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto">
            A global center for Islamic scholarship and spiritual education
          </p>
        </div>

        {/* Who We Are - Centered Card */}
        <div 
          className={`mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="relative bg-white border border-[var(--color-stone)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

            <div className="p-8 lg:p-12">
              <h2 className="font-display text-2xl text-[var(--color-primary)] mb-6 text-center">Who We Are</h2>
              <div className="max-w-3xl mx-auto space-y-4 font-body text-[var(--color-charcoal)] leading-relaxed text-center">
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
              <div className="mt-8 pt-6 border-t border-[var(--color-stone)] flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-sm text-[var(--color-warm-gray)] font-body">
                  <MapPin size={16} className="text-[var(--color-primary)]" />
                  <span>Based in Qom, Iran</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-warm-gray)] font-body">
                  <Calendar size={16} className="text-[var(--color-primary)]" />
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
          <h2 className="font-display text-2xl text-[var(--color-primary)] mb-8 text-center">
            Our Values
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="relative bg-white border border-[var(--color-stone)] p-6 text-center"
              >
                <div className="w-14 h-14 bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl text-[var(--color-ink)] mb-3">{value.title}</h3>
                <p className="font-body text-[var(--color-warm-gray)] text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUsHero

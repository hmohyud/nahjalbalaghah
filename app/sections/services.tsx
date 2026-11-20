"use client";
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, Users, Globe, Heart, Scroll, Lightbulb, MessageCircle, Download, Play } from 'lucide-react'
import Image from 'next/image';

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(true)

  const services = [
    {
      id: 1,
      icon: BookOpen,
      title: "Digital Nahj al-Balaghah Library",
      description: "Access the complete collection of sermons, letters, and sayings in multiple formats",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=faces",
    },
    {
      id: 2,
      icon: Search,
      title: "Advanced Text Search",
      description: "Find specific teachings by topic, theme, or keyword across Nahj al-Balaghah",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      icon: Globe,
      title: "Multi-Language Translations",
      description: "Read Nahj al-Balaghah in Arabic, English, Urdu, Persian, and more languages",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      icon: Lightbulb,
      title: "Scholarly Commentary",
      description: "Access classical and modern commentaries on Nahj al-Balaghah",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      icon: MessageCircle,
      title: "Community Discussions",
      description: "Join discussions and share insights on the teachings of Imam Ali (AS)",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop",
    }
  ]

  return (
    <section id="services-section" className="section-gradient-gray">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="services-section-intro"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="services-section__label-row"
          >
            <div className="services-dots">
              <div className="services-dot"></div>
              <div className="services-dot services-dot--faded"></div>
              <div className="services-dot"></div>
            </div>
            <span className="services-label">What We Offer</span>
            <div className="services-dots">
              <div className="services-dot"></div>
              <div className="services-dot services-dot--faded"></div>
              <div className="services-dot"></div>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="services-title"
          >
            Our Services
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="services-accent-bar"
          ></motion.div>
        </motion.div>
        <div className="grid-1-2-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
              className="service-card__wrapper group"
            >
              <div className="service-card">
                <div className="service-card__image-wrapper">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={100}
                    height={100}
                    className="service-card__image"
                  />
                  <div className="service-card__gradient-overlay"></div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                    className="service-card__icon-box"
                  >
                    <service.icon className="service-card__icon" />
                  </motion.div>
                </div>
                <div className="service-card__body">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
                    className="service-card__title"
                  >
                    {service.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                    className="service-card__desc"
                  >
                    {service.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 + (index * 0.1) }}
                    className="service-card__link"
                  >
                    <span className="service-card__learn-more-text">Learn More</span>
                    <svg className="service-card__learn-more-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection

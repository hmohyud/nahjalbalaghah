"use client";
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Twitter, Facebook, Linkedin, Youtube, Heart } from 'lucide-react'
import { Button } from '@/app/components/ui';

const IslamicScholarsSection = () => {
  const [isVisible, setIsVisible] = useState(true)

  const scholars = [
    {
      id: 1,
      name: "Bilal Hatim",
      title: "Founder & COO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format",
      socialLinks: {
        twitter: "#",
        facebook: "#",
        linkedin: "#",
        youtube: "#"
      }
    },
    {
      id: 2,
      name: "Ali Hammam",
      title: "Islamic Scholar",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format",
      socialLinks: {
        twitter: "#",
        facebook: "#",
        linkedin: "#",
        youtube: "#"
      }
    },
    {
      id: 3,
      name: "Nasira Sheikh",
      title: "Volunteer",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&auto=format",
      socialLinks: {
        twitter: "#",
        facebook: "#",
        linkedin: "#",
        youtube: "#"
      }
    }
  ]

  return (
    <section id="scholars-section" className="section-gradient-gray">
      <div className="scholars-bg-blur">
        <div className="scholars-bg-circle--left"></div>
        <div className="scholars-bg-circle--right"></div>
      </div>
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="section-centered-intro"
        >
          <div className="scholars-badge">
            <BookOpen className="scholars-badge__icon" />
            <span className="scholars-badge__text">
              MEET THE EXPERTS
            </span>
          </div>
          <h1 className="scholars-title">
            Islamic <span>Scholars</span>
          </h1>
          <div className="scholars-divider-wrapper">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="scholars-divider"
            >
              <div className="scholars-divider__line"></div>
              <div className="scholars-divider__dot scholars-divider__dot--center"></div>
              <div className="scholars-divider__dot scholars-divider__dot--left"></div>
              <div className="scholars-divider__dot scholars-divider__dot--right"></div>
            </motion.div>
          </div>
          <p className="scholars-description">
            Meet our dedicated team of Islamic scholars and experts who guide our mission
            with their profound knowledge and unwavering commitment to serving humanity.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid-1-2-3"
        >
          {scholars.map((scholar, index) => (
            <motion.div
              key={scholar.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 + (index * 0.2) }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group scholar-card"
            >
              <div className="scholar-card__image-wrapper">
                <div className="scholar-card__image-gradient">
                  <img
                    src={scholar.image}
                    alt={scholar.name}
                    className="scholar-card__image"
                  />
                  <div className="scholar-card__hover-overlay"></div>
                </div>
              </div>
              <div className="scholar-card__body">
                <div className="mb-6">
                  <h3 className="scholar-card__name">
                    {scholar.name}
                  </h3>
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "60px" }}
                      transition={{ duration: 1, delay: 1 + (index * 0.2) }}
                      className="scholar-card__name-divider"
                    />
                  </div>
                  <p className="scholar-card__title">
                    {scholar.title}
                  </p>
                </div>
                <div className="scholar-card__socials">
                  <motion.a
                    href={scholar.socialLinks.twitter}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="scholar-card__social-link"
                  >
                    <Twitter className="scholar-card__social-icon" />
                  </motion.a>
                  <motion.a
                    href={scholar.socialLinks.facebook}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="scholar-card__social-link"
                  >
                    <Facebook className="scholar-card__social-icon" />
                  </motion.a>
                  <motion.a
                    href={scholar.socialLinks.linkedin}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="scholar-card__social-link"
                  >
                    <Linkedin className="scholar-card__social-icon" />
                  </motion.a>
                  <motion.a
                    href={scholar.socialLinks.youtube}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="scholar-card__social-link"
                  >
                    <Youtube className="scholar-card__social-icon" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="section-bottom-action"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex justify-center'
          >
            <Button variant='solid' icon={<Heart size={16} />} >Meet All Our Scholars</Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default IslamicScholarsSection

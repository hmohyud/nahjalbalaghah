'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Heart, Award, Sparkles, Globe, Target, TrendingUp, Shield } from 'lucide-react'
import { Button } from '@/app/components/ui'
import Image from 'next/image'
import AboutImage from '@/app/assets/images/about.svg'

const ImpactCommunitySection = () => {
  const [isVisible, setIsVisible] = useState(true)

  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving students and scholars across 45+ countries worldwide"
    },
    {
      icon: Target,
      title: "Focused Mission",
      description: "Dedicated to authentic Islamic education and spiritual growth"
    },
    {
      icon: TrendingUp,
      title: "Growing Impact",
      description: "Continuously expanding our educational programs and resources"
    },
    {
      icon: Shield,
      title: "Trusted Source",
      description: "Recognized authority in Islamic scholarship and teachings"
    }
  ]

  return (
    <section id="impact-section" className="community-section">
      <div className="community-section__container">
        <div className="community-section__grid">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="community-section__text-col"
          >
            <div className="community-section__header">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="community-section__badge"
              >
                <Sparkles className="w-6 h-6 community-section__badge-icon" />
                <span className="community-section__badge-text">Making a Difference</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="community-section__title"
              >
                Our <span className="community-section__title-accent">Impact & Community</span>
              </motion.h2>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="community-section__divider"
              ></motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="community-section__body"
            >
              <p>
                Since our founding, we have built a <span className="highlight">thriving global community</span> of learners, scholars, and spiritual seekers. Our educational programs and resources have touched the lives of thousands across continents, fostering understanding and spiritual growth.
              </p>

              <p>
                Through innovative online platforms, traditional scholarship programs, and community outreach initiatives, we continue to bridge the gap between ancient wisdom and modern learning, creating lasting impact in communities worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="community-section__features-grid"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                  className="community-section__feature-card"
                >
                  <div className="community-section__feature-row">
                    <div className="community-section__feature-icon-box">
                      <feature.icon className="w-5 h-5 community-section__feature-icon" />
                    </div>
                    <div>
                      <h3 className="community-section__feature-title">{feature.title}</h3>
                      <p className="community-section__feature-desc">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="community-section__image-col"
          >
            <div>
              <div>
                <Image
                  src={AboutImage}
                  alt="Our Community Impact"
                  className="community-section__image"
                />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="community-section__float-card community-section__float-card--top"
                >
                  <div className="community-section__float-row">
                    <div className="community-section__float-icon-box">
                      <Users className="w-6 h-6 community-section__float-icon" />
                    </div>
                    <div>
                      <div className="community-section__float-value">10K+</div>
                      <div className="community-section__float-label">Active Students</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="community-section__float-card community-section__float-card--bottom"
                >
                  <div className="community-section__float-row">
                    <div className="community-section__float-icon-box">
                      <Globe className="w-6 h-6 community-section__float-icon" />
                    </div>
                    <div>
                      <div className="community-section__float-value">45+</div>
                      <div className="community-section__float-label">Countries</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ImpactCommunitySection

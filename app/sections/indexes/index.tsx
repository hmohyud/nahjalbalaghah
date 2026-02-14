'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, MapPin, Bookmark, ScrollText, Languages, Scale } from 'lucide-react'
import Button from '@/app/components/button'
import Link from 'next/link'

const IndexesSection = () => {
  const indexes = [
    {
      icon: MapPin,
      title: "Index of Names and Places",
      description: "Locate people, tribes, and geographic regions mentioned in Nahj al-Balaghah"
    },
    {
      icon: Languages,
      title: "Index of Terms",
      description: "Understand key Arabic and Islamic terminology used in the sermons, letters, and sayings of Nahj al-Balaghah"
    },
    {
      icon: Bookmark,
      title: "Index of Qur'an, Hadith, Poetry, and Proverbs",
      description: "Find scriptural references, poetic verses, and traditional wisdom quoted throughout Nahj al-Balaghah"
    },
    {
      icon: Scale,
      title: "Index of Religious and Ethical Concepts",
      description: "Explore core values and concepts like justice, piety, and ethics as emphasized by Imam Ali in Nahj al-Balaghah"
    }
  ]

  return (
    <section id="indexes-section" className="section-white">
      <div className="section-container relative">
        <div className="grid gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <ScrollText className="green-section-icon" />
                <span className="section-label--green">Deeper Exploration</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="section-title--green"
              >
               Islamic <span className="green-section-title-accent">Manuscripts and Maps.</span>
              </motion.h2>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "120px" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="section-accent-bar--green"
              ></motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="indexes-grid"
            >
              {indexes.map((index, i) => {
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="index-item-card__icon-wrapper">
                      <index.icon className="index-item-card__icon" />
                    </div>
                    <div>
                      <h3 className="index-item-card__title">{index.title}</h3>
                      <p className="index-item-card__description">{index.description}</p>
                    </div>
                  </div>
                );
                return (
                  <motion.div
                    key={index.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + (i * 0.1) }}
                  >
                    <div className="index-item-card group">
                      {content}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant='solid' icon={<BookOpen size={16} />}>Browse All Indexes</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default IndexesSection

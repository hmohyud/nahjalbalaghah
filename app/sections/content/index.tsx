'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Mail, Quote, Scroll, Calendar, Archive } from 'lucide-react'
import Button from '@/app/components/button'
import Link from 'next/link'

const OrationsLettersSayingsSection = () => {
  const [isVisible, setIsVisible] = useState(true)

  const collections = [
    {
      icon: MessageSquare,
      title: "Orations",
      items: [
        "Eloquent discourses on faith, justice, and governance by Imam Ali (AS)",
        "Guidance on spiritual and ethical conduct",
        "Addresses on social justice and leadership",
        "Reflections on the nature of the world and the hereafter"
      ],
      period: "Collected 10th Century (by Sharif al-Radi)"
    },
    {
      icon: Mail,
      title: "Letters",
      items: [
        "Correspondence to governors and officials on justice and administration",
        "Letters to family and companions with moral and spiritual advice",
        "Political and diplomatic letters during Imam Ali's caliphate",
        "Testaments and instructions for posterity"
      ],
      period: "Collected 10th Century (by Sharif al-Radi)"
    },
    {
      icon: Quote,
      title: "Sayings",
      items: [
        "Concise maxims and aphorisms on life, knowledge, and virtue",
        "Guidance on humility, patience, and piety",
        "Reflections on the human condition and society",
        "Timeless advice for personal development"
      ],
      period: "Collected 10th Century (by Sharif al-Radi)"
    }
  ]

  return (
    <section id="orations-letters-sayings-section" className="section-light-gray">
      <div className="section-container">
        <div className="section-centered-intro">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{opacity: 1, y: 0}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center gap-3"
          >
            <Scroll className="green-section-icon" />
            <span className="section-label--green">Literary Heritage</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{opacity: 1, y: 0}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="section-title--green mt-4"
          >
            <span className="green-section-title-accent">Orations</span>, Letters & Sayings
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{width: "120px"}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="section-accent-bar--green"
          ></motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{opacity: 1, y: 0}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="green-section-intro"
        >
          <p className="section-description--centered">
            Explore the eloquence and wisdom of Imam Ali ibn Abi Talib (AS) through the Nahj al-Balaghah—a collection of sermons, letters, and sayings compiled by Sharif al-Radi. These texts offer profound insights into faith, justice, leadership, and the human experience.
          </p>
        </motion.div>
        <div className="grid-1-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{opacity: 1, y: 0}}
              transition={{ duration: 0.6, delay: 0.7 + (index * 0.1) }}
              className="collection-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="collection-card__icon-wrapper">
                  <collection.icon className="collection-card__icon" />
                </div>
                <div>
                  <h3 className="collection-card__title">{collection.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="green-section-icon--sm" />
                    <span className="collection-card__period">{collection.period}</span>
                  </div>
                </div>
              </div>
              <div className="collection-card__items-list collection-card__items-list--mb">
                {collection.items.map((item, i) => (
                  <div key={i} className="collection-card__item-row">
                    <div className="collection-card__bullet"></div>
                    <span className="collection-card__item-text">{item}</span>
                  </div>
                ))}
              </div>
              <div className="collection-card__footer">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={
                      collection.title === 'Orations' ? '/orations' :
                      collection.title === 'Letters' ? '/letters' :
                      collection.title === 'Sayings' ? '/sayings' : '/orations'
                    }
                    className="collection-card__read-link"
                  >
                    <Button variant="outlined" className="w-full">
                      Read {collection.title}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{opacity: 1, y: 0}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="section-bottom-action"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="outlined" icon={<Archive size={16} />}>
              Browse Literary Collection
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default OrationsLettersSayingsSection

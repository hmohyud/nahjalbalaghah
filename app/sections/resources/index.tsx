"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Globe, Layers, Archive, Map, Star, Calendar, Library } from 'lucide-react'
import Button from '@/app/components/button'

const ResourcesSection = () => {
  const collections = [
    {
      icon: BookOpen,
      title: "Earliest Nahj al-Balaghah Resources",
      items: [
        "10th-century Arabic Resources compiled by Sharif al-Radi",
        "Earliest extant copies preserved in Middle Eastern libraries",
        "Notable marginalia and commentaries from classical scholars"
      ],
      period: "10th-12th Century"
    },
    {
      icon: Archive,
      title: "Commentaries & Translations",
      items: [
        "Classical Arabic commentaries (e.g., Ibn Abi al-Hadid)",
        "Persian, Urdu, and English translations from the 19th-21st centuries",
        "Modern annotated editions and research publications"
      ],
      period: "13th Century–Present"
    },
    {
      icon: Globe,
      title: "The Book of Curiosities",
      items: [
        "A unique illustrated Arabic manuscript from the 11th century",
        "Contains some of the earliest known maps from the Islamic world",
        "Features diagrams of the heavens, earth, and seas",
        "Valuable for understanding medieval Islamic geography and science"
      ],
      period: "11th Century"
    }
  ]

  return (
    <section id="Resources-section" className="section-light-gray">
      <div className="section-container">
        <div className="section-centered-intro">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center gap-3"
          >
            <BookOpen className="green-section-icon" />
            <span className="section-label--green">Historical Treasures</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="section-title--green mt-4"
          >
            Islamic <span className="green-section-title-accent">Resources & Maps</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="section-accent-bar--green"
          ></motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="green-section-intro"
        >
          <p className="section-description--centered">
            Discover the manuscript heritage of Nahj al-Balaghah, from the earliest Arabic compilations to modern translations and commentaries. These treasures reflect centuries of devotion to preserving and understanding the words of Imam Ali (AS).
          </p>
        </motion.div>
        <div className="grid-2-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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
              <ul className="collection-card__items-list">
                {collection.items.map((item, i) => (
                  <li key={i} className="collection-card__item-row">
                    <div className="collection-card__bullet"></div>
                    <span className="collection-card__item-text">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="section-bottom-action"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="outlined" icon={<Globe size={16} />}>
              Explore Digital Collections
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ResourcesSection

'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/app/components/ui'

const AboutNahjSection = () => {
  return (
    <section id="about-nahj-section" className="section-gradient-gray">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="about-nahj-card"
        >
          <div className="about-nahj-card__inner">
            <div className="about-nahj-header">
              <div className="about-nahj-header__left">
                <div className="about-nahj-header__icon-group">
                  <BookOpen className="about-nahj-icon" />
                  <h2 className="about-nahj-title">
                    About Nahj al-Balaghah
                  </h2>
                </div>
                <div className="about-nahj-underline"></div>
              </div>
              <Link
                href="/pdfs/TQ-Introduction-to-Nahj-al-Balaghah.pdf"
                target="_blank"
                className="about-nahj-download-link"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant='outlined' icon={<Download size={20} />}>
                    Download PDF
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="about-nahj-prose">
              <p className="about-nahj-lead">
                <strong>Nahj al-Balaghah</strong> (نَهْجُ البَلَاغَة, "The Peak of Eloquence") is a collection of sermons, letters, and sayings attributed to Imam Ali ibn Abi Talib (AS), the cousin and son-in-law of Prophet Muhammad (PBUH), and the fourth caliph in Sunni Islam and the first Imam in Shia Islam.
              </p>
              <p>
                Compiled in the 10th century CE by Sharif al-Radi, a renowned Shia scholar, this work is celebrated as one of the most significant pieces of Arabic literature and Islamic thought. It addresses themes of governance, justice, spirituality, ethics, and human nature with profound eloquence and wisdom.
              </p>
              <div className="about-nahj-theme-box">
                <h3 className="about-nahj-theme-title">Key Themes</h3>
                <ul className="about-nahj-list">
                  <li><strong>Divine Unity and Faith:</strong> Reflections on the nature of God, creation, and the purpose of life</li>
                  <li><strong>Justice and Governance:</strong> Principles of just leadership and ethical administration</li>
                  <li><strong>Morality and Ethics:</strong> Guidance on virtue, patience, humility, and piety</li>
                  <li><strong>Knowledge and Wisdom:</strong> The value of learning, contemplation, and spiritual growth</li>
                  <li><strong>Social Responsibility:</strong> The importance of compassion, charity, and community welfare</li>
                </ul>
              </div>
              <p>
                The text is divided into three main sections: <strong>Khutab</strong> (Sermons/Orations), <strong>Maktubat</strong> (Letters), and <strong>Hikam</strong> (Short Sayings). Each section offers unique insights into Imam Ali's teachings and his approach to leadership, spirituality, and daily life.
              </p>
              <p>
                Nahj al-Balaghah has been studied by scholars across the Islamic world and beyond, transcending sectarian boundaries. Its eloquent Arabic prose is considered a masterpiece of classical literature, second only to the Quran in linguistic beauty and depth.
              </p>
              <div className="about-nahj-theme-box">
                <h3 className="about-nahj-theme-title">Historical Significance</h3>
                <p className="text-gray-700 mb-0">
                  Throughout history, Nahj al-Balaghah has influenced Islamic jurisprudence, philosophy, mysticism, and political thought. It serves as a guide for Muslims seeking to understand the principles of righteous living, just governance, and spiritual enlightenment. Commentaries on this work have been written by scholars from various schools of thought, demonstrating its universal appeal and enduring relevance.
                </p>
              </div>
              <p className="text-lg font-semibold mb-0">
                This digital platform provides easy access to the complete text, enabling readers to explore, search, and reflect upon the timeless wisdom contained within Nahj al-Balaghah.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutNahjSection

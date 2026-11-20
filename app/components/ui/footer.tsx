'use client'
import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const collections = [
    { name: 'Orations', href: '/orations' },
    { name: 'Letters', href: '/letters' },
    { name: 'Sayings', href: '/sayings' },
    { name: 'Manuscripts', href: '/manuscripts' },
  ]

  const resources = [
    { name: 'Introduction', href: '/radis' },
    { name: 'Indexes', href: '/indexes' },
    { name: 'Conclusion', href: '/conclusions' },
    { name: 'About', href: '/about-nahj-al-balaghah' },
  ]

  return (
    <footer className="footer">
      {/* Top accent line */}
      <div className="footer__accent-line" />

      {/* Subtle frame corners */}
      <div className="footer__corner footer__corner--tl" />
      <div className="footer__corner footer__corner--tr" />

      {/* Main Footer Content - min padding to stay inside corners */}
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand Column - Now clickable */}
          <div>
            <Link href="/" className="group footer__brand-link">
              {/* Logo with inner frame */}
              <div className="footer__logo-box">
                <div className="footer__logo-inner">
                  {/* Inner corners on hover */}
                  <div className="footer__logo-corner footer__logo-corner--tl" />
                  <div className="footer__logo-corner footer__logo-corner--br" />

                  <div className="logo-text-tight">
                    <div className="footer__logo-arabic">نهج</div>
                    <div className="footer__logo-arabic-sub">البلاغة</div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="footer__brand-title">
                  Nahj al-Balaghah
                </h2>
                <p className="footer__brand-subtitle">
                  The Way of Eloquence
                </p>
              </div>
            </Link>
            <p className="footer__description">
              A comprehensive digital archive preserving and presenting the sermons,
              letters, and sayings of Imam Ali ibn Abi Talib, compiled by Sharif al-Radi
              in the 10th century.
            </p>

            {/* Decorative line */}
            <div className="footer__est-line">
              <div className="footer__est-dash" />
              <span className="footer__est-text">EST. 1000 CE</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <div className="footer__nav-grid">
              {/* Collections */}
              <div>
                <h3 className="footer__nav-heading">
                  Text & Translation
                </h3>
                <ul className="footer__nav-list">
                  {collections.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group footer__nav-link"
                      >
                        <span className="footer__nav-link-text">{item.name}</span>
                        <ArrowUpRight className="w-3 h-3 footer__nav-link-icon" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="footer__nav-heading">
                  Resources
                </h3>
                <ul className="footer__nav-list">
                  {resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group footer__nav-link"
                      >
                        <span className="footer__nav-link-text">{item.name}</span>
                        <ArrowUpRight className="w-3 h-3 footer__nav-link-icon" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          {/* Accent on divider */}
          <div className="footer__bottom-accent" />

          <div className="footer__bottom-inner">
            <p className="footer__copyright">
              © {currentYear} Nahj al-Balaghah Digital Archive
            </p>
            <div className="footer__bottom-links">
              <Link href="/contact" className="footer__bottom-link">
                Contact
              </Link>
              <Link href="/privacy" className="footer__bottom-link">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

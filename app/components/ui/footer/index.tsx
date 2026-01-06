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
    <footer className="relative bg-[var(--color-primary-dark)] text-white overflow-hidden">
      {/* Top accent line */}
      <div className="h-[1px] bg-[var(--color-accent)]/30" />
      
      {/* Subtle frame corners */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 w-12 lg:w-16 h-12 lg:h-16 border-l border-t border-[var(--color-accent)]/15" />
      <div className="absolute top-8 right-8 lg:top-12 lg:right-12 w-12 lg:w-16 h-12 lg:h-16 border-r border-t border-[var(--color-accent)]/15" />
      
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              {/* Logo with inner frame */}
              <div className="group relative w-14 h-14 border border-[var(--color-accent)]/30 p-1 cursor-pointer">
                <div className="relative w-full h-full border border-white/20 flex items-center justify-center">
                  {/* Inner corners on hover */}
                  <div className="absolute top-0.5 left-0.5 w-0 h-0 border-l border-t border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
                  <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-r border-b border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
                  
                  <div className="text-center" style={{ lineHeight: '1' }}>
                    <div className="font-taha text-white text-base font-bold">نهج</div>
                    <div className="font-taha text-white/80 text-[9px]">البلاغة</div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl font-medium text-white">
                  Nahj al-Balaghah
                </h2>
                <p className="text-xs tracking-[0.2em] uppercase mt-1 text-white/50">
                  The Way of Eloquence
                </p>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed max-w-md text-sm">
              A comprehensive digital archive preserving and presenting the sermons, 
              letters, and sayings of Imam Ali ibn Abi Talib, compiled by Sharif al-Radi 
              in the 10th century.
            </p>
            
            {/* Decorative line */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-[1px] bg-[var(--color-accent)]/50" />
              <span className="text-[var(--color-accent)]/70 text-xs tracking-widest">EST. 1000 CE</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-8 lg:gap-16">
              {/* Collections */}
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
                  Collections
                </h3>
                <ul className="space-y-3">
                  {collections.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
                      >
                        <span className="font-display text-base">{item.name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {resources.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
                      >
                        <span className="font-display text-base">{item.name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative mt-16 pt-8 border-t border-white/10">
          {/* Accent on divider */}
          <div className="absolute top-0 left-0 w-10 h-[1px] bg-[var(--color-accent)] -translate-y-[0.5px]" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © {currentYear} Nahj al-Balaghah Digital Archive
            </p>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white/70 transition-colors duration-200">
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

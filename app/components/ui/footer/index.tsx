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
      {/* Decorative top border */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />
      
      {/* Corner decorations */}
      <div className="absolute top-12 left-12 w-20 h-20 border-l border-t border-[var(--color-accent)]/20" />
      <div className="absolute top-12 right-12 w-20 h-20 border-r border-t border-[var(--color-accent)]/20" />
      <div className="absolute bottom-24 left-12 w-16 h-16 border-l border-b border-white/10" />
      <div className="absolute bottom-24 right-12 w-16 h-16 border-r border-b border-white/10" />
      
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-8 group">
              <div className="relative">
                {/* Corner accent on logo hover */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-300" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-300" />
                
                <div className="w-16 h-16 border border-[var(--color-accent)]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[var(--color-accent)]/60">
                  <div className="text-center font-taha leading-none">
                    <div className="text-white text-base font-bold">نهج</div>
                    <div className="text-white text-sm font-bold -mt-0.5">البلاغة</div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-white">
                  Nahj al-Balaghah
                </h2>
                <p className="text-xs tracking-[0.25em] uppercase mt-1 text-white/60">
                  The Peak of Eloquence
                </p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed max-w-md text-sm font-light">
              A comprehensive digital archive preserving and presenting the sermons, 
              letters, and sayings of Imam Ali ibn Abi Talib, compiled by Sharif al-Radi 
              in the 10th century.
            </p>
            
            {/* Decorative ornament */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
              <span className="text-[var(--color-accent)] text-xs tracking-widest">EST. 1000 CE</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-8 lg:gap-16">
              {/* Collections */}
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-6">
                  Collections
                </h3>
                <ul className="space-y-4">
                  {collections.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
                      >
                        <span className="font-display text-lg">{item.name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-6">
                  Resources
                </h3>
                <ul className="space-y-4">
                  {resources.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
                      >
                        <span className="font-display text-lg">{item.name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
          {/* Corner accent on divider */}
          <div className="absolute -top-px left-0 w-8 h-[2px] bg-[var(--color-accent)]" />
          <div className="absolute -top-px right-0 w-8 h-[2px] bg-[var(--color-accent)]" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 font-light">
              © {currentYear} Nahj al-Balaghah Digital Archive. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors duration-300">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors duration-300">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    </footer>
  )
}

export default Footer

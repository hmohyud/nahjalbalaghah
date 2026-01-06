'use client'
import React, { useState, useEffect } from 'react'
import { Menu, X, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Orations', href: '/orations' },
    { name: 'Letters', href: '/letters' },
    { name: 'Sayings', href: '/sayings' },
    { name: 'Manuscripts', href: '/manuscripts' },
    { name: 'About', href: '/about-us' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top accent line */}
      <div className="h-[2px] bg-[var(--color-accent)]" />
      
      <div 
        className={`transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/98 backdrop-blur-md shadow-sm' 
            : 'bg-[var(--color-parchment)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo with inner frame and hover corners */}
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-[var(--color-primary)] p-1 transition-colors duration-300 group-hover:bg-[var(--color-primary-dark)]">
                {/* Inner frame */}
                <div className="relative w-full h-full border border-white/20 flex items-center justify-center">
                  {/* Inner corners on hover */}
                  <div className="absolute top-0.5 left-0.5 w-0 h-0 border-l border-t border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
                  <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-r border-b border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
                  
                  {/* Arabic text */}
                  <div className="text-center" style={{ lineHeight: '1' }}>
                    <div className="font-taha text-white text-sm lg:text-base font-bold">نهج</div>
                    <div className="font-taha text-white/80 text-[8px] lg:text-[9px]">البلاغة</div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg lg:text-xl font-medium text-[var(--color-ink)] transition-colors duration-300 group-hover:text-[var(--color-primary)]">
                  Nahj al-Balaghah
                </h1>
                <p className="text-[10px] lg:text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)]">
                  Way of Eloquence
                </p>
              </div>
            </Link>

            {/* Desktop Navigation - Option D: Two corner brackets */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative px-4 py-2"
                >
                  <span className="text-sm font-medium text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors duration-200">
                    {item.name}
                  </span>
                  {/* Top-left corner */}
                  <div className="absolute top-1 left-1 w-0 h-0 border-l border-t border-[var(--color-accent)] group-hover:w-2 group-hover:h-2 transition-all duration-200" />
                  {/* Bottom-right corner */}
                  <div className="absolute bottom-1 right-1 w-0 h-0 border-r border-b border-[var(--color-accent)] group-hover:w-2 group-hover:h-2 transition-all duration-200" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 flex items-center justify-center transition-colors duration-200 ${
                  isSearchOpen 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden w-10 h-10 flex items-center justify-center transition-colors duration-200 ${
                  isMenuOpen 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            isSearchOpen ? 'max-h-24' : 'max-h-0'
          }`}
        >
          <div className="border-t border-[var(--color-stone)]">
            <div className="max-w-2xl mx-auto px-6 py-5">
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-[var(--color-warm-gray)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search sermons, letters, sayings..."
                  className="flex-1 bg-transparent text-base font-body placeholder:text-[var(--color-warm-gray)] focus:outline-none"
                  autoFocus={isSearchOpen}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="border-t border-[var(--color-stone)] bg-white">
            <nav className="px-6 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors duration-200"
                >
                  <span className="font-display text-lg">{item.name}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-warm-gray)]" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

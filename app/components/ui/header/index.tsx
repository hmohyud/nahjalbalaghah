'use client'
import React, { useState, useEffect } from 'react'
import { Menu, X, Search, ChevronRight } from 'lucide-react'
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
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
      
      <div 
        className={`transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative">
                {/* Corner accent on hover */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-300" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-300" />
                
                <div className="relative w-14 h-14 bg-[var(--color-primary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <div className="text-center font-taha leading-none">
                    <div className="text-white text-sm font-bold">نهج</div>
                    <div className="text-white text-xs font-bold -mt-0.5">البلاغة</div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="font-display text-xl lg:text-2xl font-medium tracking-tight text-[var(--color-ink)]"
                >
                  Nahj al-Balaghah
                </h1>
                <p className="text-xs tracking-[0.2em] uppercase mt-0.5 text-[var(--color-warm-gray)]">
                  Peak of Eloquence
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-5 py-2 text-sm tracking-wide font-medium text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors duration-300 group"
                >
                  {item.name}
                  {/* Underline with corner accent */}
                  <span className="absolute bottom-1 left-5 right-5 h-[1px] bg-[var(--color-accent)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  {/* Tiny corner on hover */}
                  <span className="absolute bottom-0 right-4 w-2 h-2 border-r border-b border-[var(--color-accent)]/0 group-hover:border-[var(--color-accent)] transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Button with corner accent */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="relative p-3 hover:bg-[var(--color-stone)] transition-colors duration-300 group"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[var(--color-charcoal)]" />
                <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300" />
              </button>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden relative p-3 hover:bg-[var(--color-stone)] transition-colors duration-300 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-[var(--color-charcoal)]" />
                ) : (
                  <Menu className="w-5 h-5 text-[var(--color-charcoal)]" />
                )}
                <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div 
          className={`absolute top-full left-0 right-0 bg-white border-b border-[var(--color-stone)] transition-all duration-300 overflow-hidden ${
            isSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="relative flex items-center gap-4 border-b-2 border-[var(--color-primary)] pb-2">
              <Search className="w-5 h-5 text-[var(--color-warm-gray)]" />
              <input
                type="text"
                placeholder="Search sermons, letters, sayings..."
                className="flex-1 bg-transparent text-lg font-display placeholder:text-[var(--color-warm-gray)] focus:outline-none"
              />
              {/* Corner accent */}
              <div className="absolute -bottom-1 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-[var(--color-stone)] transition-all duration-500 overflow-hidden ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-6 py-8">
            {/* Corner accent on mobile menu */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-[var(--color-accent)]/30" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-[var(--color-accent)]/30" />
            
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-[var(--color-stone)] group"
                >
                  <span className="font-display text-xl text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                    {item.name}
                  </span>
                  <div className="relative">
                    <ChevronRight className="w-5 h-5 text-[var(--color-warm-gray)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

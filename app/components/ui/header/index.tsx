'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, Search, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DropdownItem {
  name: string;
  href: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  isActive: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative px-4 py-2 flex items-center gap-1"
      >
        <span className={`text-sm font-medium transition-colors duration-200 ${isActive
          ? 'text-[var(--color-primary)]'
          : 'text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)]'
          }`}>
          {label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
          } ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)]'}`} />

        <div className={`absolute top-1 left-1 border-l border-t border-[var(--color-accent)] transition-all duration-200 ${isActive || isOpen ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
          }`} />
        <div className={`absolute bottom-1 right-1 border-r border-b border-[var(--color-accent)] transition-all duration-200 ${isActive || isOpen ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
          }`} />
        {isActive && (
          <div className="absolute inset-0 bg-[var(--color-primary)]/5 -z-10" />
        )}
      </button>

      <div className={`absolute top-full left-0 mt-1 bg-white border border-[var(--color-stone)] shadow-lg transition-all duration-200 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}>
        <div className="py-2 min-w-[200px]">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-primary)] hover:bg-[var(--color-cream)] transition-colors duration-150"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const collectionsItems = [
    { name: 'Orations', href: '/orations' },
    { name: 'Letters', href: '/letters' },
    { name: 'Sayings', href: '/sayings' },
  ]

  const aboutItems = [
    { name: 'About Us', href: '/about-us' },
    { name: 'About Nahj al-Balaghah', href: '/about-nahj-al-balaghah' },
  ]

  const indexesItems = [
    { name: 'Names & Places', href: '/indexes/names-places' },
    { name: 'Terms', href: '/indexes/terms' },
    { name: 'Qur\'an, Hadith & Poetry', href: '/indexes/quran-hadith' },
    { name: 'Religious & Ethical Concepts', href: '/indexes/concepts' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isIndexesActive = indexesItems.some(item => isActive(item.href))
  const isCollectionsActive = collectionsItems.some(item => isActive(item.href))
  const isAboutActive = aboutItems.some(item => isActive(item.href))

  const toggleMobileDropdown = (name: string) => {
    setMobileDropdown(mobileDropdown === name ? null : name)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="h-[2px] bg-[var(--color-accent)]" />

      <div
        className={`transition-all duration-300 ${isScrolled
          ? 'bg-white/98 backdrop-blur-md shadow-sm'
          : 'bg-[var(--color-parchment)]'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-[var(--color-primary)] p-1 transition-colors duration-300 group-hover:bg-[var(--color-primary-dark)]">
                <div className="relative w-full h-full border border-white/20 flex items-center justify-center">
                  <div className="absolute top-0.5 left-0.5 w-0 h-0 border-l border-t border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
                  <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-r border-b border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-2 group-hover:h-2 transition-all duration-300" />
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
                <p className="title-subheader text-[10px] lg:text-xs tracking-[0.15em] uppercase text-[var(--color-warm-gray)]">
                  The Way of Eloquence
                </p>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1">
              <Link href="/" className="group relative px-4 py-2">
                <span className={`text-sm font-medium transition-colors duration-200 ${pathname === '/'
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)]'
                  }`}>
                  Home
                </span>
                <div className={`absolute top-1 left-1 border-l border-t border-[var(--color-accent)] transition-all duration-200 ${pathname === '/' ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                <div className={`absolute bottom-1 right-1 border-r border-b border-[var(--color-accent)] transition-all duration-200 ${pathname === '/' ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                {pathname === '/' && (
                  <div className="absolute inset-0 bg-[var(--color-primary)]/5 -z-10" />
                )}
              </Link>

              <Dropdown
                label="Text & Translation"
                items={collectionsItems}
                isActive={isCollectionsActive}
              />

              <Link href="/timeline" className="group relative px-4 py-2">
                <span className={`text-sm font-medium transition-colors duration-200 ${isActive('/timeline')
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)]'
                  }`}>
                  Timeline
                </span>
                <div className={`absolute top-1 left-1 border-l border-t border-[var(--color-accent)] transition-all duration-200 ${isActive('/timeline') ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                <div className={`absolute bottom-1 right-1 border-r border-b border-[var(--color-accent)] transition-all duration-200 ${isActive('/timeline') ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                {isActive('/timeline') && (
                  <div className="absolute inset-0 bg-[var(--color-primary)]/5 -z-10" />
                )}
              </Link>

              <Link href="/manuscripts" className="group relative px-4 py-2">
                <span className={`text-sm font-medium transition-colors duration-200 ${isActive('/manuscripts')
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)]'
                  }`}>
                  Manuscripts
                </span>
                <div className={`absolute top-1 left-1 border-l border-t border-[var(--color-accent)] transition-all duration-200 ${isActive('/manuscripts') ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                <div className={`absolute bottom-1 right-1 border-r border-b border-[var(--color-accent)] transition-all duration-200 ${isActive('/manuscripts') ? 'w-2 h-2 opacity-100' : 'w-0 h-0 opacity-0 group-hover:w-2 group-hover:h-2 group-hover:opacity-100'
                  }`} />
                {isActive('/manuscripts') && (
                  <div className="absolute inset-0 bg-[var(--color-primary)]/5 -z-10" />
                )}
              </Link>

              <Dropdown
                label="Indexes"
                items={indexesItems}
                isActive={isIndexesActive}
              />

              <Dropdown
                label="About"
                items={aboutItems}
                isActive={isAboutActive}
              />
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`flex items-center gap-2 px-3 h-9 rounded-sm transition-all duration-200 ${isSearchOpen
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                  }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs tracking-[0.1em] uppercase hidden sm:inline">Search</span>
              </button>

              <button
                className={`xl:hidden w-10 h-10 flex items-center justify-center transition-colors duration-200 ${isMenuOpen
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

        <div
          className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-24' : 'max-h-0'
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

        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[700px]' : 'max-h-0'
            }`}
        >
          <div className="border-t border-[var(--color-stone)] bg-white">
            <nav className="px-6 py-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-3 transition-colors duration-200 ${pathname === '/'
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {pathname === '/' && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                  <span className="font-display text-lg">Home</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-warm-gray)]" />
              </Link>

              {/* Text & Translation Dropdown - Mobile */}
              <div className="border-t border-[var(--color-stone)]/50">
                <button
                  onClick={() => toggleMobileDropdown('collections')}
                  className={`w-full flex items-center justify-between py-3 transition-colors duration-200 ${isCollectionsActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-charcoal)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {isCollectionsActive && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                    <span className="font-display text-lg">Text & Translation</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-warm-gray)] transition-transform duration-200 ${mobileDropdown === 'collections' ? 'rotate-180' : ''
                    }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${mobileDropdown === 'collections' ? 'max-h-40' : 'max-h-0'
                  }`}>
                  <div className="pl-6 pb-2">
                    {collectionsItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 py-2 transition-colors duration-200 ${isActive(item.href)
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                          }`}
                      >
                        <span className="font-body">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <Link
                href="/timeline"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-3 border-t border-[var(--color-stone)]/50 transition-colors duration-200 ${isActive('/timeline')
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {isActive('/timeline') && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                  <span className="font-display text-lg">Timeline</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-warm-gray)]" />
              </Link>

              {/* Manuscripts */}
              <Link
                href="/manuscripts"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-3 border-t border-[var(--color-stone)]/50 transition-colors duration-200 ${isActive('/manuscripts')
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {isActive('/manuscripts') && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                  <span className="font-display text-lg">Manuscripts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-warm-gray)]" />
              </Link>

              {/* Indexes Dropdown - Mobile */}
              <div className="border-t border-[var(--color-stone)]/50">
                <button
                  onClick={() => toggleMobileDropdown('indexes')}
                  className={`w-full flex items-center justify-between py-3 transition-colors duration-200 ${isIndexesActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-charcoal)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {isIndexesActive && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                    <span className="font-display text-lg">Indexes</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-warm-gray)] transition-transform duration-200 ${mobileDropdown === 'indexes' ? 'rotate-180' : ''
                    }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${mobileDropdown === 'indexes' ? 'max-h-48' : 'max-h-0'
                  }`}>
                  <div className="pl-6 pb-2">
                    {indexesItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 py-2 transition-colors duration-200 ${isActive(item.href)
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                          }`}
                      >
                        <span className="font-body">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* About Dropdown - Mobile */}
              <div className="border-t border-[var(--color-stone)]/50">
                <button
                  onClick={() => toggleMobileDropdown('about')}
                  className={`w-full flex items-center justify-between py-3 transition-colors duration-200 ${isAboutActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-charcoal)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {isAboutActive && <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />}
                    <span className="font-display text-lg">About</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-warm-gray)] transition-transform duration-200 ${mobileDropdown === 'about' ? 'rotate-180' : ''
                    }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${mobileDropdown === 'about' ? 'max-h-40' : 'max-h-0'
                  }`}>
                  <div className="pl-6 pb-2">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 py-2 transition-colors duration-200 ${isActive(item.href)
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-charcoal)] hover:text-[var(--color-primary)]'
                          }`}
                      >
                        <span className="font-body">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
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
    <div ref={dropdownRef} className="dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown__trigger"
      >
        <span className={`header__nav-text ${isActive
          ? 'header__nav-text--active'
          : 'header__nav-text--default'
          }`}>
          {label}
        </span>
        <ChevronDown className={`dropdown__chevron ${isOpen ? 'dropdown__chevron--open' : ''
          } ${isActive ? 'header__nav-text--active' : 'header__nav-text--default'}`} />

        <div className={`header__corner-accent header__corner-accent--tl ${isActive || isOpen ? 'header__corner-accent--active' : 'header__corner-accent--default'
          }`} />
        <div className={`header__corner-accent header__corner-accent--br ${isActive || isOpen ? 'header__corner-accent--active' : 'header__corner-accent--default'
          }`} />
        {isActive && (
          <div className="header__active-bg" />
        )}
      </button>

      <div className={`dropdown__menu ${isOpen ? 'dropdown__menu--visible' : 'dropdown__menu--hidden'
        }`}>
        <div className="dropdown__menu-inner">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="dropdown__item"
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
    <header className="header">
      <div className="header__accent-line" />

      <div
        className={`header__bar ${isScrolled
          ? 'header__bar--scrolled'
          : 'header__bar--default'
          }`}
      >
        <div className="header__container">
          <div className="header__inner">
            <Link href="/" className="header__logo">
              <div className="header__logo-icon">
                <div className="header__logo-inner">
                  <div className="header__logo-corner header__logo-corner--tl" />
                  <div className="header__logo-corner header__logo-corner--br" />
                  <div className="logo-text-tight">
                    <div className="header__logo-arabic">&#x0646;&#x0647;&#x062C;</div>
                    <div className="header__logo-arabic-sub">&#x0627;&#x0644;&#x0628;&#x0644;&#x0627;&#x063A;&#x0629;</div>
                  </div>
                </div>
              </div>
              <div className="header__logo-text">
                <h1 className="header__logo-title">
                  Nahj al-Balaghah
                </h1>
                <p className="title-subheader">
                  The Way of Eloquence
                </p>
              </div>
            </Link>

            <nav className="header__nav">
              <Link href="/" className="header__nav-link">
                <span className={`header__nav-text ${pathname === '/'
                  ? 'header__nav-text--active'
                  : 'header__nav-text--default'
                  }`}>
                  Home
                </span>
                <div className={`header__corner-accent header__corner-accent--tl ${pathname === '/' ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                <div className={`header__corner-accent header__corner-accent--br ${pathname === '/' ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                {pathname === '/' && (
                  <div className="header__active-bg" />
                )}
              </Link>

              <Dropdown
                label="Text & Translation"
                items={collectionsItems}
                isActive={isCollectionsActive}
              />

              <Link href="/timeline" className="header__nav-link">
                <span className={`header__nav-text ${isActive('/timeline')
                  ? 'header__nav-text--active'
                  : 'header__nav-text--default'
                  }`}>
                  Timeline
                </span>
                <div className={`header__corner-accent header__corner-accent--tl ${isActive('/timeline') ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                <div className={`header__corner-accent header__corner-accent--br ${isActive('/timeline') ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                {isActive('/timeline') && (
                  <div className="header__active-bg" />
                )}
              </Link>

              <Link href="/manuscripts" className="header__nav-link">
                <span className={`header__nav-text ${isActive('/manuscripts')
                  ? 'header__nav-text--active'
                  : 'header__nav-text--default'
                  }`}>
                  Manuscripts
                </span>
                <div className={`header__corner-accent header__corner-accent--tl ${isActive('/manuscripts') ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                <div className={`header__corner-accent header__corner-accent--br ${isActive('/manuscripts') ? 'header__corner-accent--active' : 'header__corner-accent--default'
                  }`} />
                {isActive('/manuscripts') && (
                  <div className="header__active-bg" />
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

            <div className="header__actions">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`header__search-btn ${isSearchOpen
                  ? 'header__search-btn--active'
                  : 'header__search-btn--default'
                  }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" strokeWidth={1.5} />
                <span className="header__search-label">Search</span>
              </button>

              <button
                className={`header__menu-btn ${isMenuOpen
                  ? 'header__menu-btn--active'
                  : 'header__menu-btn--default'
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
          className={`header__search-panel ${isSearchOpen ? 'header__search-panel--open' : 'header__search-panel--closed'
            }`}
        >
          <div className="header__search-inner">
            <div className="header__search-container">
              <div className="header__search-row">
                <Search className="header__search-input-icon" />
                <input
                  type="text"
                  placeholder="Search sermons, letters, sayings..."
                  className="header__search-input"
                  autoFocus={isSearchOpen}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`header__mobile-nav ${isMenuOpen ? 'header__mobile-nav--open' : 'header__mobile-nav--closed'
            }`}
        >
          <div className="header__mobile-inner">
            <nav>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`header__mobile-link ${pathname === '/'
                  ? 'header__mobile-link--active'
                  : 'header__mobile-link--default'
                  }`}
              >
                <div className="header__mobile-link-content">
                  {pathname === '/' && <div className="header__mobile-active-dot" />}
                  <span className="header__mobile-link-text">Home</span>
                </div>
                <ArrowRight className="header__mobile-arrow" />
              </Link>

              {/* Text & Translation Dropdown - Mobile */}
              <div className="header__mobile-section">
                <button
                  onClick={() => toggleMobileDropdown('collections')}
                  className={`header__mobile-dropdown-btn ${isCollectionsActive
                    ? 'header__mobile-link--active'
                    : 'header__mobile-link--default'
                    }`}
                >
                  <div className="header__mobile-link-content">
                    {isCollectionsActive && <div className="header__mobile-active-dot" />}
                    <span className="header__mobile-link-text">Text & Translation</span>
                  </div>
                  <ChevronDown className={`header__mobile-chevron ${mobileDropdown === 'collections' ? 'header__mobile-chevron--open' : ''
                    }`} />
                </button>
                <div className={`header__mobile-submenu ${mobileDropdown === 'collections' ? 'header__mobile-submenu--open' : 'header__mobile-submenu--closed'
                  }`}>
                  <div className="header__mobile-submenu-inner">
                    {collectionsItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`header__mobile-submenu-link ${isActive(item.href)
                          ? 'header__mobile-submenu-link--active'
                          : 'header__mobile-submenu-link--default'
                          }`}
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <Link
                href="/timeline"
                onClick={() => setIsMenuOpen(false)}
                className={`header__mobile-link header__mobile-section ${isActive('/timeline')
                  ? 'header__mobile-link--active'
                  : 'header__mobile-link--default'
                  }`}
              >
                <div className="header__mobile-link-content">
                  {isActive('/timeline') && <div className="header__mobile-active-dot" />}
                  <span className="header__mobile-link-text">Timeline</span>
                </div>
                <ArrowRight className="header__mobile-arrow" />
              </Link>

              {/* Manuscripts */}
              <Link
                href="/manuscripts"
                onClick={() => setIsMenuOpen(false)}
                className={`header__mobile-link header__mobile-section ${isActive('/manuscripts')
                  ? 'header__mobile-link--active'
                  : 'header__mobile-link--default'
                  }`}
              >
                <div className="header__mobile-link-content">
                  {isActive('/manuscripts') && <div className="header__mobile-active-dot" />}
                  <span className="header__mobile-link-text">Manuscripts</span>
                </div>
                <ArrowRight className="header__mobile-arrow" />
              </Link>

              {/* Indexes Dropdown - Mobile */}
              <div className="header__mobile-section">
                <button
                  onClick={() => toggleMobileDropdown('indexes')}
                  className={`header__mobile-dropdown-btn ${isIndexesActive
                    ? 'header__mobile-link--active'
                    : 'header__mobile-link--default'
                    }`}
                >
                  <div className="header__mobile-link-content">
                    {isIndexesActive && <div className="header__mobile-active-dot" />}
                    <span className="header__mobile-link-text">Indexes</span>
                  </div>
                  <ChevronDown className={`header__mobile-chevron ${mobileDropdown === 'indexes' ? 'header__mobile-chevron--open' : ''
                    }`} />
                </button>
                <div className={`header__mobile-submenu ${mobileDropdown === 'indexes' ? 'header__mobile-submenu--open' : 'header__mobile-submenu--closed'
                  }`}>
                  <div className="header__mobile-submenu-inner">
                    {indexesItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`header__mobile-submenu-link ${isActive(item.href)
                          ? 'header__mobile-submenu-link--active'
                          : 'header__mobile-submenu-link--default'
                          }`}
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* About Dropdown - Mobile */}
              <div className="header__mobile-section">
                <button
                  onClick={() => toggleMobileDropdown('about')}
                  className={`header__mobile-dropdown-btn ${isAboutActive
                    ? 'header__mobile-link--active'
                    : 'header__mobile-link--default'
                    }`}
                >
                  <div className="header__mobile-link-content">
                    {isAboutActive && <div className="header__mobile-active-dot" />}
                    <span className="header__mobile-link-text">About</span>
                  </div>
                  <ChevronDown className={`header__mobile-chevron ${mobileDropdown === 'about' ? 'header__mobile-chevron--open' : ''
                    }`} />
                </button>
                <div className={`header__mobile-submenu ${mobileDropdown === 'about' ? 'header__mobile-submenu--open' : 'header__mobile-submenu--closed'
                  }`}>
                  <div className="header__mobile-submenu-inner">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`header__mobile-submenu-link ${isActive(item.href)
                          ? 'header__mobile-submenu-link--active'
                          : 'header__mobile-submenu-link--default'
                          }`}
                      >
                        <span>{item.name}</span>
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

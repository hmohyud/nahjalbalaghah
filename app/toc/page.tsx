'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import { postBasesApi, type PostBase } from '@/api/posts';

type TabType = 'orations' | 'letters' | 'sayings';

const TAB_CONFIG = {
  orations: {
    label: 'Orations',
    sublabel: 'Khutbah',
    type: 'Oration' as const,
    icon: BookOpen,
    prefix: '1',
    fetchTOC: () => postBasesApi.getOrationsTOC(),
  },
  letters: {
    label: 'Letters',
    sublabel: 'Maktoobat',
    type: 'Letter' as const,
    icon: FileText,
    prefix: '2',
    fetchTOC: () => postBasesApi.getLettersTOC(),
  },
  sayings: {
    label: 'Sayings',
    sublabel: 'Hikam',
    type: 'Saying' as const,
    icon: MessageSquare,
    prefix: '3',
    fetchTOC: () => postBasesApi.getSayingsTOC(),
  },
};

export default function TOCIndexPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orations');
  const [data, setData] = useState<Record<TabType, PostBase[]>>({ orations: [], letters: [], sayings: [] });
  const [loading, setLoading] = useState<Record<TabType, boolean>>({ orations: true, letters: false, sayings: false });
  const [error, setError] = useState<Record<TabType, string | null>>({ orations: null, letters: null, sayings: null });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (tab: TabType) => {
    if (data[tab].length > 0) return; // Already loaded

    setLoading(prev => ({ ...prev, [tab]: true }));
    setError(prev => ({ ...prev, [tab]: null }));

    try {
      const config = TAB_CONFIG[tab];
      const response = await config.fetchTOC();
      setData(prev => ({ ...prev, [tab]: response.data || [] }));
    } catch (err) {
      console.error(`Error fetching ${tab} TOC:`, err);
      setError(prev => ({ ...prev, [tab]: `Failed to load ${tab}. Please try again.` }));
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => {
    fetchData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const config = TAB_CONFIG[activeTab];
  const items = data[activeTab];

  // Filter items by search term
  const filteredItems = items.filter(item => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return item.posts?.some(post =>
      (post.heading?.toLowerCase().includes(query)) ||
      (post.sermonNumber?.includes(query))
    );
  });

  // Sort items by sermon number
  const sortedItems = [...filteredItems].sort((a, b) => {
    const getNum = (item: PostBase) => {
      const post = item.posts?.[0];
      if (!post?.sermonNumber) return 0;
      const parts = post.sermonNumber.split('.');
      return parseInt(parts.length > 1 ? parts[1] : parts[0], 10) || 0;
    };
    return getNum(a) - getNum(b);
  });

  return (
    <div className="toc-page">
      {/* Hero Section */}
      <section className="toc-page__hero">
        <div className="toc-page__hero-inner">
          <div className="toc-page__hero-center">
            <div className="toc-page__hero-badge">
              <FileText className="w-8 h-8 toc-page__hero-badge-icon" />
              <span className="toc-page__hero-badge-text">Complete Reference</span>
            </div>
            <h1 className="toc-page__hero-title">
              Table of Contents
            </h1>
            <div className="toc-page__hero-divider"></div>
            <p className="toc-page__hero-desc">
              Access detailed table of contents entries with English and Arabic headings,
              along with historical manuscript images and metadata.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="toc-page__content-section">
        <div className="toc-page__content-inner">
          {/* Tabs */}
          <div className="toc-page__tabs" role="tablist">
            {(Object.keys(TAB_CONFIG) as TabType[]).map(tab => {
              const tabConfig = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                  className={`toc-page__tab ${isActive ? 'toc-page__tab--active' : ''}`}
                >
                  <tabConfig.icon className="w-4 h-4" />
                  <span>{tabConfig.label}</span>
                  <span className="toc-page__tab-sublabel">{tabConfig.sublabel}</span>
                  {data[tab].length > 0 && (
                    <span className="toc-page__tab-count">
                      {data[tab].length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="toc-page__search">
            <Search className="w-5 h-5 toc-page__search-icon" />
            <input
              type="text"
              placeholder={`Search ${config.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="toc-page__search-input"
            />
          </div>

          {/* Loading */}
          {loading[activeTab] && (
            <div className="toc-page__entries">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="toc-page__entry-skeleton"></div>
              ))}
            </div>
          )}

          {/* Error */}
          {error[activeTab] && (
            <div className="toc-page__state">
              <p className="toc-page__state-error">{error[activeTab]}</p>
              <button
                onClick={() => { setData(prev => ({ ...prev, [activeTab]: [] })); fetchData(activeTab); }}
                className="content-error-button"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Content Grid */}
          {!loading[activeTab] && !error[activeTab] && (
            <>
              {sortedItems.length === 0 ? (
                <div className="toc-page__state">
                  {searchTerm ? `No ${config.label.toLowerCase()} found matching "${searchTerm}"` : `No ${config.label.toLowerCase()} found.`}
                </div>
              ) : (
                <div className="toc-page__entries">
                  {sortedItems.map(item => {
                    const post = item.posts?.[0];
                    if (!post) return null;

                    const displayNum = post.sermonNumber
                      ? post.sermonNumber.includes('.')
                        ? post.sermonNumber.split('.').pop()
                        : post.sermonNumber
                      : '?';

                    return (
                      <Link
                        key={item.id}
                        href={`/content/details/${activeTab}/${post.id}`}
                        className="toc-page__entry group"
                      >
                        <span className="toc-page__entry-number">
                          {displayNum}
                        </span>
                        <div className="toc-page__entry-body">
                          <p className="toc-page__entry-heading line-clamp-2">
                            {post.heading || 'Untitled'}
                          </p>
                          {post.editions && post.editions.length > 0 && (
                            <p className="toc-page__entry-editions line-clamp-1">
                              {post.editions.map(e => e.title).join(', ')}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Count */}
              {sortedItems.length > 0 && (
                <p className="toc-page__count">
                  Showing {sortedItems.length} of {items.length} {config.label.toLowerCase()}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="toc-page__features-section">
        <div className="toc-page__features-inner">
          <h2 className="toc-page__features-title">
            What You&apos;ll Find in the TOC
          </h2>
          <div className="toc-page__features-grid">
            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <FileText className="w-6 h-6 toc-page__feature-icon" />
              </div>
              <h3 className="toc-page__feature-title">Headings</h3>
              <p className="toc-page__feature-desc">
                Descriptive headings that capture the essence of each entry
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <BookOpen className="w-6 h-6 toc-page__feature-icon" />
              </div>
              <h3 className="toc-page__feature-title">English Text</h3>
              <p className="toc-page__feature-desc">
                Opening lines and key excerpts translated into English
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <span className="toc-page__feature-arabic-icon">ع</span>
              </div>
              <h3 className="toc-page__feature-title">Arabic Text</h3>
              <p className="toc-page__feature-desc">
                Original Arabic text in beautiful Taha font
              </p>
            </div>

            <div className="toc-page__feature-card">
              <div className="toc-page__feature-icon-box">
                <svg className="w-6 h-6 toc-page__feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="toc-page__feature-title">Manuscripts</h3>
              <p className="toc-page__feature-desc">
                Historical manuscript images and metadata for each entry
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

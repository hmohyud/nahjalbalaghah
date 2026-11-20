"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Star, Heart, Globe, Award, ChevronRight, Search, Quote, ScrollText } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { orationsApi, lettersApi, sayingsApi } from '@/api';

interface ContentCounts {
  orations: number
  letters: number
  sayings: number
}

const ExploreHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [contentCounts, setContentCounts] = useState<ContentCounts>({
    orations: 0,
    letters: 0,
    sayings: 0
  });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchContentCounts = async () => {
      try {
        setIsLoadingCounts(true);

        const [orationsResponse, lettersResponse, sayingsResponse] = await Promise.all([
          orationsApi.getOrations(1, 1),
          lettersApi.getLetters(1, 1),
          sayingsApi.getSayings(1, 1)
        ]);

        setContentCounts({
          orations: orationsResponse.meta.pagination.total,
          letters: lettersResponse.meta.pagination.total,
          sayings: sayingsResponse.meta.pagination.total
        });
      } catch (error) {
        console.error('Error fetching content counts:', error);
        setContentCounts({
          orations: 241,
          letters: 79,
          sayings: 480
        });
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchContentCounts();
  }, []);

  const stats = [
    {
      icon: ScrollText,
      label: "Sermons",
      value: isLoadingCounts ? "..." : contentCounts.orations.toString()
    },
    {
      icon: Quote,
      label: "Letters",
      value: isLoadingCounts ? "..." : contentCounts.letters.toString()
    },
    {
      icon: BookOpen,
      label: "Sayings",
      value: isLoadingCounts ? "..." : contentCounts.sayings.toString()
    },
  ];

  const features = [
    {
      icon: Search,
      title: "Comprehensive Nahj al-Balaghah Search",
      description: "Find wisdom by topic, keyword, or phrase across the entire Nahj al-Balaghah collection"
    },
    {
      icon: BookOpen,
      title: "Detailed Commentary",
      description: "Access scholarly explanations and historical context for each passage of Nahj al-Balaghah"
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Discover how others interpret and apply the teachings of Imam Ali (AS)"
    }
  ];

  return (
    <div className="explore-hero">
      <div className="explore-hero__pattern" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDVMMjUgMTVIMTVMMjAgNVoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPgo8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMCIgZmlsbD0iY3VycmVudENvbG9yIi8+CjwvcGF0aD4KPC9zdmc+')" }}></div>
      <div className="explore-hero__inner">
        <div className="explore-hero__content">
          <div className="explore-hero__content-wrapper">
            <div className="explore-hero__header">
              <div className="explore-hero__header-text">
                <h1 className="explore-hero__title">
                  Explore Nahj al-Balaghah
                </h1>
                <p className="explore-hero__subtitle">
                  Dive into the timeless wisdom of Imam Ali (AS) through sermons, letters, and sayings
                </p>
              </div>
              <div className="explore-hero__cta">
                <Button variant='solid' icon={<Search size={24} />}>
                    Start Exploring
                </Button>
              </div>
            </div>
            <div className="explore-hero__two-col">
              <div className="explore-hero__features-col">
                <div className="explore-hero__about-card">
                  <h2 className="explore-hero__about-title">About Nahj al-Balaghah</h2>
                  <div className="explore-hero__about-text">
                    <p>
                      Nahj al-Balaghah (Peak of Eloquence) is a collection of {isLoadingCounts ? '...' : contentCounts.orations} sermons, {isLoadingCounts ? '...' : contentCounts.letters} letters, and {isLoadingCounts ? '...' : contentCounts.sayings} sayings attributed to Imam Ali ibn Abi Talib (AS), compiled by Sharif al-Radi in the 10th century.
                    </p>
                    <p>
                      This monumental work represents the pinnacle of Islamic eloquence and wisdom, covering theology, philosophy, governance, ethics, and spirituality, and has inspired generations of scholars and seekers.
                    </p>
                  </div>
                  <div className="explore-hero__about-meta">
                    <div className="explore-hero__about-meta-item">
                      <ScrollText size={16} className="explore-hero__about-meta-icon" />
                      <span>3 Main Sections</span>
                    </div>
                    <div className="explore-hero__about-meta-item">
                      <BookOpen size={16} className="explore-hero__about-meta-icon" />
                      <span>Centuries of Scholarship</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="explore-hero__features-col">
                <h2 className="explore-hero__features-title">
                  Key Features
                </h2>
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="explore-hero__feature-card"
                  >
                    <div className="explore-hero__feature-row">
                      <div className="explore-hero__feature-icon-box">
                        <feature.icon className="w-6 h-6 explore-hero__feature-icon" />
                      </div>
                      <div>
                        <h3 className="explore-hero__feature-title">{feature.title}</h3>
                        <p className="explore-hero__feature-desc">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="explore-hero__stats-grid">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="explore-hero__stat-card"
                >
                  <div className="explore-hero__stat-icon-box">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 explore-hero__stat-icon" />
                  </div>
                  <div className="explore-hero__stat-value">{stat.value}</div>
                  <div className="explore-hero__stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="explore-hero__quote-bar">
        <div className="explore-hero__quote-inner">
          <div className="explore-hero__quote-card">
            <p className="explore-hero__quote-text">
              <span>"Knowledge is better than wealth:</span> Knowledge guards you, while you have to guard wealth." — Imam Ali (AS)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHero;

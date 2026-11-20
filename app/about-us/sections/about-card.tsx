"use client";
import React from 'react';
import { Button } from '@/app/components/ui';
import { FileText, BookOpen, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AboutCardSection = () => {
  const router = useRouter();

  const handleViewNotes = () => {
    router.push('/scholarly-notes');
  };

  const features = [
    { icon: BookOpen, label: "Authentic Sources" },
    { icon: Sparkles, label: "Expert Analysis" },
    { icon: FileText, label: "Detailed Notes" },
  ];

  return (
    <section className="about-card-section">
      {/* Background pattern */}
      <div className="about-card-section__bg-pattern bg-pattern-cross" />

      <div className="about-card-section__container">
        <div className="about-card-section__card">
          {/* Corner accents */}
          <div className="about-card-section__corner about-card-section__corner--tl" />
          <div className="about-card-section__corner about-card-section__corner--br" />

          <div className="about-card-section__body">
            {/* Icon */}
            <div className="about-card-section__icon-wrapper">
              <div className="about-card-section__icon-box">
                <FileText />
              </div>
            </div>

            {/* Title */}
            <h3 className="about-card-section__title">
              Scholarly Notes & Editions
            </h3>

            {/* Description */}
            <div className="about-card-section__description">
              <p>
                Explore detailed notes on the edition and translation of Nahj al-Balaghah,
                providing valuable insights into the scholarly work behind this timeless collection.
              </p>
              <p>
                Our comprehensive annotations offer deep understanding of the historical context,
                linguistic nuances, and theological significance of Imam Ali's (AS) profound teachings.
              </p>
            </div>

            {/* Features - no hover, not clickable */}
            <div className="about-card-section__features">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className="about-card-section__feature"
                >
                  <feature.icon />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - clickable, has hover */}
            <div className="about-card-section__cta-wrapper">
              <div className="about-card-section__cta">
                <Button
                  onClick={handleViewNotes}
                  variant="primary"
                  size="lg"
                >
                  View Notes on Edition and Translation
                </Button>
                {/* Outer corners on hover */}
                <div className="about-card-section__cta-corner about-card-section__cta-corner--tl" />
                <div className="about-card-section__cta-corner about-card-section__cta-corner--br" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCardSection;

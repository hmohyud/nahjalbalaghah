"use client";
import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/app/components/ui'

const SponsorsSection = () => {
  const sponsors = [
    {
      name: "Islamic Heritage Foundation",
      type: "Gold Sponsor",
      description: "Supporting Islamic education and cultural preservation worldwide.",
      website: "#"
    },
    {
      name: "Al-Azhar University",
      type: "Academic Partner",
      description: "Partnering in Islamic scholarship and research initiatives.",
      website: "#"
    },
    {
      name: "Muslim Community Center",
      type: "Community Sponsor",
      description: "Dedicated to community outreach and Islamic education programs.",
      website: "#"
    },
    {
      name: "Quranic Studies Institute",
      type: "Research Partner",
      description: "Collaborating on advanced Islamic research and publications.",
      website: "#"
    },
    {
      name: "Islamic Arts Foundation",
      type: "Cultural Partner",
      description: "Supporting the preservation of Islamic cultural heritage.",
      website: "#"
    },
    {
      name: "Global Islamic Network",
      type: "Media Partner",
      description: "Amplifying Islamic educational content worldwide.",
      website: "#"
    }
  ]

  return (
    <section className="sponsors-section">
      <div className="sponsors-section__container">
        {/* Header */}
        <div className="sponsors-section__header">
          <p className="sponsors-section__label">
            Supporting Our Mission
          </p>
          <h2 className="sponsors-section__title">
            Our Sponsors & Partners
          </h2>

          {/* Decorative ornament */}
          <div className="sponsors-section__ornament">
            <div className="sponsors-section__ornament-line sponsors-section__ornament-line--right" />
            <div className="sponsors-section__ornament-diamond" />
            <div className="sponsors-section__ornament-line sponsors-section__ornament-line--left" />
          </div>

          <p className="sponsors-section__description">
            We are grateful to our sponsors and partners who support our mission to preserve
            and share the wisdom of Nahj al-Balaghah with the global community.
          </p>
        </div>

        {/* Sponsors Grid - Cards are clickable links */}
        <div className="sponsors-section__grid">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.website}
              className="group sponsors-section__card"
            >
              {/* Corner accents on hover */}
              <div className="corner-accent-hover corner-accent-hover--top-left" />
              <div className="corner-accent-hover corner-accent-hover--bottom-right" />

              <div className="sponsors-section__card-body">
                {/* Header */}
                <div className="sponsors-section__card-header">
                  <div className="sponsors-section__card-logo">
                    <span className="sponsors-section__card-logo-text">
                      {sponsor.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="sponsors-section__card-badge">
                    {sponsor.type}
                  </span>
                </div>

                {/* Content */}
                <h3 className="sponsors-section__card-name">{sponsor.name}</h3>
                <p className="sponsors-section__card-desc">
                  {sponsor.description}
                </p>

                {/* Link indicator */}
                <span className="sponsors-section__card-link">
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="sponsors-section__cta">
          {/* Corner accents */}
          <div className="sponsors-section__cta-corner--tl" />
          <div className="sponsors-section__cta-corner--br" />

          <div className="sponsors-section__cta-body">
            <h3 className="sponsors-section__cta-title">
              Become a Sponsor
            </h3>
            <p className="sponsors-section__cta-text">
              Support our mission to preserve Islamic heritage and make Nahj al-Balaghah accessible
              to seekers of knowledge worldwide. Your partnership helps us continue this important work.
            </p>
            <a href="/contact">
              <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />}>
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SponsorsSection

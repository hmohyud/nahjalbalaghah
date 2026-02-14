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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-warm-gray)] mb-4 font-body">
            Supporting Our Mission
          </p>
          <h2 className="font-display text-3xl lg:text-5xl text-[var(--color-ink)] mb-6">
            Our Sponsors & Partners
          </h2>
          
          {/* Decorative ornament */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
          </div>
          
          <p className="font-body text-lg text-[var(--color-warm-gray)] max-w-2xl mx-auto">
            We are grateful to our sponsors and partners who support our mission to preserve
            and share the wisdom of Nahj al-Balaghah with the global community.
          </p>
        </div>

        {/* Sponsors Grid - Cards are clickable links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.website}
              className="group relative bg-[var(--color-parchment)] border border-[var(--color-stone)] transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:bg-white"
            >
              {/* Corner accents on hover */}
              <div className="absolute top-0 left-0 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-5 group-hover:h-5 transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] opacity-0 group-hover:opacity-100 group-hover:w-5 group-hover:h-5 transition-all duration-300" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-8 bg-white border border-[var(--color-stone)] flex items-center justify-center">
                    <span className="text-xs font-body font-medium text-[var(--color-primary)]">
                      {sponsor.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-xs tracking-[0.1em] uppercase font-body text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1">
                    {sponsor.type}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg text-[var(--color-ink)] mb-2">{sponsor.name}</h3>
                <p className="font-body text-sm text-[var(--color-warm-gray)] leading-relaxed mb-4">
                  {sponsor.description}
                </p>

                {/* Link indicator */}
                <span className="inline-flex items-center gap-2 text-[var(--color-primary)] font-body text-sm">
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="relative bg-[var(--color-parchment)] border border-[var(--color-stone)] max-w-3xl mx-auto">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

          <div className="p-10 text-center">
            <h3 className="font-display text-2xl text-[var(--color-ink)] mb-4">
              Become a Sponsor
            </h3>
            <p className="font-body text-[var(--color-warm-gray)] mb-8 max-w-xl mx-auto">
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

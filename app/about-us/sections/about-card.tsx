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
    <section className="relative py-24 bg-[var(--color-cream)]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        <div className="relative bg-white border border-[var(--color-stone)]">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)]" />

          <div className="p-10 lg:p-14 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-[var(--color-primary)] flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display text-3xl lg:text-4xl text-[var(--color-ink)] mb-6">
              Scholarly Notes & Editions
            </h3>

            {/* Description */}
            <div className="max-w-2xl mx-auto mb-10 space-y-4">
              <p className="font-body text-lg text-[var(--color-charcoal)] leading-relaxed">
                Explore detailed notes on the edition and translation of Nahj al-Balaghah,
                providing valuable insights into the scholarly work behind this timeless collection.
              </p>
              <p className="font-body text-base text-[var(--color-warm-gray)] leading-relaxed">
                Our comprehensive annotations offer deep understanding of the historical context,
                linguistic nuances, and theological significance of Imam Ali's (AS) profound teachings.
              </p>
            </div>

            {/* Features - no hover, not clickable */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {features.map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-parchment)] border border-[var(--color-stone)]"
                >
                  <feature.icon className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-sm font-body text-[var(--color-charcoal)]">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - clickable, has hover */}
            <div className="flex justify-center">
              <div className="group relative inline-block">
                <Button
                  onClick={handleViewNotes}
                  variant="primary"
                  size="lg"
                >
                  View Notes on Edition and Translation
                </Button>
                {/* Outer corners on hover */}
                <div className="absolute -top-1.5 -left-1.5 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
                <div className="absolute -bottom-1.5 -right-1.5 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] group-hover:w-4 group-hover:h-4 transition-all duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCardSection;

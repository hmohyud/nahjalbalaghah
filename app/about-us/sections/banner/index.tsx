"use client";
import React from 'react';
import Image from 'next/image';
import TitleImage from '@/app/assets/images/title.png';

const BannerSection = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-primary)]" />
      
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 w-16 h-16 border-l border-t border-[var(--color-accent)]/30" />
      <div className="absolute top-8 right-8 lg:top-12 lg:right-12 w-16 h-16 border-r border-t border-[var(--color-accent)]/30" />
      <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 w-16 h-16 border-l border-b border-[var(--color-accent)]/30" />
      <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 w-16 h-16 border-r border-b border-[var(--color-accent)]/30" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Title Image */}
        <div className="mb-8">
          <Image 
            src={TitleImage} 
            alt="نهج البلاغة" 
            className="h-20 sm:h-24 lg:h-32 w-auto mx-auto brightness-0 invert opacity-90"
            priority
          />
        </div>
        
        {/* Decorative ornament */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
          <div className="w-2 h-2 rotate-45 border border-white/50" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
        </div>

        <h2 className="font-display text-3xl lg:text-5xl text-white mb-8">
          Discover the Way of Eloquence
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="font-body text-lg lg:text-xl text-white/90 leading-relaxed">
            Nahj al-Balaghah is a collection of sermons, letters, and sayings of Imam Ali (AS),
          </p>
          <p className="font-body text-base lg:text-lg text-white/70 leading-relaxed">
            compiled by al-Sharīf al-Raḍī. It represents one of the most important works
            in Islamic literature, offering profound wisdom and timeless guidance.
          </p>
        </div>

        {/* Bottom accent */}
        <div className="mt-16 flex justify-center">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;

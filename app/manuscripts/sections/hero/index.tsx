'use client';
import React from 'react';
import { BookOpen, Scroll, Archive } from 'lucide-react';

const ManuscriptsHero = () => {
  return (
    <section className="relative bg-[var(--color-primary)] overflow-hidden pt-32 lg:pt-36">
      {/* Decorative corners */}
      <div className="absolute top-32 lg:top-36 left-8 lg:left-12 w-16 h-16 border-l border-t border-[var(--color-accent)]/30" />
      <div className="absolute top-32 lg:top-36 right-8 lg:right-12 w-16 h-16 border-r border-t border-[var(--color-accent)]/30" />
      <div className="absolute bottom-16 left-8 lg:left-12 w-16 h-16 border-l border-b border-[var(--color-accent)]/30" />
      <div className="absolute bottom-16 right-8 lg:right-12 w-16 h-16 border-r border-b border-[var(--color-accent)]/30" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 flex items-center justify-center">
            <Scroll className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl lg:text-6xl text-white mb-6">
          Historical Manuscripts
        </h1>

        {/* Decorative ornament */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
          <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
        </div>

        <p className="font-body text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-12">
          Explore rare manuscripts of Nahj al-Balaghah from renowned libraries across the world.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-display text-3xl lg:text-4xl text-white">6+</span>
            </div>
            <span className="text-sm font-body text-white/60 tracking-wide uppercase">Manuscripts</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Archive className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-display text-3xl lg:text-4xl text-white">5+</span>
            </div>
            <span className="text-sm font-body text-white/60 tracking-wide uppercase">Libraries</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scroll className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-display text-3xl lg:text-4xl text-white">900+</span>
            </div>
            <span className="text-sm font-body text-white/60 tracking-wide uppercase">Years Old</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManuscriptsHero;

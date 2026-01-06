'use client';
import React from 'react';
import { Mail, ArrowDown } from 'lucide-react';

const ContactHero = () => {
  const handleScrollToForm = () => {
    const formSection = document.getElementById('contact-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[var(--color-primary)] overflow-hidden pt-32 lg:pt-36">
      {/* Decorative corners */}
      <div className="absolute top-32 lg:top-36 left-8 lg:left-12 w-16 h-16 border-l border-t border-[var(--color-accent)]/30" />
      <div className="absolute top-32 lg:top-36 right-8 lg:right-12 w-16 h-16 border-r border-t border-[var(--color-accent)]/30" />
      <div className="absolute bottom-8 left-8 lg:left-12 w-16 h-16 border-l border-b border-[var(--color-accent)]/30" />
      <div className="absolute bottom-8 right-8 lg:right-12 w-16 h-16 border-r border-b border-[var(--color-accent)]/30" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl lg:text-6xl text-white mb-6">
          Get in Touch
        </h1>

        {/* Decorative ornament */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-accent)]" />
          <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-accent)]" />
        </div>

        <p className="font-body text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10">
          Have questions, feedback, or want to connect? We're here to help and would love to hear from you.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleScrollToForm}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--color-primary)] font-body font-medium hover:bg-[var(--color-cream)] transition-colors"
        >
          Send a Message
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default ContactHero;

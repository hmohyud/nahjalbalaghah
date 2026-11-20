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
    <section className="contact-hero">
      {/* Decorative corners */}
      <div className="contact-hero__corner contact-hero__corner--top-left" />
      <div className="contact-hero__corner contact-hero__corner--top-right" />
      <div className="contact-hero__corner contact-hero__corner--bottom-left" />
      <div className="contact-hero__corner contact-hero__corner--bottom-right" />

      <div className="contact-hero__container">
        {/* Icon */}
        <div className="contact-hero__icon-wrapper">
          <div className="contact-hero__icon-box">
            <Mail className="contact-hero__icon" />
          </div>
        </div>

        {/* Title */}
        <h1 className="contact-hero__title">
          Get in Touch
        </h1>

        {/* Decorative ornament */}
        <div className="contact-hero__ornament">
          <div className="contact-hero__ornament-line--right" />
          <div className="contact-hero__ornament-diamond" />
          <div className="contact-hero__ornament-line--left" />
        </div>

        <p className="contact-hero__description">
          Have questions, feedback, or want to connect? We're here to help and would love to hear from you.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleScrollToForm}
          className="contact-hero__cta"
        >
          Send a Message
          <ArrowDown className="w-4 h-4 contact-hero__cta-icon" />
        </button>
      </div>
    </section>
  );
};

export default ContactHero;

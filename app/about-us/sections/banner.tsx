"use client";
import React from 'react';
import Image from 'next/image';
import TitleImage from '@/app/assets/images/title.png';

const BannerSection = () => {
  return (
    <section className="about-banner">
      {/* Background */}
      <div className="about-banner__bg" />

      {/* Decorative corners */}
      <div className="about-banner__corner about-banner__corner--tl" />
      <div className="about-banner__corner about-banner__corner--tr" />
      <div className="about-banner__corner about-banner__corner--bl" />
      <div className="about-banner__corner about-banner__corner--br" />

      <div className="about-banner__container">
        {/* Title Image */}
        <div className="about-banner__image-wrapper">
          <Image
            src={TitleImage}
            alt="نهج البلاغة"
            className="about-banner__image"
            priority
          />
        </div>

        {/* Decorative ornament */}
        <div className="about-banner__ornament">
          <div className="about-banner__ornament-line about-banner__ornament-line--right" />
          <div className="about-banner__ornament-diamond" />
          <div className="about-banner__ornament-line about-banner__ornament-line--left" />
        </div>

        <h2 className="about-banner__heading">
          Discover the Way of Eloquence
        </h2>

        <div className="about-banner__text-wrapper">
          <p className="about-banner__text--primary">
            Nahj al-Balaghah is a collection of sermons, letters, and sayings of Imam Ali (AS),
          </p>
          <p className="about-banner__text--secondary">
            compiled by al-Sharif al-Radi. It represents one of the most important works
            in Islamic literature, offering profound wisdom and timeless guidance.
          </p>
        </div>

        {/* Bottom accent */}
        <div className="about-banner__bottom-accent">
          <div className="about-banner__bottom-line" />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;

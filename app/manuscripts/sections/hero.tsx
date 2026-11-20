'use client';
import React from 'react';

const ManuscriptsHero = ({ title = 'Manuscripts' }: { title?: string }) => {
  return (
    <div className="manuscripts-hero">
      <div className="manuscripts-hero__container">
        <h1 className="manuscripts-hero__title">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default ManuscriptsHero;

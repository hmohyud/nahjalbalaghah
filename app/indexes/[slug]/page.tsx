import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug, indexCategories } from '@/app/data/indexes';
import { IndexListing } from '@/app/components/content-widgets';

// Generate static params for all index categories at build time
export async function generateStaticParams() {
  return indexCategories.map((category) => ({
    slug: category.slug,
  }));
}

// Disable dynamic params - only pre-rendered pages will be served
export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Not Found | Nahj al-Balaghah',
    };
  }

  return {
    title: `${category.title} | Nahj al-Balaghah`,
    description: category.description,
  };
}

export default async function IndexCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="index-category-page">
      <div className="index-category-page__header">
        <div className="index-category-page__header-container">
          <div className="index-category-page__header-inner">
            <h1 className="index-category-page__title">
              {category.title}
            </h1>
            <p className="index-category-page__description">
              {category.description}
            </p>
          </div>
        </div>
      </div>
      <IndexListing items={category.items} categorySlug={slug} />
    </div>
  );
}

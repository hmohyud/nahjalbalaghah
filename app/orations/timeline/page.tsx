'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { orationsApi, type Post } from '@/api/posts';
import Timeline from '@/app/components/timeline';

export default function OrationsTimelinePage() {
  const [orations, setOrations] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllOrations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all orations
        const batchSize = 100;
        let currentPage = 1;
        let hasMore = true;
        const allData: Post[] = [];

        while (hasMore) {
          const response = await orationsApi.getOrations(currentPage, batchSize);
          if (!response || !response.data) break;
          
          const filteredData = response.data.filter(item => item.heading);
          allData.push(...filteredData);
          
          const totalPages = response.meta?.pagination?.pageCount || 1;
          hasMore = currentPage < totalPages;
          currentPage++;
        }

        setOrations(allData);
      } catch (err) {
        console.error('Error fetching orations:', err);
        setError('Failed to load orations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrations();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Link
            href="/orations"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-body text-sm lg:text-base transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orations
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--color-primary)]/10">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[var(--color-ink)]">
              Orations Timeline
            </h1>
          </div>
          
          <p className="font-body text-sm lg:text-base text-[var(--color-warm-gray)] max-w-2xl">
            Explore the sermons and discourses of Imam Ali in chronological order. 
            Click on any point to view details and navigate to the full text.
          </p>
          
          <div className="w-12 lg:w-16 h-[2px] bg-[var(--color-accent)] mt-4 lg:mt-6" />
        </div>

        {/* Timeline */}
        <div className="bg-white border border-[var(--color-stone)] p-4 sm:p-6 lg:p-8 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 lg:w-6 lg:h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 lg:w-6 lg:h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />
          
          {error ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-warm-gray)] font-body mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white font-body hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <Timeline
              contentType="orations"
              title="Orations (الخطب)"
              items={orations}
              loading={loading}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 lg:mt-8 p-4 bg-[var(--color-cream)] border border-[var(--color-stone)]">
          <h3 className="font-display text-base lg:text-lg text-[var(--color-ink)] mb-2">How to use the timeline</h3>
          <ul className="space-y-1 text-sm text-[var(--color-charcoal)] font-body">
            <li>• Click on any point to see a preview of that oration</li>
            <li>• Use the arrow buttons to navigate through the timeline</li>
            <li>• Type a number and press Enter to jump to a specific oration</li>
            <li>• Click "Go to Oration" to read the full text</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

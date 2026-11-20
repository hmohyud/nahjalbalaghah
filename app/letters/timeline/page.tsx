'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { lettersApi, type Post } from '@/api/posts';
import { Timeline } from '@/app/components/content-widgets';

export default function LettersTimelinePage() {
  const [letters, setLetters] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllLetters = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all letters
        const batchSize = 100;
        let currentPage = 1;
        let hasMore = true;
        const allData: Post[] = [];

        while (hasMore) {
          const response = await lettersApi.getLetters(currentPage, batchSize);
          if (!response || !response.data) break;

          const filteredData = response.data.filter(item => item.heading);
          allData.push(...filteredData);

          const totalPages = response.meta?.pagination?.pageCount || 1;
          hasMore = currentPage < totalPages;
          currentPage++;
        }

        setLetters(allData);
      } catch (err) {
        console.error('Error fetching letters:', err);
        setError('Failed to load letters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllLetters();
  }, []);

  return (
    <div className="timeline-wrapper">
      <div className="timeline-wrapper__container">
        {/* Header */}
        <div className="timeline-wrapper__header">
          <Link
            href="/letters"
            className="timeline-wrapper__back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Letters
          </Link>

          <div className="timeline-wrapper__title-row">
            <div className="timeline-wrapper__icon-box">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <h1 className="timeline-wrapper__title">
              Letters Timeline
            </h1>
          </div>

          <p className="timeline-wrapper__subtitle">
            Explore the epistles and correspondence of Imam Ali in chronological order.
            Click on any point to view details and navigate to the full text.
          </p>

          <div className="timeline-wrapper__accent-line" />
        </div>

        {/* Timeline */}
        <div className="timeline-wrapper__content-box">
          {/* Corner accents */}
          <div className="timeline-wrapper__corner-accent--top-left" />
          <div className="timeline-wrapper__corner-accent--bottom-right" />

          {error ? (
            <div className="timeline-wrapper__error">
              <p className="timeline-wrapper__error-text">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="timeline-wrapper__retry-btn"
              >
                Try Again
              </button>
            </div>
          ) : (
            <Timeline
              contentType="letters"
              title="Letters (&#x627;&#x644;&#x645;&#x643;&#x62A;&#x648;&#x628;&#x627;&#x62A;)"
              items={letters}
              loading={loading}
            />
          )}
        </div>

        {/* Help Text */}
        <div className="timeline-wrapper__help-box">
          <h3 className="timeline-wrapper__help-title">How to use the timeline</h3>
          <ul className="timeline-wrapper__help-list">
            <li>• Click on any point to see a preview of that letter</li>
            <li>• Use the arrow buttons to navigate through the timeline</li>
            <li>• Type a number and press Enter to jump to a specific letter</li>
            <li>• Click "Go to Letter" to read the full text</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

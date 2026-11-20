'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orationsApi, Post } from '@/api/posts';
import { manuscriptsApi, Manuscript, getManuscriptImageUrl } from '@/api/manuscripts';
import { ArrowLeft, BookOpen, FileText, Scroll, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TOCPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id) {
          setError('Invalid content ID');
          return;
        }
        const postData = await orationsApi.getOrationById(Number(id));

        if (!postData) {
          setError('Content not found');
          return;
        }

        setPost(postData);

        if (postData.sermonNumber) {
          try {
            const manuscriptsResponse = await manuscriptsApi.getManuscriptsBySection(postData.sermonNumber);
            setManuscripts(manuscriptsResponse.data || []);
          } catch (manuscriptError) {
            console.warn('No manuscripts found for this section:', manuscriptError);
            setManuscripts([]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="detail-toc__loading">
        <div className="detail-toc__loading-center">
          <Loader2 className="w-12 h-12 detail-toc__loading-icon" />
          <p className="detail-toc__loading-text">Loading Table of Contents...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="detail-toc__loading">
        <div className="detail-toc__loading-center">
          <p className="detail-toc__error-text">{error || 'Content not found'}</p>
          <button
            onClick={() => router.back()}
            className="detail-toc__error-back"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-toc">
      {/* Sub Header */}
      <div className="detail-toc__subheader">
        <div className="detail-toc__subheader-inner">
          <div className="detail-toc__subheader-row">
            <button
              onClick={() => router.back()}
              className="detail-toc__back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="detail-toc__subheader-title">
              <BookOpen className="w-5 h-5 detail-toc__subheader-icon" />
              <span className="detail-toc__subheader-label">Table of Contents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-toc__content">
        <div className="detail-toc__grid">
          {/* Left Side - TOC Content */}
          <div className="detail-toc__main">
            <div className="detail-toc__card">
              {/* Corner accents */}
              <div className="detail-toc__corner--top-left" />
              <div className="detail-toc__corner--bottom-right" />

              <div className="detail-toc__card-body">
                {/* Sermon Number Badge */}
                {post.sermonNumber && (
                  <div className="detail-toc__badge">
                    <Scroll className="w-4 h-4" />
                    Oration {post.sermonNumber}
                  </div>
                )}

                {/* Heading */}
                {post.heading && (
                  <div className="detail-toc__section">
                    <p className="detail-toc__section-label">
                      Heading
                    </p>
                    <h1 className="detail-toc__heading">
                      {post.heading}
                    </h1>
                  </div>
                )}

                {/* Decorative Divider */}
                <div className="detail-toc__divider">
                  <div className="detail-toc__divider-line" />
                  <div className="detail-toc__divider-diamond" />
                  <div className="detail-toc__divider-line--reverse" />
                </div>

                {/* TocEnglish */}
                {post.TocEnglish && (
                  <div className="detail-toc__section">
                    <p className="detail-toc__section-label">
                      English Summary
                    </p>
                    <p className="detail-toc__english-text">
                      {post.TocEnglish}
                    </p>
                  </div>
                )}

                {/* TocArabic */}
                {post.TocArabic && (
                  <div className="detail-toc__section">
                    <p className="detail-toc__section-label">
                      Arabic Summary
                    </p>
                    <p className="detail-toc__arabic-text" dir="rtl">
                      {post.TocArabic}
                    </p>
                  </div>
                )}

                {/* Link to Full Content */}
                <div className="detail-toc__read-full">
                  <Link
                    href={`/orations/details/${post.id}`}
                    className="detail-toc__read-full-link"
                  >
                    <button className="detail-toc__read-full-btn">
                      <BookOpen className="w-5 h-5" />
                      Read Full Oration
                    </button>
                    {/* Outer corners on hover */}
                    <div className="detail-toc__btn-corner--top-left" />
                    <div className="detail-toc__btn-corner--bottom-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Manuscripts */}
          <div className="detail-toc__sidebar">
            <div className="detail-toc__manuscripts-panel">
              <div className="detail-toc__manuscripts-header">
                <div className="detail-toc__manuscripts-title-row">
                  <ImageIcon className="w-5 h-5 detail-toc__manuscripts-icon" />
                  <h2 className="detail-toc__manuscripts-title">
                    Manuscripts
                  </h2>
                </div>
              </div>

              <div className="detail-toc__manuscripts-body">
                {manuscripts.length > 0 ? (
                  <div className="detail-toc__manuscripts-list">
                    {manuscripts.map((manuscript) => (
                      <div key={manuscript.id} className="detail-toc__manuscript-item">
                        {/* Manuscript Images */}
                        {manuscript.files && manuscript.files.length > 0 && (
                          <div className="detail-toc__manuscript-images">
                            {manuscript.files.map((file, index) => (
                              <div key={file.id} className="detail-toc__manuscript-image-wrapper" onClick={() => window.open(getManuscriptImageUrl(file.url), '_blank')}>
                                <img
                                  src={getManuscriptImageUrl(file.url)}
                                  alt={file.alternativeText || `Manuscript ${index + 1}`}
                                  className="detail-toc__manuscript-image"
                                />
                                <div className="detail-toc__manuscript-overlay">
                                  <ImageIcon className="w-8 h-8 detail-toc__manuscript-overlay-icon" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Manuscript Metadata */}
                        <div className="detail-toc__manuscript-meta">
                          {manuscript.bookName && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Book:</span>
                              <span className="detail-toc__meta-value">{manuscript.bookName}</span>
                            </div>
                          )}
                          {manuscript.siglaEnglish && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Sigla:</span>
                              <span className="detail-toc__meta-value">{manuscript.siglaEnglish}</span>
                            </div>
                          )}
                          {manuscript.gregorianYear && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Year:</span>
                              <span className="detail-toc__meta-value">{manuscript.gregorianYear}</span>
                            </div>
                          )}
                          {manuscript.holdingInstitution && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Institution:</span>
                              <span className="detail-toc__meta-value">{manuscript.holdingInstitution}</span>
                            </div>
                          )}
                          {manuscript.city && manuscript.country && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Location:</span>
                              <span className="detail-toc__meta-value">{manuscript.city}, {manuscript.country}</span>
                            </div>
                          )}
                          {manuscript.catalogNumber && (
                            <div className="detail-toc__meta-row">
                              <span className="detail-toc__meta-label">Catalog #:</span>
                              <span className="detail-toc__meta-value">{manuscript.catalogNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="detail-toc__manuscripts-empty">
                    <ImageIcon className="w-12 h-12 detail-toc__manuscripts-empty-icon" />
                    <p className="detail-toc__manuscripts-empty-text">
                      No manuscripts available for this section yet.
                    </p>
                    <p className="detail-toc__manuscripts-empty-subtext">
                      Currently available: Sections 1.1, 1.2, and 1.3
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

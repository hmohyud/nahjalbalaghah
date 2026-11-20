'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lettersApi, Post } from '@/api/posts';
import { manuscriptsApi, Manuscript, getManuscriptImageUrl } from '@/api/manuscripts';
import { ArrowLeft, BookOpen, FileText, Mail, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LetterTOCPage() {
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
        const postData = await lettersApi.getLetterById(Number(id));

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

              <div className="detail-toc__card-body--compact">
                {/* Letter Number Badge */}
                {post.sermonNumber && (
                  <div className="detail-toc__badge--compact">
                    <Mail className="w-4 h-4" />
                    Letter {post.sermonNumber}
                  </div>
                )}

                {/* Heading */}
                {post.heading && (
                  <div className="detail-toc__section--compact">
                    <div className="detail-toc__section-label-row">
                      <FileText className="w-4 h-4 detail-toc__section-label-icon" />
                      <h3 className="detail-toc__section-label">
                        Heading
                      </h3>
                    </div>
                    <h1 className="detail-toc__heading--compact">
                      {post.heading}
                    </h1>
                  </div>
                )}

                {/* Divider */}
                <div className="detail-toc__divider">
                  <div className="detail-toc__divider-line--solid" />
                  <div className="detail-toc__divider-diamond" />
                  <div className="detail-toc__divider-line--solid" />
                </div>

                {/* TocEnglish */}
                {post.TocEnglish && (
                  <div className="detail-toc__section--compact">
                    <div className="detail-toc__section-label-row">
                      <FileText className="w-4 h-4 detail-toc__section-label-icon" />
                      <h3 className="detail-toc__section-label">
                        English
                      </h3>
                    </div>
                    <p className="detail-toc__english-text">
                      {post.TocEnglish}
                    </p>
                  </div>
                )}

                {/* TocArabic */}
                {post.TocArabic && (
                  <div className="detail-toc__section--compact">
                    <div className="detail-toc__section-label-row">
                      <FileText className="w-4 h-4 detail-toc__section-label-icon" />
                      <h3 className="detail-toc__section-label">
                        Arabic
                      </h3>
                    </div>
                    <div className="detail-toc__arabic-block">
                      <p className="detail-toc__arabic-block-text" dir="rtl">
                        {post.TocArabic}
                      </p>
                    </div>
                  </div>
                )}

                {/* Link to Full Content */}
                <div className="detail-toc__read-full--compact">
                  <Link
                    href={`/letters/details/${post.id}`}
                    className="detail-toc__read-full-simple"
                  >
                    <Mail className="w-5 h-5" />
                    Read Full Letter
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Manuscripts */}
          <div className="detail-toc__sidebar">
            <div className="detail-toc__manuscripts-panel detail-toc__manuscripts-panel--relative">
              {/* Corner accents */}
              <div className="detail-toc__corner--top-left-sm" />
              <div className="detail-toc__corner--bottom-right-sm" />

              <div className="detail-toc__manuscripts-header--no-border">
                <div className="detail-toc__manuscripts-title-row--compact">
                  <ImageIcon className="w-5 h-5 detail-toc__manuscripts-icon" />
                  <h2 className="detail-toc__manuscripts-title--compact">
                    Manuscripts
                  </h2>
                </div>

                {manuscripts.length > 0 ? (
                  <div className="detail-toc__manuscripts-list">
                    {manuscripts.map((manuscript) => (
                      <div key={manuscript.id} className="detail-toc__manuscript-item">
                        {/* Manuscript Images */}
                        {manuscript.files && manuscript.files.length > 0 && (
                          <div className="detail-toc__manuscript-images">
                            {manuscript.files.map((file, index) => (
                              <div
                                key={file.id}
                                className="detail-toc__manuscript-image-wrapper--hoverable"
                                onClick={() => window.open(getManuscriptImageUrl(file.url), '_blank')}
                              >
                                <img
                                  src={getManuscriptImageUrl(file.url)}
                                  alt={file.alternativeText || `Manuscript ${index + 1}`}
                                  className="detail-toc__manuscript-image--hoverable"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Manuscript Metadata */}
                        <div className="detail-toc__manuscript-meta">
                          {manuscript.bookName && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Book:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.bookName}</span>
                            </div>
                          )}
                          {manuscript.siglaEnglish && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Sigla:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.siglaEnglish}</span>
                            </div>
                          )}
                          {manuscript.gregorianYear && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Year:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.gregorianYear}</span>
                            </div>
                          )}
                          {manuscript.holdingInstitution && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Institution:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.holdingInstitution}</span>
                            </div>
                          )}
                          {manuscript.city && manuscript.country && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Location:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.city}, {manuscript.country}</span>
                            </div>
                          )}
                          {manuscript.catalogNumber && (
                            <div>
                              <span className="detail-toc__meta-label-inline">Catalog #:</span>
                              <span className="detail-toc__meta-value-inline">{manuscript.catalogNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="detail-toc__manuscripts-empty--compact">
                    <ImageIcon className="w-12 h-12 detail-toc__manuscripts-empty-icon--compact" />
                    <p className="detail-toc__manuscripts-empty-text">
                      No manuscripts available for this section yet.
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

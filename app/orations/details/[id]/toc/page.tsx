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
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center pt-32 lg:pt-36">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-warm-gray)] font-body">Loading Table of Contents...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center pt-32 lg:pt-36">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-body">{error || 'Content not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-[var(--color-primary)] hover:underline font-body"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-32 lg:pt-36">
      {/* Sub Header */}
      <div className="bg-white border-b border-[var(--color-stone)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors font-body"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-display text-lg text-[var(--color-ink)]">Table of Contents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - TOC Content */}
          <div className="lg:col-span-2">
            <div className="group relative bg-white border border-[var(--color-stone)]">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />

              <div className="p-8 lg:p-10">
                {/* Sermon Number Badge */}
                {post.sermonNumber && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-body tracking-wide uppercase mb-8">
                    <Scroll className="w-4 h-4" />
                    Oration {post.sermonNumber}
                  </div>
                )}

                {/* Heading */}
                {post.heading && (
                  <div className="mb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-warm-gray)] mb-3 font-body">
                      Heading
                    </p>
                    <h1 className="font-display text-3xl lg:text-4xl text-[var(--color-ink)] leading-tight">
                      {post.heading}
                    </h1>
                  </div>
                )}

                {/* Decorative Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-stone)]" />
                  <div className="w-2 h-2 rotate-45 border border-[var(--color-accent)]" />
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-stone)]" />
                </div>

                {/* TocEnglish */}
                {post.TocEnglish && (
                  <div className="mb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-warm-gray)] mb-3 font-body">
                      English Summary
                    </p>
                    <p className="text-lg text-[var(--color-charcoal)] leading-relaxed font-body">
                      {post.TocEnglish}
                    </p>
                  </div>
                )}

                {/* TocArabic */}
                {post.TocArabic && (
                  <div className="mb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-warm-gray)] mb-3 font-body">
                      Arabic Summary
                    </p>
                    <p className="text-2xl text-[var(--color-ink)] leading-relaxed font-taha text-right" dir="rtl">
                      {post.TocArabic}
                    </p>
                  </div>
                )}

                {/* Link to Full Content */}
                <div className="mt-10 pt-8 border-t border-[var(--color-stone)]">
                  <Link
                    href={`/orations/details/${post.id}`}
                    className="group/btn relative inline-block"
                  >
                    <button className="relative inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-primary)] text-white text-sm tracking-[0.1em] uppercase font-body font-medium hover:bg-[var(--color-primary-dark)] transition-colors duration-200">
                      <BookOpen className="w-5 h-5" />
                      Read Full Oration
                    </button>
                    {/* Outer corners on hover */}
                    <div className="absolute -top-1.5 -left-1.5 w-0 h-0 border-l-2 border-t-2 border-[var(--color-accent)] group-hover/btn:w-4 group-hover/btn:h-4 transition-all duration-200" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-0 h-0 border-r-2 border-b-2 border-[var(--color-accent)] group-hover/btn:w-4 group-hover/btn:h-4 transition-all duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Manuscripts */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[var(--color-stone)] sticky top-28">
              <div className="p-6 border-b border-[var(--color-stone)]">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
                  <h2 className="font-display text-xl text-[var(--color-ink)]">
                    Manuscripts
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {manuscripts.length > 0 ? (
                  <div className="space-y-6">
                    {manuscripts.map((manuscript) => (
                      <div key={manuscript.id} className="border-b border-[var(--color-stone)] pb-6 last:border-b-0 last:pb-0">
                        {/* Manuscript Images */}
                        {manuscript.files && manuscript.files.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {manuscript.files.map((file, index) => (
                              <div key={file.id} className="relative group cursor-pointer" onClick={() => window.open(getManuscriptImageUrl(file.url), '_blank')}>
                                <img
                                  src={getManuscriptImageUrl(file.url)}
                                  alt={file.alternativeText || `Manuscript ${index + 1}`}
                                  className="w-full border border-[var(--color-stone)] hover:border-[var(--color-primary)]/40 transition-all duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Manuscript Metadata */}
                        <div className="space-y-2 text-sm font-body">
                          {manuscript.bookName && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Book:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.bookName}</span>
                            </div>
                          )}
                          {manuscript.siglaEnglish && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Sigla:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.siglaEnglish}</span>
                            </div>
                          )}
                          {manuscript.gregorianYear && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Year:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.gregorianYear}</span>
                            </div>
                          )}
                          {manuscript.holdingInstitution && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Institution:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.holdingInstitution}</span>
                            </div>
                          )}
                          {manuscript.city && manuscript.country && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Location:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.city}, {manuscript.country}</span>
                            </div>
                          )}
                          {manuscript.catalogNumber && (
                            <div className="flex">
                              <span className="text-[var(--color-warm-gray)] w-24">Catalog #:</span>
                              <span className="text-[var(--color-charcoal)]">{manuscript.catalogNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-[var(--color-stone)] mx-auto mb-4" />
                    <p className="text-[var(--color-warm-gray)] font-body text-sm">
                      No manuscripts available for this section yet.
                    </p>
                    <p className="text-[var(--color-stone)] text-xs mt-2 font-body">
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

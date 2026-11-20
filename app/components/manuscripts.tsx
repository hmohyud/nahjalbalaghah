'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Grid3x3, Image as ImageIcon, X, Loader2, FileText, Book,
  Image, FileText as TextIcon, BookOpen, ExternalLink,
  Calendar, MapPin, Shield, Package, Award, Archive, Globe, Home
} from 'lucide-react';
import { manuscriptsApi, Manuscript, getManuscriptImageUrl } from '@/api/manuscripts';
import { type Post } from '@/api/posts';
import { formatTextWithFootnotes } from '@/app/utils/text-formatting';
import { ManuscriptMetadata as ManuscriptMetadataType } from '@/app/data/manuscripts';
import { Button, Select } from './ui';

// ============================================================================
// ManuscriptViewer
// ============================================================================

type ViewMode = 'single' | 'gallery';

interface ManuscriptViewerProps {
  pages: (string | null)[];
  bookName: string;
}

const MissingPagePlaceholder: React.FC<{ pageNumber: number; className?: string }> = ({ pageNumber, className = '' }) => (
  <div className={`ms-viewer__missing-page ${className}`}>
    <div className="ms-viewer__missing-page-inner">
      <svg className="w-16 h-16 ms-viewer__missing-page-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="ms-viewer__missing-page-title">Page Missing</h3>
      <p className="ms-viewer__missing-page-text">This page is missing from this manuscript.</p>
      <p className="ms-viewer__missing-page-number">Page {pageNumber}</p>
    </div>
  </div>
);

export const ManuscriptViewer: React.FC<ManuscriptViewerProps> = ({ pages, bookName }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 25));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => prev === 'single' ? 'gallery' : 'single');
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentPage(index);
    if (viewMode === 'gallery') {
      setViewMode('single');
    }
  };

  return (
    <>
      {isExpanded && (
        <div
          className="ms-viewer__overlay"
          onClick={toggleExpand}
        />
      )}

      <div className={`ms-viewer__wrapper ${
        isExpanded ? 'ms-viewer__wrapper--expanded' : 'ms-viewer__wrapper--relative'
      }`}
>
        <div className="ms-viewer__toolbar">
        <div className="ms-viewer__toolbar-group">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="ms-viewer__btn"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="ms-viewer__zoom-label">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="ms-viewer__btn"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
        <div className="ms-viewer__toolbar-group">
          <button
            onClick={toggleViewMode}
            className={`ms-viewer__btn ${
              viewMode === 'gallery' ? 'ms-viewer__btn--active' : ''
            }`}
            aria-label={viewMode === 'gallery' ? 'Single page view' : 'Gallery view'}
          >
            {viewMode === 'gallery' ? <ImageIcon className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleExpand}
            className="ms-viewer__btn"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      <div className="ms-viewer__layout">
        <div className="ms-viewer__sidebar">
          <div className="ms-viewer__sidebar-thumbs">
              {pages.map((page, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`ms-viewer__thumb ${
                  currentPage === index
                    ? 'ms-viewer__thumb--active'
                    : ''
                }`}
                aria-label={`Page ${index + 1}`}
              >
                {page ? (
                  <img
                    src={page}
                    alt={`Page ${index + 1} thumbnail`}
                    className="ms-viewer__thumb-img"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/file.svg';
                    }}
                  />
                ) : (
                  <div className="ms-viewer__thumb-missing">
                    <svg className="w-6 h-6" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="ms-viewer__main">
          {viewMode === 'single' ? (
            pages[currentPage] ? (
              <div className="ms-viewer__single-page">
                <div
                  className="ms-viewer__page-image-wrapper"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center'
                  }}
                >
                  <img
                    src={pages[currentPage]}
                    alt={`${bookName} - Page ${currentPage + 1}`}
                    className="ms-viewer__page-image"
                  />
                </div>
              </div>
            ) : (
              <MissingPagePlaceholder pageNumber={currentPage + 1} />
            )
          ) : (
            <div className="ms-viewer__gallery">
              {pages.map((page, index) => (
                <div
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className="ms-viewer__gallery-item"
                >
                  {page ? (
                    <>
                      <img
                        src={page}
                        alt={`${bookName} - Page ${index + 1}`}
                        className="ms-viewer__gallery-item-img"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          console.error('Image failed to load:', page);
                          target.onerror = null;
                          target.src = '/file.svg';
                        }}
                      />
                      <div className="ms-viewer__gallery-overlay">
                        <span className="ms-viewer__gallery-overlay-text">
                          Page {index + 1}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="ms-viewer__gallery-missing">
                      <div className="ms-viewer__gallery-missing-inner">
                        <svg className="w-12 h-12" style={{ color: '#9ca3af', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="ms-viewer__gallery-missing-page">Page {index + 1}</p>
                        <p className="ms-viewer__gallery-missing-label">Missing</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {viewMode === 'single' && (
        <div className="ms-viewer__pagination-bar">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="ms-viewer__nav-btn"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ms-viewer__nav-btn-text">Previous</span>
          </button>

          <div className="ms-viewer__page-counter">
            Page {currentPage + 1} of {pages.length}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === pages.length - 1}
            className="ms-viewer__nav-btn"
            aria-label="Next page"
          >
            <span className="ms-viewer__nav-btn-text">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
    </>
  );
};

// ============================================================================
// ManuscriptComparisonModal
// ============================================================================

interface ManuscriptComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Post | RadisContent;
    contentType: 'orations' | 'letters' | 'sayings' | 'radis' | 'conclusion';
}

interface RadisContent {
    id: number;
    number: string;
    arabic: string;
    translation: string;
    heading?: string;
    sermonNumber?: string;
    paragraphs?: any[];
    title?: string;
    translations?: any[];
    footnotes?: any[];
}

const ComparisonMissingPagePlaceholder: React.FC<{ pageNumber: number; className?: string }> = ({ pageNumber, className = '' }) => (
    <div className={`ms-comparison__missing-page ${className}`}>
        <div className="ms-comparison__missing-page-inner">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 ms-comparison__missing-page-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="ms-comparison__missing-page-title">Page Missing</h3>
            <p className="ms-comparison__missing-page-text">This page is missing from this manuscript.</p>
            <p className="ms-comparison__missing-page-number">Page {pageNumber}</p>
        </div>
    </div>
);

export function ManuscriptComparisonModal({
    isOpen,
    onClose,
    content,
    contentType
}: ManuscriptComparisonModalProps) {
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState<'manuscript' | 'content'>('manuscript');

    const getSectionNumber = () => {
        if (contentType === 'radis' && 'number' in content) {
            return `0.${content.number}`;
        }
        return (content as Post).sermonNumber || null;
    };

    const sectionNumber = getSectionNumber();

    useEffect(() => {
        if (isOpen && sectionNumber) {
            fetchManuscripts();
        }
    }, [isOpen, sectionNumber]);

    const fetchManuscripts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await manuscriptsApi.getManuscriptsBySection(sectionNumber!);
            if (response.data && response.data.length > 0) {
                setManuscripts(response.data);
                setSelectedManuscript(response.data[0]);
                setCurrentPage(0);
            } else {
                setError('No manuscripts found for this section.');
            }
        } catch (err) {
            console.error('Error fetching manuscripts:', err);
            setError('Failed to load manuscripts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(200, prev + 25));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(50, prev - 25));
    };

    const toggleImageFullscreen = () => {
        setIsImageFullscreen(!isImageFullscreen);
    };

    const allPages = useMemo(() => {
        return manuscripts.flatMap(manuscript =>
            (manuscript.files || []).map(file => ({
                url: getManuscriptImageUrl(file.url),
                manuscript: manuscript,
                file: file
            }))
        );
    }, [manuscripts]);

    const currentPageData = useMemo(() => {
        if (currentPage < 0 || currentPage >= allPages.length) return null;
        return allPages[currentPage];
    }, [allPages, currentPage]);

    const currentPageUrl = currentPageData?.url || '';

    const displayedManuscript = currentPageData?.manuscript || selectedManuscript;

    const handleManuscriptChange = useCallback((manuscript: Manuscript) => {
        const firstPageIndex = allPages.findIndex(p => p.manuscript.id === manuscript.id);
        setSelectedManuscript(manuscript);
        if (firstPageIndex >= 0) {
            setCurrentPage(firstPageIndex);
        }
    }, [allPages]);

    const handlePrevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(allPages.length - 1, prev + 1));
    }, [allPages.length]);

    const handlePageClick = useCallback((index: number) => {
        setCurrentPage(index);
    }, []);

    const cleanArabicText = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/<center>|<\/center>/gi, '')
            .replace(/<span[^>]*>|<\/span>/gi, '')
            .replace(/&nbsp;/gi, ' ')
            .trim();
    };

    const getManuscriptDisplayName = useCallback((ms: Manuscript): string => {
        if (ms.bookName) return ms.bookName;
        if (ms.library) return ms.library;
        const firstFileName = ms.files?.[0]?.name?.toLowerCase() || '';
        if (firstFileName.includes("mar'ashi") || firstFileName.includes("marashi") || firstFileName.includes("qum_mar")) return "Mar'ashi MS";
        if (firstFileName.includes("shahrastan")) return "Shahrastani MS";
        if (firstFileName.includes("rampur")) return "Rampur Raza MS";
        return `Manuscript ${ms.id}`;
    }, []);

    const sortedParagraphs = [...(content.paragraphs || [])].sort((a, b) => {
        const parseNumber = (num: string) => {
            return num.split('.').map(n => parseInt(n, 10));
        };
        const aNumbers = parseNumber(a.number);
        const bNumbers = parseNumber(b.number);
        for (let i = 0; i < Math.max(aNumbers.length, bNumbers.length); i++) {
            const aNum = aNumbers[i] || 0;
            const bNum = bNumbers[i] || 0;
            if (aNum !== bNum) {
                return aNum - bNum;
            }
        }
        return 0;
    });

    const allFootnotes = [
        ...(content.footnotes || []),
        ...((content.paragraphs || []).flatMap((p: any) => p.footnotes || []))
    ];

    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 50,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    const InternalManuscriptViewer = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className="ms-comparison__viewer">
            {manuscripts.length > 0 && (
                <div className={`ms-comparison__viewer-select ${isMobileView ? 'ms-comparison__viewer-select--mobile' : ''}`}>
                    <label className={`ms-comparison__viewer-select-label ${isMobileView ? 'ms-comparison__viewer-select-label--mobile' : ''}`}>
                        Select Manuscript:
                    </label>
                    <Select
                        value={String(displayedManuscript?.id || '')}
                        onChange={(value) => {
                            const ms = manuscripts.find(m => m.id === parseInt(value));
                            if (ms) handleManuscriptChange(ms);
                        }}
                        options={manuscripts.map(ms => ({
                            value: String(ms.id),
                            label: `${getManuscriptDisplayName(ms)} ${ms.gregorianYear ? `- ${ms.gregorianYear}` : ''}`
                        }))}
                    />
                </div>
            )}

            <div className={`ms-comparison__viewer-toolbar ${isMobileView ? 'ms-comparison__viewer-toolbar--mobile' : ''}`}>
                <div className="ms-comparison__viewer-toolbar-group">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="ms-comparison__viewer-btn"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className={`ms-comparison__viewer-zoom-label ${isMobileView ? 'ms-comparison__viewer-zoom-label--mobile' : ''}`}>
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className="ms-comparison__viewer-btn"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
                <div className="ms-comparison__viewer-toolbar-nav-group">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className={`ms-comparison__viewer-nav-btn ${isMobileView ? 'ms-comparison__viewer-nav-btn--mobile' : 'ms-comparison__viewer-nav-btn--default'}`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="ms-comparison__viewer-nav-label">Prev</span>
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === allPages.length - 1}
                        className={`ms-comparison__viewer-nav-btn ${isMobileView ? 'ms-comparison__viewer-nav-btn--mobile' : 'ms-comparison__viewer-nav-btn--default'}`}
                        aria-label="Next page"
                    >
                        <span className="ms-comparison__viewer-nav-label">Next</span>
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                </div>
                <div className="ms-comparison__viewer-toolbar-group">
                    <div className={`ms-comparison__viewer-page-counter ${isMobileView ? 'ms-comparison__viewer-page-counter--mobile' : ''}`}>
                        {currentPage + 1}/{allPages.length}
                    </div>
                    <button
                        onClick={toggleImageFullscreen}
                        className="ms-comparison__viewer-btn"
                        aria-label={isImageFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
                    >
                        {isImageFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="ms-comparison__viewer-image-area">
                {allPages.length > 0 ? (
                    currentPageUrl ? (
                        <div className="ms-comparison__viewer-center">
                            <img
                                key={`page-${currentPage}-${currentPageUrl}`}
                                src={currentPageUrl}
                                alt={`Manuscript page ${currentPage + 1}`}
                                className="ms-comparison__viewer-img"
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                            />
                        </div>
                    ) : (
                        <ComparisonMissingPagePlaceholder pageNumber={currentPage + 1} />
                    )
                ) : (
                    <div className="ms-comparison__viewer-empty">
                        <p>No images available</p>
                    </div>
                )}
            </div>

            <div className={`ms-comparison__viewer-dots-bar ${isMobileView ? 'ms-comparison__viewer-dots-bar--mobile' : ''}`}>
                <div className="ms-viewer__pagination-dots">
                    {allPages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handlePageClick(idx)}
                            className={`ms-viewer__pagination-dot ${currentPage === idx ? 'ms-viewer__pagination-dot--active' : 'ms-viewer__pagination-dot--default'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const ContentViewer = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className="ms-comparison__content">
            <div className={`ms-comparison__content-header ${isMobileView ? 'ms-comparison__content-header--mobile' : ''}`}>
                <h4 className={`ms-comparison__content-title ${isMobileView ? 'ms-comparison__content-title--mobile' : ''}`}>Content</h4>
                <p className={`ms-comparison__content-section-number ${isMobileView ? 'ms-comparison__content-section-number--mobile' : ''}`}>Section {content.sermonNumber}</p>
            </div>
            <div className={`ms-comparison__content-body ${isMobileView ? 'ms-comparison__content-body--mobile' : ''}`}>
                {content.title && (
                    <div className={`ms-comparison__content-title-block ${isMobileView ? 'ms-comparison__content-title-block--mobile' : ''}`}>
                        <div className={`ms-comparison__content-title-arabic ${isMobileView ? 'ms-comparison__content-title-arabic--mobile' : ''}`}>
                            <p className={`ms-comparison__content-title-arabic-text font-taha ${isMobileView ? 'ms-comparison__content-title-arabic-text--mobile' : ''}`} dir="rtl">
                                {formatTextWithFootnotes(cleanArabicText(content.title), allFootnotes, true, content.sermonNumber || 'main')}
                            </p>
                        </div>
                        {content.translations?.find((t: { type: string; text: string }) => t.type === 'en') && (
                            <div className={`ms-comparison__content-title-english ${isMobileView ? 'ms-comparison__content-title-english--mobile' : ''}`}>
                                <p className={`ms-comparison__content-title-english-text font-brill ${isMobileView ? 'ms-comparison__content-title-english-text--mobile' : ''}`}>
                                    {formatTextWithFootnotes(
                                        content.translations!.find((t: { type: string; text: string }) => t.type === 'en')!.text,
                                        allFootnotes,
                                        false,
                                        sectionNumber || 'main'
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {sortedParagraphs.map((paragraph) => {
                    const englishTranslation = paragraph.translations?.find((t: { type: string; text: string }) => t.type === 'en');
                    return (
                        <div key={paragraph.id} className={`ms-comparison__content-block ${isMobileView ? 'ms-comparison__content-block--mobile' : ''}`}>
                            {paragraph.number && (
                                <span className="ms-comparison__content-paragraph-badge">
                                    {paragraph.number}
                                </span>
                            )}
                            {paragraph.arabic && (
                                <div className={`ms-comparison__content-arabic ${isMobileView ? 'ms-comparison__content-arabic--mobile' : ''}`}>
                                    <p className={`ms-comparison__content-arabic-text font-taha ${isMobileView ? 'ms-comparison__content-arabic-text--mobile' : ''}`} dir="rtl">
                                        {formatTextWithFootnotes(cleanArabicText(paragraph.arabic), allFootnotes, true, paragraph.number)}
                                    </p>
                                </div>
                            )}
                            {englishTranslation && (
                                <div className={`ms-comparison__content-english-block ${isMobileView ? 'ms-comparison__content-english-block--mobile' : ''}`}>
                                    <p className={`ms-comparison__content-english-text font-brill ${isMobileView ? 'ms-comparison__content-english-text--mobile' : ''}`}>
                                        {formatTextWithFootnotes(englishTranslation.text, allFootnotes, false, paragraph.number)}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}

                {sortedParagraphs.length === 0 && !content.title && (
                    <div className="ms-comparison__content-empty">
                        <p>No content available</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="ms-comparison__root">
                    <motion.div
                        className="ms-comparison__backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    <motion.div
                        className="ms-comparison__modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ms-comparison__header">
                            <div className="ms-comparison__header-left">
                                <div className="ms-comparison__header-icon">
                                    <Book className="w-4 h-4 lg:w-5 lg:h-5" style={{ color: '#43896B' }} />
                                </div>
                                <div className="ms-comparison__header-info">
                                    <h3 className="ms-comparison__header-title">Compare Manuscripts</h3>
                                    <p className="ms-comparison__header-subtitle">
                                        {content.heading ? (
                                            <span className="ms-comparison__header-subtitle-heading">{content.heading}</span>
                                        ) : null}
                                        {!loading && manuscripts.length > 0 && (
                                            <span className="ms-comparison__header-count">
                                                {content.heading && <span className="ms-comparison__header-separator">•</span>} {manuscripts.length} manuscript{manuscripts.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="ms-comparison__close-btn"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="ms-comparison__body">
                            {loading ? (
                                <div className="ms-comparison__loading">
                                    <div className="ms-comparison__loading-inner">
                                        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin ms-comparison__spinner" />
                                        <p className="ms-comparison__loading-text">Loading manuscripts...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="ms-comparison__error">
                                    <div className="ms-comparison__error-inner">
                                        <FileText className="w-10 h-10 lg:w-12 lg:h-12 ms-comparison__error-icon" />
                                        <p className="ms-comparison__error-text">{error}</p>
                                        <button
                                            onClick={fetchManuscripts}
                                            className="ms-comparison__retry-btn"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isImageFullscreen && (
                                        <div className="ms-comparison__fullscreen">
                                            <div className="ms-comparison__fullscreen-toolbar">
                                                <div className="ms-comparison__fullscreen-group">
                                                    <button
                                                        onClick={handleZoomOut}
                                                        disabled={zoom <= 50}
                                                        className="ms-comparison__fullscreen-btn"
                                                    >
                                                        <ZoomOut className="w-4 h-4" style={{ color: 'white' }} />
                                                    </button>
                                                    <span className="ms-comparison__fullscreen-zoom-label">{zoom}%</span>
                                                    <button
                                                        onClick={handleZoomIn}
                                                        disabled={zoom >= 200}
                                                        className="ms-comparison__fullscreen-btn"
                                                    >
                                                        <ZoomIn className="w-4 h-4" style={{ color: 'white' }} />
                                                    </button>
                                                </div>
                                                <div className="ms-comparison__fullscreen-nav-group">
                                                    <button
                                                        onClick={handlePrevPage}
                                                        disabled={currentPage === 0}
                                                        className="ms-comparison__fullscreen-nav-btn"
                                                        aria-label="Previous page"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                                                        <span className="ms-comparison__fullscreen-nav-label">Prev</span>
                                                    </button>
                                                    <button
                                                        onClick={handleNextPage}
                                                        disabled={currentPage === allPages.length - 1}
                                                        className="ms-comparison__fullscreen-nav-btn"
                                                        aria-label="Next page"
                                                    >
                                                        <span className="ms-comparison__fullscreen-nav-label">Next</span>
                                                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                                    </button>
                                                </div>
                                                <div className="ms-comparison__fullscreen-group">
                                                    <div className="ms-comparison__fullscreen-page-counter">
                                                        {currentPage + 1}/{allPages.length}
                                                    </div>
                                                    <button
                                                        onClick={toggleImageFullscreen}
                                                        className="ms-comparison__fullscreen-btn"
                                                        aria-label="Exit fullscreen"
                                                    >
                                                        <Minimize2 className="w-4 h-4" style={{ color: 'white' }} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="ms-comparison__fullscreen-content">
                                                {allPages.length > 0 ? (
                                                    currentPageUrl ? (
                                                        <div className="ms-comparison__fullscreen-center">
                                                            <img
                                                                key={`fullscreen-${currentPage}-${currentPageUrl}`}
                                                                src={currentPageUrl}
                                                                alt={`Manuscript page ${currentPage + 1}`}
                                                                className="ms-comparison__fullscreen-img"
                                                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <ComparisonMissingPagePlaceholder pageNumber={currentPage + 1} className="text-white" />
                                                    )
                                                ) : (
                                                    <div className="ms-comparison__fullscreen-empty">
                                                        <p>No images available</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ms-comparison__fullscreen-dots-bar">
                                                <div className="ms-comparison__fullscreen-dots">
                                                    {allPages.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handlePageClick(idx)}
                                                            className={`ms-comparison__fullscreen-dot ${currentPage === idx ? 'ms-comparison__fullscreen-dot--active' : 'ms-comparison__fullscreen-dot--default'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="ms-comparison__mobile-tabs">
                                        <div className="ms-comparison__mobile-tabs-inner">
                                            <button
                                                onClick={() => setActiveTab('manuscript')}
                                                className={`ms-comparison__tab-btn ${
                                                    activeTab === 'manuscript'
                                                        ? 'ms-comparison__tab-btn--active'
                                                        : 'ms-comparison__tab-btn--inactive'
                                                }`}
                                            >
                                                <Image className="w-4 h-4" />
                                                Manuscript
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('content')}
                                                className={`ms-comparison__tab-btn ${
                                                    activeTab === 'content'
                                                        ? 'ms-comparison__tab-btn--active'
                                                        : 'ms-comparison__tab-btn--inactive'
                                                }`}
                                            >
                                                <TextIcon className="w-4 h-4" />
                                                Content
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ms-comparison__mobile-panel">
                                        {activeTab === 'manuscript' ? (
                                            <InternalManuscriptViewer isMobileView={true} />
                                        ) : (
                                            <ContentViewer isMobileView={true} />
                                        )}
                                    </div>

                                    <div className="ms-comparison__desktop-split">
                                        <div className="ms-comparison__desktop-left">
                                            <InternalManuscriptViewer isMobileView={false} />
                                        </div>
                                        <div className="ms-comparison__desktop-right">
                                            <ContentViewer isMobileView={false} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// ManuscriptCountBadge
// ============================================================================

interface ManuscriptCountBadgeProps {
  count: number;
}

export const ManuscriptCountBadge: React.FC<ManuscriptCountBadgeProps> = ({ count }) => {
  if (count === 0) {
    return null;
  }

  const handleClick = () => {
    const manuscriptSection = document.getElementById('manuscript-references');
    if (manuscriptSection) {
      manuscriptSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="ms-badge__btn"
      aria-label={`Scroll to ${count} manuscript ${count === 1 ? 'reference' : 'references'}`}
    >
      <BookOpen className="w-3.5 h-3.5" />
      <span>
        {count} {count === 1 ? 'Manuscript' : 'Manuscripts'}
      </span>
    </button>
  );
};

// ============================================================================
// ManuscriptMetadataDisplay
// ============================================================================

interface ManuscriptMetadataDisplayProps {
  metadata: ManuscriptMetadataType;
}

type MetadataTab = 'overview' | 'details' | 'provenance';

interface MetadataField {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const ManuscriptMetadataDisplay: React.FC<ManuscriptMetadataDisplayProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<MetadataTab>('overview');

  const overviewFields: MetadataField[] = [
    { label: 'Sigla (Arabic)', value: metadata.siglaArabic, icon: <Book className="w-4 h-4" /> },
    { label: 'Sigla (English)', value: metadata.siglaEnglish, icon: <Book className="w-4 h-4" /> },
    { label: 'Hijri Year', value: metadata.hijriYear, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Gregorian Year', value: metadata.gregorianYear, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Holding Institution', value: metadata.holdingInstitution, icon: <Archive className="w-4 h-4" /> },
    { label: 'City', value: metadata.city, icon: <MapPin className="w-4 h-4" /> },
    { label: 'Country', value: metadata.country, icon: <Globe className="w-4 h-4" /> },
  ];

  const detailsFields: MetadataField[] = [
    { label: 'Catalog Number', value: metadata.catalogNumber, icon: <FileText className="w-4 h-4" /> },
    { label: 'Special Merit', value: metadata.specialMerit, icon: <Award className="w-4 h-4" /> },
    { label: 'Binding', value: metadata.binding, icon: <Package className="w-4 h-4" /> },
    { label: 'Rights', value: metadata.rights, icon: <Shield className="w-4 h-4" /> },
    { label: 'Access Restriction', value: metadata.accessRestriction, icon: <Shield className="w-4 h-4" /> },
    { label: 'Acknowledgments', value: metadata.acknowledgments, icon: <FileText className="w-4 h-4" /> },
  ];

  const provenanceFields: MetadataField[] = [
    { label: 'Repository', value: metadata.repository, icon: <Archive className="w-4 h-4" /> },
    { label: 'Part Location', value: metadata.partLocation, icon: <MapPin className="w-4 h-4" /> },
    { label: 'City of Origin', value: metadata.cityOfOrigin, icon: <Home className="w-4 h-4" /> },
    { label: 'Country of Origin', value: metadata.countryOfOrigin, icon: <Globe className="w-4 h-4" /> },
  ];

  const tabs = [
    { id: 'overview' as MetadataTab, label: 'Overview' },
    { id: 'details' as MetadataTab, label: 'Details' },
    { id: 'provenance' as MetadataTab, label: 'Provenance' },
  ];

  const renderFields = (fields: MetadataField[]) => (
    <div className="ms-metadata__fields">
      {fields.map((field, index) => (
        <div key={index} className="ms-metadata__field">
          <div className="ms-metadata__field-row">
            {field.icon && (
              <div className="ms-metadata__field-icon">
                {field.icon}
              </div>
            )}
            <div className="ms-metadata__field-content">
              <dt className="ms-metadata__field-label">
                {field.label}
              </dt>
              <dd className="ms-metadata__field-value">
                {field.value}
              </dd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="ms-metadata__wrapper">
      <div className="ms-metadata__header">
        <h2 className="ms-metadata__header-title">Manuscript Information</h2>
      </div>
      <div className="ms-metadata__tabs">
        <div className="ms-metadata__tabs-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ms-metadata__tab-btn ${
                activeTab === tab.id
                  ? 'ms-metadata__tab-btn--active'
                  : 'ms-metadata__tab-btn--inactive'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="ms-metadata__tab-indicator" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="ms-metadata__body">
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            {renderFields(overviewFields)}
          </div>
        )}
        {activeTab === 'details' && (
          <div className="animate-fadeIn">
            {renderFields(detailsFields)}
          </div>
        )}
        {activeTab === 'provenance' && (
          <div className="animate-fadeIn">
            {renderFields(provenanceFields)}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ManuscriptReference
// ============================================================================

export interface ManuscriptLinkData {
  id: string;
  title: string;
  sourceReference: string;
  pageNumber?: string;
  folioNumber?: string;
}

interface ManuscriptReferenceProps {
  manuscripts: ManuscriptLinkData[];
  contentType: 'orations' | 'letters' | 'sayings';
}

export const ManuscriptReference: React.FC<ManuscriptReferenceProps> = ({ manuscripts, contentType }) => {
  if (!manuscripts || manuscripts.length === 0) {
    return null;
  }

  return (
    <div
      id="manuscript-references"
      className="ms-reference__wrapper"
    >
      <div className="ms-reference__header">
        <div className="ms-reference__header-icon">
          <BookOpen className="w-5 h-5" style={{ color: 'white' }} />
        </div>
        <h2 className="ms-reference__header-title">
          Related Manuscripts
        </h2>
      </div>

      <p className="ms-reference__description">
        This {contentType.slice(0, -1)} appears in the following historical manuscripts:
      </p>

      <div className="ms-reference__list">
        {manuscripts.map((manuscript) => (
          <div
            key={manuscript.id}
            className="ms-reference__card"
          >
            <div className="ms-reference__card-layout">
              <div className="ms-reference__card-info">
                <h3 className="ms-reference__card-title">
                  <FileText className="w-4 h-4" style={{ color: '#43896B' }} />
                  {manuscript.title}
                </h3>

                <div className="ms-reference__card-fields">
                  <p className="ms-reference__card-field">
                    <span className="ms-reference__card-field-label">Source:</span> {manuscript.sourceReference}
                  </p>

                  {(manuscript.pageNumber || manuscript.folioNumber) && (
                    <p className="ms-reference__card-field">
                      <span className="ms-reference__card-field-label">
                        {manuscript.folioNumber ? 'Folio:' : 'Page:'}
                      </span>{' '}
                      {manuscript.folioNumber || manuscript.pageNumber}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/manuscripts?id=${manuscript.id}`}
              >
                <Button icon={<ExternalLink className="w-4 h-4 hidden lg:block" />} className='w-full' >
                    View Manuscript
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="ms-reference__footer">
        <p className="ms-reference__footer-note">
          Note: Manuscript references are based on historical compilations and may vary across different editions.
        </p>
      </div>
    </div>
  );
};

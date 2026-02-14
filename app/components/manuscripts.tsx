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
  <div className={`flex items-center justify-center bg-gray-100 min-h-[400px] lg:min-h-[600px] rounded-lg ${className}`}>
    <div className="text-center p-8">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Page Missing</h3>
      <p className="text-gray-500">This page is missing from this manuscript.</p>
      <p className="text-sm text-gray-400 mt-2">Page {pageNumber}</p>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleExpand}
        />
      )}

      <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'fixed inset-4 z-50 animate-expand' : 'relative'
      }`}
      style={{
        transform: isExpanded ? 'scale(1)' : 'scale(1)',
        opacity: isExpanded ? 1 : 1
      }}>
        <div className="bg-[#F5F6FA] border-b border-[#E2E3E9] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="cursor-pointer p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="cursor-pointer p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleViewMode}
            className={`cursor-pointer p-2 rounded-lg transition-colors ${
              viewMode === 'gallery' ? 'bg-[#43896B] text-white' : 'hover:bg-white text-gray-700'
            }`}
            aria-label={viewMode === 'gallery' ? 'Single page view' : 'Gallery view'}
          >
            {viewMode === 'gallery' ? <ImageIcon className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleExpand}
            className="cursor-pointer p-2 hover:bg-white rounded-lg transition-colors"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-gray-700" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row h-full">
        <div className="lg:w-24 bg-[#F5F6FA] border-b lg:border-b-0 lg:border-r border-[#E2E3E9] p-2 overflow-y-auto">
          <div className="flex lg:flex-col gap-2">
              {pages.map((page, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentPage === index
                    ? 'border-[#43896B] shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
                aria-label={`Page ${index + 1}`}
              >
                {page ? (
                  <img
                    src={page}
                    alt={`Page ${index + 1} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/file.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white">
          {viewMode === 'single' ? (
            pages[currentPage] ? (
              <div className="flex items-center justify-center min-h-[400px] lg:min-h-[600px] p-4">
                <div
                  className="relative bg-white shadow-2xl rounded-lg overflow-hidden transition-transform duration-300"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center'
                  }}
                >
                  <img
                    src={pages[currentPage]}
                    alt={`${bookName} - Page ${currentPage + 1}`}
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            ) : (
              <MissingPagePlaceholder pageNumber={currentPage + 1} />
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {pages.map((page, index) => (
                <div
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className="relative group rounded-lg overflow-hidden transition-all cursor-pointer bg-gray-100"
                >
                  {page ? (
                    <>
                      <img
                        src={page}
                        alt={`${bookName} - Page ${index + 1}`}
                        className="w-full h-auto block"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          console.error('Image failed to load:', page);
                          target.onerror = null;
                          target.src = '/file.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center pointer-events-none">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                          Page {index + 1}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-[3/4] flex items-center justify-center bg-gray-200">
                      <div className="text-center p-4">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xs text-gray-500 font-medium">Page {index + 1}</p>
                        <p className="text-xs text-gray-400">Missing</p>
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
        <div className="bg-[#F5F6FA] border-t border-[#E2E3E9] px-4 py-3 flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Previous</span>
          </button>

          <div className="text-sm font-medium text-gray-700">
            Page {currentPage + 1} of {pages.length}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === pages.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <span className="text-sm font-medium">Next</span>
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
    <div className={`flex items-center justify-center bg-gray-100 min-h-[300px] lg:min-h-[400px] rounded-lg ${className}`}>
        <div className="text-center p-4 lg:p-8">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base lg:text-lg font-semibold text-gray-700 mb-2">Page Missing</h3>
            <p className="text-sm text-gray-500">This page is missing from this manuscript.</p>
            <p className="text-xs lg:text-sm text-gray-400 mt-2">Page {pageNumber}</p>
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
        <div className={`flex flex-col ${isMobileView ? 'h-full' : 'h-full'}`}>
            {manuscripts.length > 0 && (
                <div className={`${isMobileView ? 'px-3 py-2' : 'px-4 py-3'} border-b border-gray-200 bg-white`}>
                    <label className={`${isMobileView ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1.5 lg:mb-2 block`}>
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

            <div className={`${isMobileView ? 'px-3 py-2' : 'px-4 py-2'} border-b border-gray-200 bg-white flex items-center justify-between gap-2`}>
                <div className="flex items-center gap-1 lg:gap-2">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className={`${isMobileView ? 'text-xs' : 'text-sm'} font-medium text-gray-600 min-w-[40px] lg:min-w-[50px] text-center`}>
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-1 lg:gap-3">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className={`p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 lg:gap-1 text-gray-700 ${isMobileView ? 'text-xs' : 'text-sm'} font-medium`}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="hidden sm:inline">Prev</span>
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === allPages.length - 1}
                        className={`p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5 lg:gap-1 text-gray-700 ${isMobileView ? 'text-xs' : 'text-sm'} font-medium`}
                        aria-label="Next page"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                    <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500 hidden sm:block`}>
                        {currentPage + 1}/{allPages.length}
                    </div>
                    <button
                        onClick={toggleImageFullscreen}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={isImageFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
                    >
                        {isImageFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-gray-700" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2 lg:p-4 bg-gray-50">
                {allPages.length > 0 ? (
                    currentPageUrl ? (
                        <div className="flex items-center justify-center min-h-full">
                            <img
                                key={`page-${currentPage}-${currentPageUrl}`}
                                src={currentPageUrl}
                                alt={`Manuscript page ${currentPage + 1}`}
                                className="max-w-full h-auto shadow-lg rounded-lg transition-transform duration-300"
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                            />
                        </div>
                    ) : (
                        <ComparisonMissingPagePlaceholder pageNumber={currentPage + 1} />
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No images available</p>
                    </div>
                )}
            </div>

            <div className={`${isMobileView ? 'px-2 py-2' : 'px-4 py-3'} border-t border-gray-200 bg-white flex items-center justify-center`}>
                <div className="flex gap-1 flex-wrap justify-center max-w-full overflow-x-auto">
                    {allPages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handlePageClick(idx)}
                            className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${currentPage === idx ? 'bg-[#43896B]' : 'bg-gray-300 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const ContentViewer = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className="flex flex-col h-full bg-white">
            <div className={`${isMobileView ? 'px-3 py-2' : 'px-4 py-3'} border-b border-gray-200 bg-gray-50`}>
                <h4 className={`font-semibold text-gray-900 ${isMobileView ? 'text-sm' : ''}`}>Content</h4>
                <p className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500`}>Section {content.sermonNumber}</p>
            </div>
            <div className={`flex-1 overflow-auto ${isMobileView ? 'p-3' : 'p-6'}`}>
                {content.title && (
                    <div className={`${isMobileView ? 'mb-4 pb-4' : 'mb-6 pb-6'} border-b border-gray-100`}>
                        <div className={`text-right ${isMobileView ? 'mb-2' : 'mb-4'}`}>
                            <p className={`${isMobileView ? 'text-base' : 'text-lg'} leading-relaxed text-gray-900 font-taha`} dir="rtl">
                                {formatTextWithFootnotes(cleanArabicText(content.title), allFootnotes, true, content.sermonNumber || 'main')}
                            </p>
                        </div>
                        {content.translations?.find((t: { type: string; text: string }) => t.type === 'en') && (
                            <div className={`bg-gray-50 rounded-lg ${isMobileView ? 'p-3 mt-2' : 'p-4 mt-4'}`}>
                                <p className={`text-gray-700 font-brill leading-relaxed ${isMobileView ? 'text-sm' : ''}`}>
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
                        <div key={paragraph.id} className={`${isMobileView ? 'mb-4 pb-4' : 'mb-6 pb-6'} border-b border-gray-100 last:border-b-0`}>
                            {paragraph.number && (
                                <span className={`inline-flex items-center px-2 py-0.5 ${isMobileView ? 'text-xs' : 'text-xs'} font-semibold text-[#43896B] bg-[#43896B]/10 rounded-full mb-2`}>
                                    {paragraph.number}
                                </span>
                            )}
                            {paragraph.arabic && (
                                <div className={`text-right ${isMobileView ? 'mb-2' : 'mb-3'}`}>
                                    <p className={`${isMobileView ? 'text-base leading-loose' : 'text-lg leading-loose'} text-gray-900 font-taha`} dir="rtl">
                                        {formatTextWithFootnotes(cleanArabicText(paragraph.arabic), allFootnotes, true, paragraph.number)}
                                    </p>
                                </div>
                            )}
                            {englishTranslation && (
                                <div className={`bg-gray-50 rounded-lg ${isMobileView ? 'p-3' : 'p-4'}`}>
                                    <p className={`text-gray-700 font-brill leading-relaxed ${isMobileView ? 'text-sm' : ''}`}>
                                        {formatTextWithFootnotes(englishTranslation.text, allFootnotes, false, paragraph.number)}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}

                {sortedParagraphs.length === 0 && !content.title && (
                    <div className="text-center py-8 lg:py-12 text-gray-400">
                        <p>No content available</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />
                    <motion.div
                        className="relative bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-[98vw] lg:max-w-[95vw] h-[95vh] lg:h-[90vh] overflow-hidden flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-3 py-2 lg:px-6 lg:py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                                <div className="p-1.5 lg:p-2 bg-[#43896B]/10 rounded-lg flex-shrink-0">
                                    <Book className="w-4 h-4 lg:w-5 lg:h-5 text-[#43896B]" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm lg:text-lg font-bold text-gray-900 truncate">Compare Manuscripts</h3>
                                    <p className="text-xs lg:text-sm text-gray-500 truncate">
                                        {content.heading ? (
                                            <span className="hidden sm:inline">{content.heading}</span>
                                        ) : null}
                                        {!loading && manuscripts.length > 0 && (
                                            <span className="text-[#43896B]">
                                                {content.heading && <span className="hidden sm:inline ml-1">•</span>} {manuscripts.length} manuscript{manuscripts.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 lg:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-[#43896B] mx-auto mb-3" />
                                        <p className="text-sm lg:text-base text-gray-600">Loading manuscripts...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <div className="text-center max-w-md">
                                        <FileText className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-sm lg:text-base text-gray-600 mb-4">{error}</p>
                                        <button
                                            onClick={fetchManuscripts}
                                            className="px-4 py-2 bg-[#43896B] text-white text-sm lg:text-base rounded-lg hover:bg-[#367556] transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isImageFullscreen && (
                                        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
                                            <div className="px-3 py-2 lg:px-4 lg:py-3 bg-white/10 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <button
                                                        onClick={handleZoomOut}
                                                        disabled={zoom <= 50}
                                                        className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <ZoomOut className="w-4 h-4 text-white" />
                                                    </button>
                                                    <span className="text-xs lg:text-sm font-medium text-white min-w-[40px] lg:min-w-[50px] text-center">{zoom}%</span>
                                                    <button
                                                        onClick={handleZoomIn}
                                                        disabled={zoom >= 200}
                                                        className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <ZoomIn className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 lg:gap-3">
                                                    <button
                                                        onClick={handlePrevPage}
                                                        disabled={currentPage === 0}
                                                        className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-white text-xs lg:text-sm font-medium"
                                                        aria-label="Previous page"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                                                        <span className="hidden sm:inline">Prev</span>
                                                    </button>
                                                    <button
                                                        onClick={handleNextPage}
                                                        disabled={currentPage === allPages.length - 1}
                                                        className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-white text-xs lg:text-sm font-medium"
                                                        aria-label="Next page"
                                                    >
                                                        <span className="hidden sm:inline">Next</span>
                                                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 lg:gap-2">
                                                    <div className="text-xs lg:text-sm text-white">
                                                        {currentPage + 1}/{allPages.length}
                                                    </div>
                                                    <button
                                                        onClick={toggleImageFullscreen}
                                                        className="p-1.5 lg:p-2 hover:bg-white/20 rounded-lg transition-colors"
                                                        aria-label="Exit fullscreen"
                                                    >
                                                        <Minimize2 className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-auto p-2 lg:p-4">
                                                {allPages.length > 0 ? (
                                                    currentPageUrl ? (
                                                        <div className="flex items-center justify-center min-h-full">
                                                            <img
                                                                key={`fullscreen-${currentPage}-${currentPageUrl}`}
                                                                src={currentPageUrl}
                                                                alt={`Manuscript page ${currentPage + 1}`}
                                                                className="max-w-full h-auto shadow-2xl rounded-lg transition-transform duration-300"
                                                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <ComparisonMissingPagePlaceholder pageNumber={currentPage + 1} className="text-white" />
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-white">
                                                        <p>No images available</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-3 py-2 lg:px-4 lg:py-3 bg-white/10 backdrop-blur-sm border-t border-white/20 flex items-center justify-center">
                                                <div className="flex gap-1 flex-wrap justify-center">
                                                    {allPages.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handlePageClick(idx)}
                                                            className={`w-2 h-2 rounded-full transition-colors ${currentPage === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="lg:hidden border-b border-gray-200 bg-white">
                                        <div className="flex">
                                            <button
                                                onClick={() => setActiveTab('manuscript')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                                    activeTab === 'manuscript'
                                                        ? 'text-[#43896B] border-b-2 border-[#43896B] bg-[#43896B]/5'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                <Image className="w-4 h-4" />
                                                Manuscript
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('content')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                                    activeTab === 'content'
                                                        ? 'text-[#43896B] border-b-2 border-[#43896B] bg-[#43896B]/5'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                <TextIcon className="w-4 h-4" />
                                                Content
                                            </button>
                                        </div>
                                    </div>

                                    <div className="lg:hidden flex-1 overflow-hidden">
                                        {activeTab === 'manuscript' ? (
                                            <InternalManuscriptViewer isMobileView={true} />
                                        ) : (
                                            <ContentViewer isMobileView={true} />
                                        )}
                                    </div>

                                    <div className="hidden lg:flex flex-1 overflow-hidden">
                                        <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
                                            <InternalManuscriptViewer isMobileView={false} />
                                        </div>
                                        <div className="w-1/2 flex flex-col">
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#43896B]/10 text-[#43896B] rounded-full border border-[#43896B]/20 hover:bg-[#43896B]/20 hover:border-[#43896B]/30 transition-all cursor-pointer active:scale-95"
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
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={index} className="border-b border-[#E2E3E9] pb-4 last:border-0">
          <div className="flex items-start gap-2">
            {field.icon && (
              <div className="text-[#43896B] mt-1">
                {field.icon}
              </div>
            )}
            <div className="flex-1">
              <dt className="text-sm font-semibold text-gray-700 mb-1">
                {field.label}
              </dt>
              <dd className="text-sm text-gray-600 leading-relaxed">
                {field.value}
              </dd>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-[#43896B] to-[#5CAF8B] px-6 py-4">
        <h2 className="text-xl font-bold text-white">Manuscript Information</h2>
      </div>
      <div className="border-b border-[#E2E3E9] bg-[#F5F6FA]">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#43896B] bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#43896B]" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
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
      className="bg-gradient-to-br from-[#43896B]/5 to-[#43896B]/10 rounded-2xl border border-[#43896B]/20 p-4 lg:p-6 mt-8 scroll-mt-24"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#43896B] rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">
          Related Manuscripts
        </h2>
      </div>

      <p className="text-gray-600 mb-6 text-sm">
        This {contentType.slice(0, -1)} appears in the following historical manuscripts:
      </p>

      <div className="space-y-4">
        {manuscripts.map((manuscript) => (
          <div
            key={manuscript.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#43896B]/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#43896B]" />
                  {manuscript.title}
                </h3>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-700">Source:</span> {manuscript.sourceReference}
                  </p>

                  {(manuscript.pageNumber || manuscript.folioNumber) && (
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-700">
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

      <div className="mt-4 pt-4 border-t border-[#43896B]/20">
        <p className="text-xs text-gray-500 italic">
          Note: Manuscript references are based on historical compilations and may vary across different editions.
        </p>
      </div>
    </div>
  );
};

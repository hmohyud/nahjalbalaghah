'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Loader2, FileText, Book, Maximize2, Minimize2, ChevronLeft, ChevronRight, Image, FileText as TextIcon } from 'lucide-react';
import { manuscriptsApi, Manuscript, getManuscriptImageUrl } from '@/api/manuscripts';
import { type Post } from '@/api/posts';
import { formatTextWithFootnotes } from '@/app/utils/text-formatting';
import Select from '../select';

interface ManuscriptComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Post | RadisContent;
    contentType: 'orations' | 'letters' | 'sayings' | 'radis' | 'conclusion';
}

// Simplified content type for Radis introductions
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

const MissingPagePlaceholder: React.FC<{ pageNumber: number; className?: string }> = ({ pageNumber, className = '' }) => (
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

export default function ManuscriptComparisonModal({
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

    // Get the section number, handling both Post (sermonNumber) and RadisContent (number)
    const getSectionNumber = () => {
        if (contentType === 'radis' && 'number' in content) {
            return `0.${content.number}`; // Radis uses prefix 0 for section
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

    // Helper function to get library/manuscript name
    const getManuscriptDisplayName = useCallback((ms: Manuscript): string => {
        if (ms.bookName) return ms.bookName;
        if (ms.library) return ms.library;
        // Try to infer from file names
        const firstFileName = ms.files?.[0]?.name?.toLowerCase() || '';
        if (firstFileName.includes("mar'ashi") || firstFileName.includes("marashi") || firstFileName.includes("qum_mar")) return "Mar'ashi MS";
        if (firstFileName.includes("shahrastan")) return "Shahrastani MS";
        if (firstFileName.includes("rampur")) return "Rampur Raza MS";
        return `Manuscript ${ms.id}`;
    }, []);

    // Sort paragraphs by number
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

    // Manuscript Viewer Component (reusable for both mobile and desktop)
    const ManuscriptViewer = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className={`flex flex-col ${isMobileView ? 'h-full' : 'h-full'}`}>
            {/* Manuscript Selector */}
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

            {/* Zoom Controls */}
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

            {/* Manuscript Image */}
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
                        <MissingPagePlaceholder pageNumber={currentPage + 1} />
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No images available</p>
                    </div>
                )}
            </div>

            {/* Page Navigation Dots */}
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

    // Content Viewer Component (reusable for both mobile and desktop)
    const ContentViewer = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className="flex flex-col h-full bg-white">
            <div className={`${isMobileView ? 'px-3 py-2' : 'px-4 py-3'} border-b border-gray-200 bg-gray-50`}>
                <h4 className={`font-semibold text-gray-900 ${isMobileView ? 'text-sm' : ''}`}>Content</h4>
                <p className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500`}>Section {content.sermonNumber}</p>
            </div>
            <div className={`flex-1 overflow-auto ${isMobileView ? 'p-3' : 'p-6'}`}>
                {/* Main title */}
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

                {/* Paragraphs */}
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
                        {/* Header */}
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

                        {/* Content */}
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
                                    {/* Fullscreen Image Overlay */}
                                    {isImageFullscreen && (
                                        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
                                            {/* Fullscreen Controls */}
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

                                            {/* Fullscreen Image */}
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
                                                        <MissingPagePlaceholder pageNumber={currentPage + 1} className="text-white" />
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-white">
                                                        <p>No images available</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fullscreen Page Navigation */}
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

                                    {/* Mobile Tab Navigation */}
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

                                    {/* Mobile View - Tab Content */}
                                    <div className="lg:hidden flex-1 overflow-hidden">
                                        {activeTab === 'manuscript' ? (
                                            <ManuscriptViewer isMobileView={true} />
                                        ) : (
                                            <ContentViewer isMobileView={true} />
                                        )}
                                    </div>

                                    {/* Desktop View - Side by Side */}
                                    <div className="hidden lg:flex flex-1 overflow-hidden">
                                        {/* Left Column - Manuscript Viewer */}
                                        <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50">
                                            <ManuscriptViewer isMobileView={false} />
                                        </div>

                                        {/* Right Column - Content */}
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

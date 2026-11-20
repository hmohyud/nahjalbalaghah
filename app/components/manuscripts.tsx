'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  Grid3x3, Image as ImageIcon, X, Loader2, RotateCcw, FileText, Book,
  Image, FileText as TextIcon, BookOpen, ExternalLink, Columns2,
  Calendar, MapPin, Shield, Package, Award, Archive, Globe, Home
} from 'lucide-react';
import { librariesApi, Library, manuscriptsApi, Manuscript, getManuscriptImageUrl, manuscriptMatchesLibrary } from '@/api/manuscripts';
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
  // Optional controlled page index (e.g. when the parent maps pages to sections)
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Shown under the page counter, e.g. which sections are on the current page
  caption?: string;
}

type ZoomPanHandle = {
  zoomIn: (clientX?: number, clientY?: number) => void;
  zoomOut: (clientX?: number, clientY?: number) => void;
  reset: () => void;
};

type ZoomPanImageProps = {
  src: string;
  alt: string;
  onZoomChange: (percent: number) => void;
  onLoadingChange?: (loading: boolean) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
// Zoom is relative to "fit": scale 1 (100%) shows the whole page inside the viewer.
const MIN_SCALE = 0.25;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.25;

const ZoomPanImage = React.forwardRef<ZoomPanHandle, ZoomPanImageProps>(({ src, alt, onZoomChange, onLoadingChange }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; startTx: number; startTy: number; moved: boolean }>({
    active: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    moved: false
  });
  const pinchRef = useRef<{
    active: boolean;
    startDistance: number;
    startScale: number;
    startTx: number;
    startTy: number;
    startCenterX: number;
    startCenterY: number;
  }>({
    active: false,
    startDistance: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    startCenterX: 0,
    startCenterY: 0
  });

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  // Store imageSize together with the src it belongs to, so we never apply stale sizes
  const [imageSizeForSrc, setImageSizeForSrc] = useState<{ src: string; w: number; h: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageSize = imageSizeForSrc?.src === src ? imageSizeForSrc : null;
  const totalScale = useMemo(() => baseScale * scale, [baseScale, scale]);

  const centerImage = useCallback(
    (nextBaseScale: number, nextScale: number, imgW: number, imgH: number, cW: number, cH: number) => {
      const nextTotalScale = nextBaseScale * nextScale;
      const x = (cW - imgW * nextTotalScale) / 2;
      const y = (cH - imgH * nextTotalScale) / 2;
      setTranslate({ x, y });
    },
    []
  );

  const updateContainerSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerSize({ w: Math.max(1, el.clientWidth), h: Math.max(1, el.clientHeight) });
  }, []);

  // Track the container itself (not just the window) so expanding/collapsing the viewer refits the page
  useEffect(() => {
    updateContainerSize();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
    }
    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateContainerSize]);

  // When src changes: mark as not ready and signal loading
  useEffect(() => {
    setImageSizeForSrc(null);
    setBaseScale(1);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    onLoadingChange?.(true);
    const img = imgRef.current;
    if (!img || !img.complete) return;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w > 0 && h > 0) {
      setImageSizeForSrc({ src, w, h });
    }
  }, [src, onLoadingChange]);

  // Once we have a valid imageSize for the *current* src, compute layout
  useEffect(() => {
    if (!imageSize) return;
    const { w: imgW, h: imgH } = imageSize;
    const { w: cW, h: cH } = containerSize;

    // Contain: the whole page is visible at 100%
    const fitWidth = cW / imgW;
    const fitHeight = cH / imgH;
    const nextBaseScale = (isFinite(fitWidth) && fitWidth > 0 && isFinite(fitHeight) && fitHeight > 0)
      ? clamp(Math.min(fitWidth, fitHeight), 0.01, 5)
      : 1;

    setBaseScale(nextBaseScale);
    setScale(1);
    centerImage(nextBaseScale, 1, imgW, imgH, cW, cH);
    onZoomChange(100);
    onLoadingChange?.(false);
  }, [imageSize, containerSize, centerImage, onLoadingChange, onZoomChange]);

  const setScaleAroundPoint = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const el = containerRef.current;
      if (!el || !imageSize) return;
      const rect = el.getBoundingClientRect();
      setScale(nextScale);
      onZoomChange(Math.round(nextScale * 100));

      // At or below fit there is nothing to pan to, so keep the page centred
      if (nextScale <= 1) {
        centerImage(baseScale, nextScale, imageSize.w, imageSize.h, rect.width, rect.height);
        return;
      }

      const px = clamp(clientX - rect.left, 0, rect.width);
      const py = clamp(clientY - rect.top, 0, rect.height);

      const startTotal = totalScale;
      const nextTotal = baseScale * nextScale;

      const contentX = (px - translate.x) / startTotal;
      const contentY = (py - translate.y) / startTotal;

      setTranslate({ x: px - contentX * nextTotal, y: py - contentY * nextTotal });
    },
    [baseScale, centerImage, imageSize, onZoomChange, totalScale, translate.x, translate.y]
  );

  const zoomIn = useCallback(
    (clientX?: number, clientY?: number) => {
      const next = clamp(scale * ZOOM_STEP, MIN_SCALE, MAX_SCALE);
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScaleAroundPoint(clientX ?? rect.left + rect.width / 2, clientY ?? rect.top + rect.height / 2, next);
    },
    [scale, setScaleAroundPoint]
  );

  const zoomOut = useCallback(
    (clientX?: number, clientY?: number) => {
      const next = clamp(scale / ZOOM_STEP, MIN_SCALE, MAX_SCALE);
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScaleAroundPoint(clientX ?? rect.left + rect.width / 2, clientY ?? rect.top + rect.height / 2, next);
    },
    [scale, setScaleAroundPoint]
  );

  const reset = useCallback(() => {
    if (!imageSize) return;
    setScale(1);
    onZoomChange(100);
    centerImage(baseScale, 1, imageSize.w, imageSize.h, containerSize.w, containerSize.h);
  }, [baseScale, centerImage, containerSize, imageSize, onZoomChange]);

  React.useImperativeHandle(ref, () => ({ zoomIn, zoomOut, reset }), [reset, zoomIn, zoomOut]);

  // React registers wheel listeners as passive, so preventDefault() there can't stop the page
  // from scrolling while zooming. Attach a non-passive native listener instead.
  const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelHandlerRef.current = (e: WheelEvent) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.002);
    setScaleAroundPoint(e.clientX, e.clientY, clamp(scale * factor, MIN_SCALE, MAX_SCALE));
  };
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const listener = (e: WheelEvent) => wheelHandlerRef.current(e);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1) return;
    const el = containerRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startTx: translate.x,
        startTy: translate.y,
        moved: false
      };
      pinchRef.current.active = false;
    }

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      pinchRef.current = {
        active: true,
        startDistance: dist,
        startScale: scale,
        startTx: translate.x,
        startTy: translate.y,
        startCenterX: cx,
        startCenterY: cy
      };
      dragRef.current.active = false;
    }
  }, [scale, translate.x, translate.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchRef.current.active && pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;

      const startTotal = baseScale * pinchRef.current.startScale;
      const contentX = (cx - pinchRef.current.startTx) / startTotal;
      const contentY = (cy - pinchRef.current.startTy) / startTotal;

      const ratio = pinchRef.current.startDistance > 0 ? dist / pinchRef.current.startDistance : 1;
      const nextScale = clamp(pinchRef.current.startScale * ratio, MIN_SCALE, MAX_SCALE);
      const nextTotal = baseScale * nextScale;
      const nextTx = cx - contentX * nextTotal;
      const nextTy = cy - contentY * nextTotal;

      setScale(nextScale);
      setTranslate({ x: nextTx, y: nextTy });
      onZoomChange(Math.round(nextScale * 100));
      return;
    }

    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
    }
    if (scale <= 1) return;
    setTranslate({ x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy });
  }, [baseScale, onZoomChange, scale]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    const wasMoved = dragRef.current.moved;

    if (pointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }
    if (pointersRef.current.size === 0) {
      dragRef.current.active = false;
    }

    if (wasMoved) return;

    if (e.button === 0) {
      zoomIn(e.clientX, e.clientY);
    } else if (e.button === 2) {
      zoomOut(e.clientX, e.clientY);
    }
  }, [zoomIn, zoomOut]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    dragRef.current.active = false;
    pinchRef.current.active = false;
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const cursorClass = scale > 1 ? 'cursor-grab' : 'cursor-zoom-in';

  return (
    <div
      ref={containerRef}
      className={`ms-viewer__zoompan ${cursorClass}`}
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={onContextMenu}
    >
      <div
        className="ms-viewer__zoompan-layer"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${totalScale})`,
          transformOrigin: '0 0',
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="ms-viewer__zoompan-img"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            // Tag the measurement with the src so stale loads are ignored
            setImageSizeForSrc({ src, w, h });
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = '/file.svg';
            onLoadingChange?.(false);
          }}
        />
      </div>
    </div>
  );
});

ZoomPanImage.displayName = 'ZoomPanImage';

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

export const ManuscriptViewer: React.FC<ManuscriptViewerProps> = ({ pages, bookName, currentPage: controlledPage, onPageChange, caption }) => {
  const [internalPage, setInternalPage] = useState(0);
  const currentPage = Math.min(controlledPage ?? internalPage, Math.max(0, pages.length - 1));
  const setCurrentPage = (next: number | ((prev: number) => number)) => {
    const value = typeof next === 'function' ? next(currentPage) : next;
    if (onPageChange) onPageChange(value);
    else setInternalPage(value);
  };
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const zoomPanRef = useRef<ZoomPanHandle | null>(null);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  const handleZoomIn = () => zoomPanRef.current?.zoomIn();
  const handleZoomOut = () => zoomPanRef.current?.zoomOut();
  const handleResetZoom = () => zoomPanRef.current?.reset();
  const toggleExpand = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

  const toggleViewMode = () => {
    setViewMode((prev) => prev === 'single' ? 'gallery' : 'single');
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentPage(index);
    if (viewMode === 'gallery') {
      setViewMode('single');
    }
  };

  useEffect(() => {
    zoomPanRef.current?.reset();
    setZoom(100);
    // Keep the active thumbnail visible when paging through a long manuscript
    thumbnailRefs.current[currentPage]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentPage]);

  return (
    <>
      {isExpanded && (
        <div className="ms-viewer__overlay" onClick={toggleExpand} />
      )}

      <div className={`ms-viewer__wrapper ms-viewer__wrapper--flex ${isExpanded ? 'ms-viewer__wrapper--expanded' : 'ms-viewer__wrapper--relative'}`}>
        <div className="ms-viewer__toolbar">
          <div className={`ms-viewer__toolbar-group ${viewMode === 'gallery' ? 'invisible' : ''}`}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_SCALE * 100}
              className="ms-viewer__btn"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="ms-viewer__zoom-label tabular-nums">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_SCALE * 100}
              className="ms-viewer__btn"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              disabled={zoom === 100}
              className="ms-viewer__btn ms-viewer__btn--text"
              aria-label="Reset zoom to 100% (fit whole page)"
              title="Reset to 100% (fit whole page)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
          <div className="ms-viewer__toolbar-group">
            <button
              onClick={toggleViewMode}
              className={`ms-viewer__btn ${viewMode === 'gallery' ? 'ms-viewer__btn--active' : ''}`}
              aria-label={viewMode === 'gallery' ? 'Single page view' : 'Gallery view'}
            >
              {viewMode === 'gallery' ? <ImageIcon className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleExpand}
              className="ms-viewer__btn"
              aria-label={isExpanded ? 'Minimize' : 'Expand'}
              title={isExpanded ? 'Exit full screen (Esc)' : 'Full screen'}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className={`ms-viewer__layout ${isExpanded ? 'ms-viewer__layout--expanded' : 'ms-viewer__layout--fixed'}`}>
          <div className="ms-viewer__sidebar ms-viewer__sidebar--scroll">
            <div className="ms-viewer__sidebar-thumbs">
              {pages.map((page, index) => (
                <button
                  key={index}
                  ref={(el) => { thumbnailRefs.current[index] = el; }}
                  onClick={() => handleThumbnailClick(index)}
                  className={`ms-viewer__thumb ${currentPage === index ? 'ms-viewer__thumb--active' : ''}`}
                  aria-label={`Page ${index + 1}`}
                >
                  {page ? (
                    <img
                      src={page}
                      loading="lazy"
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
          <div className={`ms-viewer__main ${viewMode === 'single' ? 'ms-viewer__main--single' : ''}`}>
            {viewMode === 'single' ? (
              pages[currentPage] ? (
                <div className="ms-viewer__stage">
                  <div className="ms-viewer__stage-inner">
                    <ZoomPanImage
                      key={currentPage}
                      ref={zoomPanRef}
                      src={pages[currentPage] as string}
                      alt={`${bookName} - Page ${currentPage + 1}`}
                      onZoomChange={setZoom}
                      onLoadingChange={setIsImageLoading}
                    />
                    {isImageLoading && (
                      <div className="ms-viewer__loading">
                        <div className="ms-viewer__loading-pill">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading image...</span>
                        </div>
                      </div>
                    )}
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
                          loading="lazy"
                          alt={`${bookName} - Page ${index + 1}`}
                          className="ms-viewer__gallery-item-img"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/file.svg';
                          }}
                        />
                        <div className="ms-viewer__gallery-overlay">
                          <span className="ms-viewer__gallery-overlay-text">Page {index + 1}</span>
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
              {caption && <div className="ms-viewer__page-caption">{caption}</div>}
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

// Comparison panes fill their frame (cover fit). Zoom is reported relative to that fit (100% = fitted).
const INITIAL_FIT_BOOST = 1.03;
const COMPARISON_MIN_SCALE = 1;
const COMPARISON_MAX_SCALE = 8;

const ComparisonZoomPanImage = React.forwardRef<ZoomPanHandle, ZoomPanImageProps>(({ src, alt, onZoomChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const pointersRef = useRef(new Map<number, { x: number; y: number }>());
    const dragRef = useRef<{ active: boolean; startX: number; startY: number; startTx: number; startTy: number; moved: boolean }>({
        active: false,
        startX: 0,
        startY: 0,
        startTx: 0,
        startTy: 0,
        moved: false
    });
    const pinchRef = useRef<{
        active: boolean;
        startDistance: number;
        startScale: number;
        startTx: number;
        startTy: number;
    }>({
        active: false,
        startDistance: 0,
        startScale: 1,
        startTx: 0,
        startTy: 0
    });

    const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
    const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
    const [baseScale, setBaseScale] = useState(1);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const totalScale = useMemo(() => baseScale * scale, [baseScale, scale]);

    // Layout size (unaffected by the modal's open animation transform)
    const updateContainerSize = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        setContainerSize({ w: Math.max(1, el.clientWidth), h: Math.max(1, el.clientHeight) });
    }, []);

    useEffect(() => {
        updateContainerSize();
        const el = containerRef.current;
        if (!el || typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updateContainerSize);
            return () => window.removeEventListener('resize', updateContainerSize);
        }
        const observer = new ResizeObserver(updateContainerSize);
        observer.observe(el);
        return () => observer.disconnect();
    }, [updateContainerSize]);

    useEffect(() => {
        setImageSize(null);
        setBaseScale(1);
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        const img = imgRef.current;
        if (!img || !img.complete) return;
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (w > 0 && h > 0) {
            setImageSize({ w, h });
        }
    }, [src]);

    const centerImage = useCallback((nextBaseScale: number, nextScale: number) => {
        if (!imageSize) return;
        const nextTotal = nextBaseScale * nextScale;
        const x = (containerSize.w - imageSize.w * nextTotal) / 2;
        const y = (containerSize.h - imageSize.h * nextTotal) / 2;
        setTranslate({ x, y });
    }, [containerSize.h, containerSize.w, imageSize]);

    useEffect(() => {
        if (!imageSize) return;
        const fitWidth = containerSize.w / imageSize.w;
        const fitHeight = containerSize.h / imageSize.h;
        const nextBase = (isFinite(fitWidth) && fitWidth > 0 && isFinite(fitHeight) && fitHeight > 0)
            ? clamp(Math.max(fitWidth, fitHeight) * INITIAL_FIT_BOOST, 0.01, 5)
            : 1;
        setBaseScale(nextBase);
        setScale(1);
        centerImage(nextBase, 1);
        onZoomChange(100);
    }, [centerImage, containerSize.h, containerSize.w, imageSize, onZoomChange, src]);

    const setScaleAroundPoint = useCallback((clientX: number, clientY: number, nextScale: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = clamp(clientX - rect.left, 0, rect.width);
        const py = clamp(clientY - rect.top, 0, rect.height);

        const startTotal = totalScale;
        const nextTotal = baseScale * nextScale;
        const contentX = (px - translate.x) / startTotal;
        const contentY = (py - translate.y) / startTotal;
        const nextTx = px - contentX * nextTotal;
        const nextTy = py - contentY * nextTotal;

        setScale(nextScale);
        setTranslate({ x: nextTx, y: nextTy });
        onZoomChange(Math.round(nextScale * 100));
    }, [baseScale, onZoomChange, totalScale, translate.x, translate.y]);

    const zoomIn = useCallback((clientX?: number, clientY?: number) => {
        const next = clamp(scale * 1.25, COMPARISON_MIN_SCALE, COMPARISON_MAX_SCALE);
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setScaleAroundPoint(clientX ?? rect.left + rect.width / 2, clientY ?? rect.top + rect.height / 2, next);
    }, [scale, setScaleAroundPoint]);

    const zoomOut = useCallback((clientX?: number, clientY?: number) => {
        const next = clamp(scale / 1.25, COMPARISON_MIN_SCALE, COMPARISON_MAX_SCALE);
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setScaleAroundPoint(clientX ?? rect.left + rect.width / 2, clientY ?? rect.top + rect.height / 2, next);
    }, [scale, setScaleAroundPoint]);

    const reset = useCallback(() => {
        setScale(1);
        onZoomChange(100);
        centerImage(baseScale, 1);
    }, [baseScale, centerImage, onZoomChange]);

    React.useImperativeHandle(ref, () => ({ zoomIn, zoomOut, reset }), [reset, zoomIn, zoomOut]);

    // React wheel listeners are passive, so attach a native non-passive one to stop the page scrolling while zooming
    const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});
    wheelHandlerRef.current = (e: WheelEvent) => {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.002);
        setScaleAroundPoint(e.clientX, e.clientY, clamp(scale * factor, COMPARISON_MIN_SCALE, COMPARISON_MAX_SCALE));
    };
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const listener = (e: WheelEvent) => wheelHandlerRef.current(e);
        el.addEventListener('wheel', listener, { passive: false });
        return () => el.removeEventListener('wheel', listener);
    }, []);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button === 1) return;
        const el = containerRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointersRef.current.size === 1) {
            dragRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startTx: translate.x,
                startTy: translate.y,
                moved: false
            };
            pinchRef.current.active = false;
        }

        if (pointersRef.current.size === 2) {
            const pts = Array.from(pointersRef.current.values());
            const dx = pts[0].x - pts[1].x;
            const dy = pts[0].y - pts[1].y;
            const dist = Math.hypot(dx, dy);
            pinchRef.current = {
                active: true,
                startDistance: dist,
                startScale: scale,
                startTx: translate.x,
                startTy: translate.y
            };
            dragRef.current.active = false;
        }
    }, [scale, translate.x, translate.y]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!pointersRef.current.has(e.pointerId)) return;
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pinchRef.current.active && pointersRef.current.size >= 2) {
            const pts = Array.from(pointersRef.current.values());
            const dx = pts[0].x - pts[1].x;
            const dy = pts[0].y - pts[1].y;
            const dist = Math.hypot(dx, dy);
            const cx = (pts[0].x + pts[1].x) / 2;
            const cy = (pts[0].y + pts[1].y) / 2;

            const startTotal = baseScale * pinchRef.current.startScale;
            const contentX = (cx - pinchRef.current.startTx) / startTotal;
            const contentY = (cy - pinchRef.current.startTy) / startTotal;

            const ratio = pinchRef.current.startDistance > 0 ? dist / pinchRef.current.startDistance : 1;
            const nextScale = clamp(pinchRef.current.startScale * ratio, COMPARISON_MIN_SCALE, COMPARISON_MAX_SCALE);
            const nextTotal = baseScale * nextScale;
            const nextTx = cx - contentX * nextTotal;
            const nextTy = cy - contentY * nextTotal;

            setScale(nextScale);
            setTranslate({ x: nextTx, y: nextTy });
            onZoomChange(Math.round(nextScale * 100));
            return;
        }

        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            dragRef.current.moved = true;
        }
        if (scale === 1) return;
        setTranslate({ x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy });
    }, [baseScale, onZoomChange, scale]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        const wasMoved = dragRef.current.moved;

        if (pointersRef.current.size < 2) {
            pinchRef.current.active = false;
        }
        if (pointersRef.current.size === 0) {
            dragRef.current.active = false;
        }

        if (wasMoved) return;
        if (e.button === 0) {
            zoomIn(e.clientX, e.clientY);
        } else if (e.button === 2) {
            zoomOut(e.clientX, e.clientY);
        }
    }, [zoomIn, zoomOut]);

    const onPointerCancel = useCallback((e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        dragRef.current.active = false;
        pinchRef.current.active = false;
    }, []);

    return (
        <div
            ref={containerRef}
            className={`ms-viewer__zoompan ${scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'}`}
            style={{ touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div
                className="ms-viewer__zoompan-layer"
                style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${totalScale})`,
                    transformOrigin: '0 0'
                }}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className="ms-viewer__zoompan-img"
                    draggable={false}
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        setImageSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
                    }}
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/file.svg';
                    }}
                />
            </div>
        </div>
    );
});

ComparisonZoomPanImage.displayName = 'ComparisonZoomPanImage';

type ComparisonPaneId = 'primary' | 'secondary';

const getManuscriptPageUrls = (manuscript: Manuscript | null): string[] =>
    (manuscript?.files || []).map(file => getManuscriptImageUrl(file.url));

export function ManuscriptComparisonModal({
    isOpen,
    onClose,
    content,
    contentType
}: ManuscriptComparisonModalProps) {
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [selectedLibraryName, setSelectedLibraryName] = useState<string>('');
    const [secondLibraryName, setSecondLibraryName] = useState<string>('');
    const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
    const [secondManuscript, setSecondManuscript] = useState<Manuscript | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [secondPage, setSecondPage] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [secondZoom, setSecondZoom] = useState(100);
    const [fullscreenZoom, setFullscreenZoom] = useState(100);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 'content': manuscript beside the normalized text; 'comparison': two manuscripts side by side
    const [viewMode, setViewMode] = useState<'content' | 'comparison'>('content');
    const [fullscreenPane, setFullscreenPane] = useState<ComparisonPaneId | null>(null);
    // Mobile shows one pane at a time: the first manuscript, or the content / second manuscript
    const [activeTab, setActiveTab] = useState<ComparisonPaneId>('primary');
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
    );
    const zoomPanPrimaryRef = useRef<ZoomPanHandle | null>(null);
    const zoomPanSecondaryRef = useRef<ZoomPanHandle | null>(null);
    const zoomPanFullscreenRef = useRef<ZoomPanHandle | null>(null);

    const getSectionNumber = () => {
        if (contentType === 'radis' && 'number' in content) {
            return `0.${content.number}`;
        }
        return (content as Post).sermonNumber || null;
    };

    const sectionNumber = getSectionNumber();

    useEffect(() => {
        if (isOpen && sectionNumber) {
            setFullscreenPane(null);
            fetchManuscripts();
        }
    }, [isOpen, sectionNumber]);

    // Render only one layout so each pane has a single zoomable image instance
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        const update = () => setIsDesktop(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const inferLibraryNameForManuscript = useCallback((manuscript: Manuscript, availableLibraries: Library[]): string | null => {
        return availableLibraries.find(library => manuscriptMatchesLibrary(manuscript, library))?.name || null;
    }, []);

    const fetchManuscripts = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchAllLibraries = async (): Promise<Library[]> => {
                const first = await librariesApi.getAllLibraries(1, 100);
                let all = first.data || [];
                const totalPages = first.meta?.pagination?.pageCount || 1;

                if (totalPages > 1) {
                    const rest = [];
                    for (let page = 2; page <= totalPages; page++) {
                        rest.push(librariesApi.getAllLibraries(page, 100));
                    }
                    const responses = await Promise.all(rest);
                    for (const resp of responses) {
                        if (resp.data) {
                            all = [...all, ...resp.data];
                        }
                    }
                }

                return all;
            };

            const [fetchedLibraries, manuscriptsResponse] = await Promise.all([
                fetchAllLibraries(),
                manuscriptsApi.getManuscriptsBySection(sectionNumber!)
            ]);

            setLibraries(fetchedLibraries);

            const fetchedManuscripts = manuscriptsResponse.data || [];
            const manuscriptsWithLibraryNames = fetchedManuscripts.filter(m => inferLibraryNameForManuscript(m, fetchedLibraries));

            if (manuscriptsWithLibraryNames.length > 0) {
                setManuscripts(manuscriptsWithLibraryNames);

                const uniqueLibraryNames = Array.from(new Set(manuscriptsWithLibraryNames.map(m => inferLibraryNameForManuscript(m, fetchedLibraries)).filter(Boolean) as string[]));
                const firstLibraryName = uniqueLibraryNames[0] || '';
                const secondName = uniqueLibraryNames[1] || firstLibraryName;

                setSelectedLibraryName(firstLibraryName);
                setSecondLibraryName(secondName);

                const firstManuscript = manuscriptsWithLibraryNames.find(m => inferLibraryNameForManuscript(m, fetchedLibraries) === firstLibraryName) || null;
                const secondSelected = manuscriptsWithLibraryNames.find(m => inferLibraryNameForManuscript(m, fetchedLibraries) === secondName) || firstManuscript;

                setSelectedManuscript(firstManuscript);
                setSecondManuscript(secondSelected);
                setCurrentPage(0);
                setSecondPage(0);
            } else {
                setManuscripts([]);
                setError('No manuscripts found for this section.');
            }
        } catch (err) {
            console.error('Error fetching manuscripts:', err);
            setError('Failed to load manuscripts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // The pane zoom controls zoom both manuscripts together
    const handleZoomIn = () => {
        zoomPanPrimaryRef.current?.zoomIn();
        zoomPanSecondaryRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        zoomPanPrimaryRef.current?.zoomOut();
        zoomPanSecondaryRef.current?.zoomOut();
    };

    useEffect(() => {
        setZoom(100);
    }, [selectedManuscript, currentPage]);

    useEffect(() => {
        setSecondZoom(100);
    }, [secondManuscript, secondPage]);

    useEffect(() => {
        setFullscreenZoom(100);
    }, [fullscreenPane]);

    const allPages = useMemo(() => getManuscriptPageUrls(selectedManuscript), [selectedManuscript]);
    const secondManuscriptPages = useMemo(() => getManuscriptPageUrls(secondManuscript), [secondManuscript]);

    const availableLibraryOptions = useMemo(() => {
        const uniqueNames = Array.from(new Set(libraries.map(l => l.name).filter(Boolean)));
        uniqueNames.sort((a, b) => a.localeCompare(b));
        return uniqueNames.map(name => ({ value: name, label: name }));
    }, [libraries]);

    const handleLibraryChange = useCallback((libraryName: string) => {
        setSelectedLibraryName(libraryName);
        const ms = manuscripts.find(m => inferLibraryNameForManuscript(m, libraries) === libraryName) || null;
        setSelectedManuscript(ms);
        setCurrentPage(0);
    }, [inferLibraryNameForManuscript, libraries, manuscripts]);

    const handleSecondLibraryChange = useCallback((libraryName: string) => {
        setSecondLibraryName(libraryName);
        const ms = manuscripts.find(m => inferLibraryNameForManuscript(m, libraries) === libraryName) || null;
        setSecondManuscript(ms);
        setSecondPage(0);
    }, [inferLibraryNameForManuscript, libraries, manuscripts]);

    const panes = {
        primary: {
            label: 'Manuscript 1',
            libraryName: selectedLibraryName,
            onLibraryChange: handleLibraryChange,
            manuscript: selectedManuscript,
            pages: allPages,
            page: currentPage,
            setPage: setCurrentPage,
            zoom,
            setZoom,
            zoomRef: zoomPanPrimaryRef,
        },
        secondary: {
            label: 'Manuscript 2',
            libraryName: secondLibraryName,
            onLibraryChange: handleSecondLibraryChange,
            manuscript: secondManuscript,
            pages: secondManuscriptPages,
            page: secondPage,
            setPage: setSecondPage,
            zoom: secondZoom,
            setZoom: setSecondZoom,
            zoomRef: zoomPanSecondaryRef,
        },
    };

    const cleanArabicText = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/<center>|<\/center>/gi, '')
            .replace(/<span[^>]*>|<\/span>/gi, '')
            .replace(/&nbsp;/gi, ' ')
            .trim();
    };

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

    // Rendered via function calls (not as nested components) so the zoomable images keep their state across re-renders
    const renderManuscriptPane = (paneId: ComparisonPaneId, isMobileView: boolean) => {
        const pane = panes[paneId];
        const isComparison = viewMode === 'comparison';
        const pageCount = pane.pages.length;
        const pageUrl = pane.pages[pane.page] || '';

        return (
            <div className="ms-comparison__viewer">
                <div className={`ms-comparison__viewer-select ${isMobileView ? 'ms-comparison__viewer-select--mobile' : ''}`}>
                    <label className={`ms-comparison__viewer-select-label ${isMobileView ? 'ms-comparison__viewer-select-label--mobile' : ''}`}>
                        {isComparison ? `${pane.label}:` : 'Select Manuscript:'}
                    </label>
                    <Select
                        value={pane.libraryName}
                        onChange={pane.onLibraryChange}
                        options={availableLibraryOptions}
                        placeholder="Select a library"
                    />
                </div>

                <div className={`ms-comparison__viewer-toolbar ${isMobileView ? 'ms-comparison__viewer-toolbar--mobile' : ''}`}>
                    <div className="ms-comparison__viewer-toolbar-group">
                        <button
                            onClick={handleZoomOut}
                            disabled={!pageUrl || pane.zoom <= COMPARISON_MIN_SCALE * 100}
                            className="ms-comparison__viewer-btn"
                            aria-label="Zoom out"
                            title={isComparison ? 'Zoom out (both manuscripts)' : 'Zoom out'}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className={`ms-comparison__viewer-zoom-label ${isMobileView ? 'ms-comparison__viewer-zoom-label--mobile' : ''}`}>
                            {pane.zoom}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={!pageUrl || pane.zoom >= COMPARISON_MAX_SCALE * 100}
                            className="ms-comparison__viewer-btn"
                            aria-label="Zoom in"
                            title={isComparison ? 'Zoom in (both manuscripts)' : 'Zoom in'}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="ms-comparison__viewer-toolbar-nav-group">
                        <button
                            onClick={() => pane.setPage(prev => Math.max(0, prev - 1))}
                            disabled={pane.page === 0}
                            className={`ms-comparison__viewer-nav-btn ${isMobileView ? 'ms-comparison__viewer-nav-btn--mobile' : 'ms-comparison__viewer-nav-btn--default'}`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="ms-comparison__viewer-nav-label">Prev</span>
                        </button>
                        <button
                            onClick={() => pane.setPage(prev => Math.min(pageCount - 1, prev + 1))}
                            disabled={pageCount === 0 || pane.page >= pageCount - 1}
                            className={`ms-comparison__viewer-nav-btn ${isMobileView ? 'ms-comparison__viewer-nav-btn--mobile' : 'ms-comparison__viewer-nav-btn--default'}`}
                            aria-label="Next page"
                        >
                            <span className="ms-comparison__viewer-nav-label">Next</span>
                            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                    <div className="ms-comparison__viewer-toolbar-group">
                        <div className={`ms-comparison__viewer-page-counter ${isMobileView ? 'ms-comparison__viewer-page-counter--mobile' : ''}`}>
                            {pageCount > 0 ? pane.page + 1 : 0}/{pageCount}
                        </div>
                        <button
                            onClick={() => setFullscreenPane(paneId)}
                            disabled={!pageUrl}
                            className="ms-comparison__viewer-btn"
                            aria-label="View fullscreen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="ms-comparison__viewer-image-area ms-comparison__viewer-image-area--zoom">
                    {!pane.manuscript ? (
                        <div className="ms-comparison__viewer-empty">
                            <p>This library has no manuscript for this section.</p>
                        </div>
                    ) : pageCount === 0 ? (
                        <div className="ms-comparison__viewer-empty">
                            <p>No images available</p>
                        </div>
                    ) : pageUrl ? (
                        <div className="ms-comparison__zoom-stage">
                            <ComparisonZoomPanImage
                                key={`${paneId}-${pane.manuscript.id}-${pane.page}`}
                                ref={pane.zoomRef}
                                src={pageUrl}
                                alt={`${pane.libraryName || pane.label} - page ${pane.page + 1}`}
                                onZoomChange={pane.setZoom}
                            />
                        </div>
                    ) : (
                        <ComparisonMissingPagePlaceholder pageNumber={pane.page + 1} />
                    )}
                </div>

                <div className={`ms-comparison__viewer-dots-bar ${isMobileView ? 'ms-comparison__viewer-dots-bar--mobile' : ''}`}>
                    <div className="ms-viewer__pagination-dots">
                        {pane.pages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => pane.setPage(idx)}
                                aria-label={`Page ${idx + 1}`}
                                className={`ms-viewer__pagination-dot ${pane.page === idx ? 'ms-viewer__pagination-dot--active' : 'ms-viewer__pagination-dot--default'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderContentPane = (isMobileView: boolean) => (
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

    const renderFullscreen = () => {
        if (!fullscreenPane) return null;
        const pane = panes[fullscreenPane];
        const pageCount = pane.pages.length;
        const pageUrl = pane.pages[pane.page] || '';

        return (
            <div className="ms-comparison__fullscreen">
                <div className="ms-comparison__fullscreen-toolbar">
                    <div className="ms-comparison__fullscreen-group">
                        <button
                            onClick={() => zoomPanFullscreenRef.current?.zoomOut()}
                            disabled={!pageUrl || fullscreenZoom <= MIN_SCALE * 100}
                            className="ms-comparison__fullscreen-btn"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4" style={{ color: 'white' }} />
                        </button>
                        <span className="ms-comparison__fullscreen-zoom-label">{fullscreenZoom}%</span>
                        <button
                            onClick={() => zoomPanFullscreenRef.current?.zoomIn()}
                            disabled={!pageUrl || fullscreenZoom >= MAX_SCALE * 100}
                            className="ms-comparison__fullscreen-btn"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4" style={{ color: 'white' }} />
                        </button>
                    </div>
                    <div className="ms-comparison__fullscreen-nav-group">
                        <button
                            onClick={() => pane.setPage(prev => Math.max(0, prev - 1))}
                            disabled={pane.page === 0}
                            className="ms-comparison__fullscreen-nav-btn"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="ms-comparison__fullscreen-nav-label">Prev</span>
                        </button>
                        <button
                            onClick={() => pane.setPage(prev => Math.min(pageCount - 1, prev + 1))}
                            disabled={pageCount === 0 || pane.page >= pageCount - 1}
                            className="ms-comparison__fullscreen-nav-btn"
                            aria-label="Next page"
                        >
                            <span className="ms-comparison__fullscreen-nav-label">Next</span>
                            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                    <div className="ms-comparison__fullscreen-group">
                        <div className="ms-comparison__fullscreen-page-counter">
                            {pageCount > 0 ? pane.page + 1 : 0}/{pageCount}
                        </div>
                        <button
                            onClick={() => setFullscreenPane(null)}
                            className="ms-comparison__fullscreen-btn"
                            aria-label="Exit fullscreen"
                        >
                            <Minimize2 className="w-4 h-4" style={{ color: 'white' }} />
                        </button>
                    </div>
                </div>

                <div className="ms-comparison__fullscreen-content ms-comparison__fullscreen-content--zoom">
                    {pageUrl ? (
                        <ZoomPanImage
                            key={`fullscreen-${fullscreenPane}-${pane.manuscript?.id}-${pane.page}`}
                            ref={zoomPanFullscreenRef}
                            src={pageUrl}
                            alt={`${pane.libraryName || pane.label} - page ${pane.page + 1}`}
                            onZoomChange={setFullscreenZoom}
                        />
                    ) : pageCount > 0 ? (
                        <ComparisonMissingPagePlaceholder pageNumber={pane.page + 1} className="text-white" />
                    ) : (
                        <div className="ms-comparison__fullscreen-empty">
                            <p>No images available</p>
                        </div>
                    )}
                </div>

                <div className="ms-comparison__fullscreen-dots-bar">
                    <div className="ms-comparison__fullscreen-dots">
                        {pane.pages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => pane.setPage(idx)}
                                aria-label={`Page ${idx + 1}`}
                                className={`ms-comparison__fullscreen-dot ${pane.page === idx ? 'ms-comparison__fullscreen-dot--active' : 'ms-comparison__fullscreen-dot--default'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const secondaryTabLabel = viewMode === 'comparison' ? 'Manuscript 2' : 'Content';

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

                        {!loading && !error && (
                            <div className="ms-comparison__mode-bar" role="tablist" aria-label="Study mode">
                                <button
                                    role="tab"
                                    aria-selected={viewMode === 'content'}
                                    onClick={() => setViewMode('content')}
                                    className={`ms-comparison__tab-btn ${viewMode === 'content' ? 'ms-comparison__tab-btn--active' : 'ms-comparison__tab-btn--inactive'}`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span className="ms-comparison__mode-label-long">Manuscript &amp; Content</span>
                                    <span className="ms-comparison__mode-label-short">With Content</span>
                                </button>
                                <button
                                    role="tab"
                                    aria-selected={viewMode === 'comparison'}
                                    onClick={() => setViewMode('comparison')}
                                    className={`ms-comparison__tab-btn ${viewMode === 'comparison' ? 'ms-comparison__tab-btn--active' : 'ms-comparison__tab-btn--inactive'}`}
                                >
                                    <Columns2 className="w-4 h-4" />
                                    <span className="ms-comparison__mode-label-long">Compare Two Manuscripts</span>
                                    <span className="ms-comparison__mode-label-short">Compare Two</span>
                                </button>
                            </div>
                        )}

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
                                    {renderFullscreen()}

                                    {isDesktop ? (
                                        <div className="ms-comparison__desktop-split">
                                            <div className="ms-comparison__desktop-left">
                                                {renderManuscriptPane('primary', false)}
                                            </div>
                                            <div className={`ms-comparison__desktop-right ${viewMode === 'comparison' ? 'ms-comparison__desktop-right--manuscript' : ''}`}>
                                                {viewMode === 'comparison'
                                                    ? renderManuscriptPane('secondary', false)
                                                    : renderContentPane(false)}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="ms-comparison__mobile-tabs">
                                                <div className="ms-comparison__mobile-tabs-inner">
                                                    <button
                                                        onClick={() => setActiveTab('primary')}
                                                        className={`ms-comparison__tab-btn ${activeTab === 'primary' ? 'ms-comparison__tab-btn--active' : 'ms-comparison__tab-btn--inactive'}`}
                                                    >
                                                        <Image className="w-4 h-4" />
                                                        {viewMode === 'comparison' ? 'Manuscript 1' : 'Manuscript'}
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveTab('secondary')}
                                                        className={`ms-comparison__tab-btn ${activeTab === 'secondary' ? 'ms-comparison__tab-btn--active' : 'ms-comparison__tab-btn--inactive'}`}
                                                    >
                                                        {viewMode === 'comparison' ? <Image className="w-4 h-4" /> : <TextIcon className="w-4 h-4" />}
                                                        {secondaryTabLabel}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="ms-comparison__mobile-panel">
                                                {activeTab === 'primary'
                                                    ? renderManuscriptPane('primary', true)
                                                    : viewMode === 'comparison'
                                                        ? renderManuscriptPane('secondary', true)
                                                        : renderContentPane(true)}
                                            </div>
                                        </>
                                    )}
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
  arabic?: boolean;
}

export const ManuscriptMetadataDisplay: React.FC<ManuscriptMetadataDisplayProps> = ({ metadata }) => {
  const [activeTab, setActiveTab] = useState<MetadataTab>('overview');

  const overviewFields: MetadataField[] = [
    { label: 'Sigla (Arabic)', value: metadata.siglaArabic, icon: <Book className="w-4 h-4" />, arabic: true },
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
                {field.arabic ? <span className="font-taha text-base" dir="rtl">{field.value}</span> : field.value}
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
                href={`/manuscripts/view?id=${manuscript.id}`}
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

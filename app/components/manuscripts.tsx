'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Loader2, Check,
  Maximize2, Minimize2, Expand, Shrink, Search, Image as ImageIcon, BookOpenText, Columns2,
  Images, Table2, PanelRightOpen, PanelRightClose, RotateCcw, Plus, Minus,
} from 'lucide-react';
import {
  manuscriptCatalogApi,
  groupSectionRecords,
  sectionIndexApi,
  sectionTypeOf,
  compareSections,
  type ManuscriptCatalogEntry,
  type ManuscriptPageImage,
  type ManuscriptSectionType,
  type SectionIndexEntry,
  type SectionManuscript,
} from '@/api/manuscripts';
import { orationsApi, lettersApi, sayingsApi, radisApi, type Post } from '@/api/posts';
import { formatTextWithFootnotes } from '@/app/utils/text-formatting';

// ============================================================================
// Labels and small helpers
// ============================================================================

export type StudyMode = 'single' | 'edition' | 'compare';
export type CompareView = 'pages' | 'details';

const MODE_META: Record<StudyMode, { label: string; icon: React.ElementType }> = {
  single: { label: 'Single', icon: ImageIcon },
  edition: { label: 'With edition', icon: BookOpenText },
  compare: { label: 'Compare', icon: Columns2 },
};

const TYPE_LABELS: Record<ManuscriptSectionType, { singular: string; plural: string }> = {
  introduction: { singular: 'Introduction', plural: 'Introduction' },
  oration: { singular: 'Oration', plural: 'Orations' },
  letter: { singular: 'Letter', plural: 'Letters' },
  saying: { singular: 'Saying', plural: 'Sayings' },
};

const SECTION_TYPES: ManuscriptSectionType[] = ['introduction', 'oration', 'letter', 'saying'];

export function sectionLabel(section: string) {
  const type = sectionTypeOf(section);
  if (type === 'introduction') return 'Raḍī’s Introduction';
  return `${TYPE_LABELS[type].singular} ${section.split('.')[1] ?? section}`;
}

const MAX_COMPARE = 3;

const shortDate = (entry: ManuscriptCatalogEntry) =>
  entry.date.split('/')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();

const placeOf = (entry: ManuscriptCatalogEntry) => [entry.city, entry.country].filter(Boolean).join(', ');

const pageCountLabel = (count: number) => `${count} page${count === 1 ? '' : 's'}`;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Catalogue fields, in the order they are compared
type DetailField = { key: string; label: string; value: (entry: ManuscriptCatalogEntry) => string; long?: boolean };

const DETAIL_FIELDS: DetailField[] = [
  { key: 'sigla', label: 'Sigla', value: e => [e.siglaEnglish, e.siglaArabic].filter(Boolean).join(' / ') },
  { key: 'date', label: 'Date', value: e => e.date },
  { key: 'holding', label: 'Holding library', value: e => e.holdingLibrary },
  { key: 'place', label: 'Location', value: placeOf },
  { key: 'catalog', label: 'Catalogue no.', value: e => e.details.catalogNumber },
  { key: 'scribe', label: 'Scribe', value: e => e.details.scribe },
  { key: 'features', label: 'Script & features', value: e => e.details.features, long: true },
  { key: 'completeness', label: 'Completeness', value: e => e.details.completeness, long: true },
  { key: 'format', label: 'Published as', value: e => e.details.format, long: true },
  { key: 'notes', label: 'Notes', value: e => e.details.additionalInfo, long: true },
];

const hasCatalogueDetails = (entry: ManuscriptCatalogEntry) =>
  DETAIL_FIELDS.some(field => field.key !== 'sigla' && field.value(entry));

// ============================================================================
// Edition text (the critical edition, shown beside a manuscript)
// ============================================================================

export interface EditionTextSource {
  id?: number;
  heading?: string;
  title?: string;
  translations?: { type: string; text: string }[];
  paragraphs?: { id?: number; number?: string; arabic?: string; translations?: { type: string; text: string }[]; footnotes?: any[] }[];
  footnotes?: any[];
  arabic?: string;
  translation?: string;
  number?: string;
  sermonNumber?: string;
}

type TextBlock = { key: string; number?: string; arabic?: string; english?: string };
type EditionText = { blocks: TextBlock[]; footnotes: any[] };

const cleanArabic = (text?: string) =>
  (text || '')
    .replace(/<center>|<\/center>/gi, '')
    .replace(/<span[^>]*>|<\/span>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

const englishOf = (translations?: { type: string; text: string }[]) => translations?.find(t => t.type === 'en')?.text;

const compareParagraphNumbers = (a = '0', b = '0') => {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
};

function normalizeEditionText(source: EditionTextSource | EditionTextSource[] | null | undefined): EditionText | null {
  if (!source) return null;
  const list = Array.isArray(source) ? source : [source];
  const blocks: TextBlock[] = [];
  const footnotes: any[] = [];

  list.forEach((item, itemIndex) => {
    footnotes.push(...(item.footnotes || []));
    const titleEnglish = englishOf(item.translations);
    if (item.title || titleEnglish) {
      blocks.push({ key: `title-${item.id ?? itemIndex}`, arabic: cleanArabic(item.title), english: titleEnglish });
    }
    if (item.arabic || item.translation) {
      blocks.push({ key: `body-${item.id ?? itemIndex}`, number: item.number, arabic: cleanArabic(item.arabic), english: item.translation });
    }
    [...(item.paragraphs || [])]
      .sort((a, b) => compareParagraphNumbers(a.number, b.number))
      .forEach((paragraph, paragraphIndex) => {
        footnotes.push(...(paragraph.footnotes || []));
        blocks.push({
          key: `p-${paragraph.id ?? `${itemIndex}-${paragraphIndex}`}`,
          number: paragraph.number,
          arabic: cleanArabic(paragraph.arabic),
          english: englishOf(paragraph.translations),
        });
      });
  });

  return { blocks: blocks.filter(block => block.arabic || block.english), footnotes };
}

async function fetchEditionText(section: string): Promise<EditionTextSource | EditionTextSource[] | null> {
  const type = sectionTypeOf(section);
  if (type === 'introduction') {
    const response = await radisApi.getRadisIntroductions(1, 100);
    return response.data as EditionTextSource[];
  }
  if (type === 'oration') return orationsApi.getOrationBySermonNumber(section) as Promise<EditionTextSource | null>;
  if (type === 'letter') return lettersApi.getLetterBySermonNumber(section) as Promise<EditionTextSource | null>;
  return sayingsApi.getSayingBySermonNumber(section) as Promise<EditionTextSource | null>;
}

// ============================================================================
// ZoomPanImage: wheel / pinch / drag zoom. Shows the ~1000px rendition and swaps
// in the original scan once you zoom past what that rendition can show.
// ============================================================================

type ZoomPanHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

type ZoomPanImageProps = {
  src: string;
  hiResSrc?: string;
  alt: string;
  onZoomChange: (percent: number) => void;
  onLoadingChange?: (loading: boolean) => void;
};

// Zoom is relative to "fit": scale 1 (100%) shows the whole page inside the pane
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.25;

const ZoomPanImage = React.forwardRef<ZoomPanHandle, ZoomPanImageProps>(({ src, hiResSrc, alt, onZoomChange, onLoadingChange }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startTx: 0, startTy: 0, moved: false });
  const pinchRef = useRef({ active: false, startDistance: 0, startScale: 1, startTx: 0, startTy: 0 });

  const [containerSize, setContainerSize] = useState({ w: 1, h: 1 });
  // Layout uses the display rendition's size, so swapping in the original scan doesn't move anything
  const [imageSizeForSrc, setImageSizeForSrc] = useState<{ src: string; w: number; h: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [hiResReady, setHiResReady] = useState(false);
  const imageSize = imageSizeForSrc?.src === src ? imageSizeForSrc : null;
  const totalScale = baseScale * scale;

  const centerImage = useCallback((nextBase: number, nextScale: number, imgW: number, imgH: number, cW: number, cH: number) => {
    const total = nextBase * nextScale;
    setTranslate({ x: (cW - imgW * total) / 2, y: (cH - imgH * total) / 2 });
  }, []);

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
    setImageSizeForSrc(null);
    setBaseScale(1);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setHiResReady(false);
    onLoadingChange?.(true);
    const img = imgRef.current;
    if (!img || !img.complete) return;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w > 0 && h > 0) setImageSizeForSrc({ src, w, h });
  }, [src, onLoadingChange]);

  useEffect(() => {
    if (!imageSize) return;
    const fit = Math.min(containerSize.w / imageSize.w, containerSize.h / imageSize.h);
    const nextBase = isFinite(fit) && fit > 0 ? clamp(fit, 0.01, 5) : 1;
    setBaseScale(nextBase);
    setScale(1);
    centerImage(nextBase, 1, imageSize.w, imageSize.h, containerSize.w, containerSize.h);
    onZoomChange(100);
    onLoadingChange?.(false);
  }, [imageSize, containerSize, centerImage, onLoadingChange, onZoomChange]);

  // Swap in the original scan once the display rendition is being upscaled
  const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const needsHiRes = !!hiResSrc && hiResSrc !== src && !!imageSize && totalScale * devicePixelRatio > 1.05;
  useEffect(() => {
    if (!needsHiRes || hiResReady || !hiResSrc) return;
    let cancelled = false;
    const loader = new window.Image();
    loader.onload = () => { if (!cancelled) setHiResReady(true); };
    loader.src = hiResSrc;
    return () => { cancelled = true; };
  }, [needsHiRes, hiResReady, hiResSrc]);

  const setScaleAroundPoint = useCallback((clientX: number, clientY: number, nextScale: number) => {
    const el = containerRef.current;
    if (!el || !imageSize) return;
    const rect = el.getBoundingClientRect();
    setScale(nextScale);
    onZoomChange(Math.round(nextScale * 100));
    if (nextScale <= 1) {
      centerImage(baseScale, nextScale, imageSize.w, imageSize.h, rect.width, rect.height);
      return;
    }
    const px = clamp(clientX - rect.left, 0, rect.width);
    const py = clamp(clientY - rect.top, 0, rect.height);
    const contentX = (px - translate.x) / totalScale;
    const contentY = (py - translate.y) / totalScale;
    const nextTotal = baseScale * nextScale;
    setTranslate({ x: px - contentX * nextTotal, y: py - contentY * nextTotal });
  }, [baseScale, centerImage, imageSize, onZoomChange, totalScale, translate.x, translate.y]);

  const zoomBy = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setScaleAroundPoint(
      clientX ?? rect.left + rect.width / 2,
      clientY ?? rect.top + rect.height / 2,
      clamp(scale * factor, MIN_SCALE, MAX_SCALE)
    );
  }, [scale, setScaleAroundPoint]);

  const reset = useCallback(() => {
    if (!imageSize) return;
    setScale(1);
    onZoomChange(100);
    centerImage(baseScale, 1, imageSize.w, imageSize.h, containerSize.w, containerSize.h);
  }, [baseScale, centerImage, containerSize, imageSize, onZoomChange]);

  React.useImperativeHandle(ref, () => ({
    zoomIn: () => zoomBy(ZOOM_STEP),
    zoomOut: () => zoomBy(1 / ZOOM_STEP),
    reset,
  }), [reset, zoomBy]);

  // React's wheel listeners are passive, so attach a native one that can stop the page scrolling
  const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelHandlerRef.current = (e: WheelEvent) => {
    e.preventDefault();
    setScaleAroundPoint(e.clientX, e.clientY, clamp(scale * Math.exp(-e.deltaY * 0.002), MIN_SCALE, MAX_SCALE));
  };
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const listener = (e: WheelEvent) => wheelHandlerRef.current(e);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    containerRef.current?.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startTx: translate.x, startTy: translate.y, moved: false };
      pinchRef.current.active = false;
    } else if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      pinchRef.current = { active: true, startDistance: Math.hypot(a.x - b.x, a.y - b.y), startScale: scale, startTx: translate.x, startTy: translate.y };
      dragRef.current.active = false;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchRef.current.active && pointersRef.current.size >= 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const startTotal = baseScale * pinchRef.current.startScale;
      const contentX = (cx - pinchRef.current.startTx) / startTotal;
      const contentY = (cy - pinchRef.current.startTy) / startTotal;
      const ratio = pinchRef.current.startDistance > 0 ? Math.hypot(a.x - b.x, a.y - b.y) / pinchRef.current.startDistance : 1;
      const nextScale = clamp(pinchRef.current.startScale * ratio, MIN_SCALE, MAX_SCALE);
      const nextTotal = baseScale * nextScale;
      setScale(nextScale);
      setTranslate({ x: cx - contentX * nextTotal, y: cy - contentY * nextTotal });
      onZoomChange(Math.round(nextScale * 100));
      return;
    }

    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
    if (scale <= 1) return;
    setTranslate({ x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current.active = false;
    if (pointersRef.current.size === 0) dragRef.current.active = false;
  };

  // Double-click / double-tap toggles between fit and a closer look
  const onDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1.01) reset();
    else setScaleAroundPoint(e.clientX, e.clientY, 2.5);
  };

  return (
    <div
      ref={containerRef}
      className={`mss-zoom ${scale > 1 ? 'mss-zoom--panning' : ''}`}
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="mss-zoom__layer"
        style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${totalScale})`, transformOrigin: '0 0' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={hiResReady && hiResSrc ? hiResSrc : src}
          alt={alt}
          className="mss-zoom__img"
          style={imageSize ? { width: imageSize.w, height: imageSize.h } : undefined}
          draggable={false}
          onLoad={(e) => {
            if (imageSize) return; // the original scan replacing the display rendition
            const img = e.currentTarget;
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            setImageSizeForSrc({ src, w, h });
          }}
          onError={() => onLoadingChange?.(false)}
        />
      </div>
    </div>
  );
});
ZoomPanImage.displayName = 'ZoomPanImage';

// ============================================================================
// Manuscript page pane
// ============================================================================

interface ManuscriptPaneProps {
  entry: ManuscriptCatalogEntry;
  /** null while the section is loading; [] when this manuscript has no pages for it */
  pages: ManuscriptPageImage[] | null;
  sectionText: string;
  page: number;
  onPageChange: (page: number) => void;
  /** Labels for continuing into the neighbouring section past the first/last page */
  continuation?: { prev?: string; next?: string };
  onContinue?: (direction: 1 | -1) => void;
  order?: number;
  expanded?: boolean;
  onToggleExpand?: () => void;
  infoOpen?: boolean;
  onToggleInfo?: () => void;
}

const ManuscriptPane: React.FC<ManuscriptPaneProps> = ({
  entry, pages, sectionText, page, onPageChange, continuation, onContinue,
  order, expanded, onToggleExpand, infoOpen, onToggleInfo,
}) => {
  const zoomRef = useRef<ZoomPanHandle | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  const count = pages?.length ?? 0;
  const index = clamp(page, 0, Math.max(0, count - 1));
  const current = pages?.[index];
  const isFirst = index <= 0;
  const isLast = index >= count - 1;
  const prevLabel = isFirst ? continuation?.prev : undefined;
  const nextLabel = isLast ? continuation?.next : undefined;

  const goPrev = () => (isFirst ? prevLabel && onContinue?.(-1) : onPageChange(index - 1));
  const goNext = () => (isLast ? nextLabel && onContinue?.(1) : onPageChange(index + 1));

  // Keep the active thumbnail in view without scrolling the page
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[data-active="true"]');
    if (!strip || !active) return;
    strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
  }, [index, count]);

  const onStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomRef.current?.zoomIn(); }
    else if (e.key === '-') { e.preventDefault(); zoomRef.current?.zoomOut(); }
    else if (e.key === '0') { e.preventDefault(); zoomRef.current?.reset(); }
  };

  return (
    <section className="mss-pane" aria-label={entry.name}>
      <header className="mss-pane__header">
        {order !== undefined && <span className="mss-pane__order">{order}</span>}
        <div className="mss-pane__titles">
          <h3 className="mss-pane__title" title={entry.name}>{entry.name}</h3>
          <p className="mss-pane__meta">
            {[shortDate(entry), placeOf(entry)].filter(Boolean).join(' · ') || sectionText}
          </p>
        </div>
        <div className="mss-pane__actions">
          {onToggleInfo && (
            <button
              type="button"
              className={`mss-icon-btn ${infoOpen ? 'mss-icon-btn--active' : ''}`}
              onClick={onToggleInfo}
              aria-pressed={infoOpen}
              title={infoOpen ? 'Hide details' : 'Show details'}
            >
              {infoOpen ? <PanelRightClose /> : <PanelRightOpen />}
              <span className="sr-only">{infoOpen ? 'Hide details' : 'Show details'}</span>
            </button>
          )}
          {onToggleExpand && (
            <button type="button" className="mss-icon-btn" onClick={onToggleExpand} title={expanded ? 'Show all columns' : 'Enlarge this column'}>
              {expanded ? <Shrink /> : <Expand />}
              <span className="sr-only">{expanded ? 'Show all columns' : 'Enlarge this column'}</span>
            </button>
          )}
        </div>
      </header>

      {pages === null ? (
        <div className="mss-pane__stage mss-pane__stage--empty"><Loader2 className="mss-spin" /></div>
      ) : !current ? (
        <div className="mss-pane__stage mss-pane__stage--empty">
          <div className="mss-empty">
            <p className="mss-empty__title">No pages for {sectionText}</p>
            <p className="mss-empty__text">This manuscript has no digitized pages for this section. Choose another manuscript above{continuation?.next ? ' or continue to the next section' : ''}.</p>
            {continuation?.next && onContinue && (
              <button type="button" className="mss-text-btn" onClick={() => onContinue(1)}>
                {continuation.next} <ChevronRight />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className="mss-pane__stage"
            tabIndex={0}
            onKeyDown={onStageKeyDown}
            aria-label={`${entry.name}, page ${index + 1} of ${count}. Use the arrow keys to turn pages and plus or minus to zoom.`}
          >
            <ZoomPanImage
              key={current.id}
              ref={zoomRef}
              src={current.display}
              hiResSrc={current.full}
              alt={`${entry.name}, ${sectionText}, page ${index + 1}`}
              onZoomChange={setZoom}
              onLoadingChange={setLoading}
            />
            {loading && <div className="mss-pane__loading"><Loader2 className="mss-spin" /></div>}
            <span className="mss-pane__counter">{index + 1} / {count}</span>
            <div className="mss-zoombar" role="toolbar" aria-label="Zoom">
              <button type="button" onClick={() => zoomRef.current?.zoomOut()} title="Zoom out"><ZoomOut /><span className="sr-only">Zoom out</span></button>
              <span className="mss-zoombar__value" aria-live="polite">{zoom}%</span>
              <button type="button" onClick={() => zoomRef.current?.zoomIn()} title="Zoom in"><ZoomIn /><span className="sr-only">Zoom in</span></button>
              <button type="button" onClick={() => zoomRef.current?.reset()} title="Fit page" disabled={zoom === 100}><RotateCcw /><span className="sr-only">Fit page</span></button>
            </div>
          </div>

          <footer className="mss-pane__footer">
            <button
              type="button"
              className="mss-pager"
              onClick={goPrev}
              disabled={isFirst && !prevLabel}
              title={prevLabel ? `Continue to ${prevLabel}` : 'Previous page'}
            >
              <ChevronLeft />
              <span className="mss-pager__label">{prevLabel ?? 'Prev'}</span>
            </button>
            {count > 1 ? (
              <div className="mss-strip" ref={stripRef}>
                {pages!.map((p, i) => (
                  <button
                    type="button"
                    key={p.id}
                    data-active={i === index}
                    className={`mss-strip__thumb ${i === index ? 'mss-strip__thumb--active' : ''}`}
                    onClick={() => onPageChange(i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === index ? 'page' : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : (
              <span className="mss-pane__single">Single page</span>
            )}
            <button
              type="button"
              className="mss-pager mss-pager--next"
              onClick={goNext}
              disabled={isLast && !nextLabel}
              title={nextLabel ? `Continue to ${nextLabel}` : 'Next page'}
            >
              <span className="mss-pager__label">{nextLabel ?? 'Next'}</span>
              <ChevronRight />
            </button>
          </footer>
        </>
      )}
    </section>
  );
};

// ============================================================================
// Edition text pane
// ============================================================================

type TextDisplay = 'both' | 'arabic' | 'english';

const EditionTextPane: React.FC<{
  text: EditionText | null;
  loading: boolean;
  sectionText: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}> = ({ text, loading, sectionText, expanded, onToggleExpand }) => {
  const [display, setDisplay] = useState<TextDisplay>('both');

  return (
    <section className="mss-pane mss-pane--text" aria-label="Critical edition text">
      <header className="mss-pane__header">
        <div className="mss-pane__titles">
          <h3 className="mss-pane__title">Critical edition</h3>
          <p className="mss-pane__meta">{sectionText}</p>
        </div>
        <div className="mss-pane__actions">
          <div className="mss-seg mss-seg--small" role="group" aria-label="Language">
            {(['both', 'arabic', 'english'] as TextDisplay[]).map(option => (
              <button
                type="button"
                key={option}
                className={display === option ? 'mss-seg__btn mss-seg__btn--active' : 'mss-seg__btn'}
                aria-pressed={display === option}
                onClick={() => setDisplay(option)}
              >
                {option === 'both' ? 'Both' : option === 'arabic' ? 'Arabic' : 'English'}
              </button>
            ))}
          </div>
          {onToggleExpand && (
            <button type="button" className="mss-icon-btn" onClick={onToggleExpand} title={expanded ? 'Show all columns' : 'Enlarge this column'}>
              {expanded ? <Shrink /> : <Expand />}
              <span className="sr-only">{expanded ? 'Show all columns' : 'Enlarge this column'}</span>
            </button>
          )}
        </div>
      </header>
      <div className="mss-text">
        {loading ? (
          <div className="mss-pane__stage--empty"><Loader2 className="mss-spin" /></div>
        ) : !text || text.blocks.length === 0 ? (
          <div className="mss-empty">
            <p className="mss-empty__title">No edition text</p>
            <p className="mss-empty__text">The critical edition text for {sectionText} isn’t available.</p>
          </div>
        ) : (
          text.blocks.map(block => (
            <div key={block.key} className="mss-text__block">
              {block.number && <span className="mss-text__number">{block.number}</span>}
              {display !== 'english' && block.arabic && (
                <p className="mss-text__arabic" dir="rtl" lang="ar">
                  {formatTextWithFootnotes(block.arabic, text.footnotes, true, block.number || 'main')}
                </p>
              )}
              {display !== 'arabic' && block.english && (
                <p className="mss-text__english">
                  {formatTextWithFootnotes(block.english, text.footnotes, false, block.number || 'main')}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

// ============================================================================
// Details: one manuscript (side panel) or several (aligned comparison table)
// ============================================================================

const DetailsPanel: React.FC<{ entry: ManuscriptCatalogEntry; pages: number; sectionText: string; onClose: () => void }> = ({ entry, pages, sectionText, onClose }) => {
  const fields = DETAIL_FIELDS.map(field => ({ field, value: field.value(entry) })).filter(row => row.value);
  return (
    <aside className="mss-info" aria-label={`Details of ${entry.name}`}>
      <div className="mss-info__head">
        <p className="mss-info__eyebrow">Manuscript details</p>
        <button type="button" className="mss-icon-btn" onClick={onClose} title="Hide details"><X /><span className="sr-only">Hide details</span></button>
      </div>
      <h3 className="mss-info__title">{entry.name}</h3>
      <dl className="mss-info__list">
        {fields.map(({ field, value }) => (
          <div key={field.key} className="mss-info__row">
            <dt>{field.label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div className="mss-info__row">
          <dt>Pages for {sectionText}</dt>
          <dd>{pages}</dd>
        </div>
      </dl>
      {!hasCatalogueDetails(entry) && (
        <p className="mss-info__note">Catalogue details for this manuscript haven’t been added yet.</p>
      )}
      <Link href="/manuscripts/information" className="mss-text-btn mss-info__link">
        All manuscript details <ChevronRight />
      </Link>
    </aside>
  );
};

const DetailsComparison: React.FC<{
  columns: { entry: ManuscriptCatalogEntry; item: SectionManuscript | undefined }[];
  sectionText: string;
}> = ({ columns, sectionText }) => {
  const rows = DETAIL_FIELDS.filter(field => columns.some(col => field.value(col.entry)));
  const withoutDetails = columns.filter(col => !hasCatalogueDetails(col.entry)).map(col => col.entry.name);

  return (
    <div className="mss-compare-details">
      <div className="mss-compare-details__scroll">
        <table className="mss-table" style={{ '--mss-table-cols': columns.length } as React.CSSProperties}>
          <thead>
            <tr>
              <th scope="col" className="mss-table__corner"><span className="sr-only">Field</span></th>
              {columns.map(({ entry, item }, i) => (
                <th scope="col" key={entry.id}>
                  <div className="mss-table__colhead">
                    <span className="mss-table__thumb">
                      {item?.pages[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.pages[0].thumb} alt="" />
                      ) : null}
                    </span>
                    <span className="mss-table__colname">
                      <span className="mss-pane__order">{i + 1}</span>
                      {entry.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(field => {
              const values = columns.map(col => field.value(col.entry));
              const filled = values.filter(Boolean);
              const differs = filled.length > 1 && new Set(filled).size > 1;
              return (
                <tr key={field.key} className={field.long ? 'mss-table__row--long' : undefined}>
                  <th scope="row">{field.label}</th>
                  {values.map((value, i) => (
                    <td key={columns[i].entry.id} className={!value ? 'mss-table__empty' : differs ? 'mss-table__differs' : undefined}>
                      {value || 'Not recorded'}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th scope="row">Pages for {sectionText}</th>
              {columns.map(({ entry, item }) => (
                <td key={entry.id}>{item ? pageCountLabel(item.pages.length) : 'None'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {withoutDetails.length > 0 && (
        <p className="mss-compare-details__note">
          Catalogue details haven’t been added yet for {withoutDetails.join(', ')}.
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Manuscript picker (thumbnail cards for the current section)
// ============================================================================

const ManuscriptPicker: React.FC<{
  items: SectionManuscript[];
  missing: ManuscriptCatalogEntry[];
  selected: string[];
  mode: StudyMode;
  sectionText: string;
  loading: boolean;
  open: boolean;
  notice: string | null;
  onToggleOpen: () => void;
  /** Plain click: show just this manuscript */
  onSelect: (id: string) => void;
  /** The small +/− button: add to (or remove from) the side-by-side comparison */
  onToggleCompare: (id: string) => void;
}> = ({ items, missing, selected, mode, sectionText, loading, open, notice, onToggleOpen, onSelect, onToggleCompare }) => {
  const comparing = mode === 'compare' ? selected.slice(0, MAX_COMPARE) : [];
  const hint = mode === 'compare'
    ? `+ to add (up to ${MAX_COMPARE}), − to remove · select one to view it alone`
    : mode === 'edition'
      ? 'Select one to read beside the edition · + to compare'
      : 'Select one to view it · + to compare';

  const renderCard = (entry: ManuscriptCatalogEntry, item: SectionManuscript | undefined) => {
    const id = entry.id;
    const comparePosition = comparing.indexOf(id);
    const inCompare = comparePosition >= 0;
    const isShown = mode === 'compare' ? inCompare : selected[0] === id;
    // In Single / With edition the manuscript already on screen has nothing to be compared with yet
    const showCompareButton = mode === 'compare' || !isShown;
    const thumb = item?.pages[0]?.thumb;
    const meta = item
      ? [shortDate(entry), pageCountLabel(item.pages.length)].filter(Boolean).join(' · ')
      : 'Not in this section';

    return (
      <div
        key={id}
        className={`mss-card ${isShown ? 'mss-card--selected' : ''} ${item ? '' : 'mss-card--missing'}`}
      >
        <button
          type="button"
          className="mss-card__main"
          onClick={() => onSelect(id)}
          aria-pressed={isShown}
          title={item ? `View ${entry.name}` : `${entry.name} has no pages for ${sectionText}`}
        >
          <span className="mss-card__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className="mss-card__none">No pages</span>}
          </span>
          <span className="mss-card__name">{entry.name}</span>
          <span className="mss-card__meta">{meta}</span>
        </button>
        {isShown && (
          <span className="mss-card__badge" aria-hidden="true">
            {mode === 'compare' ? comparePosition + 1 : <Check />}
          </span>
        )}
        {showCompareButton && (
          <button
            type="button"
            className={`mss-card__compare ${inCompare ? 'mss-card__compare--remove' : ''}`}
            onClick={() => onToggleCompare(id)}
            title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            {inCompare ? <Minus /> : <Plus />}
            <span className="sr-only">{inCompare ? `Remove ${entry.name} from comparison` : `Compare ${entry.name}`}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`mss-picker ${open ? '' : 'mss-picker--collapsed'}`}>
      <div className="mss-picker__head">
        <p className="mss-picker__summary">
          {loading ? (
            'Finding manuscripts…'
          ) : (
            <>
              <strong>{items.length} manuscript{items.length === 1 ? '' : 's'}</strong> contain {sectionText}
              {items.length > 0 && <span className="mss-picker__hint"> · {hint}</span>}
            </>
          )}
        </p>
        {notice && <p className="mss-picker__notice" role="status">{notice}</p>}
        <button type="button" className="mss-text-btn" onClick={onToggleOpen} aria-expanded={open}>
          {open ? 'Hide' : 'Show'} {open ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {open && (
        <div className="mss-picker__row" role="group" aria-label="Manuscripts">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <span key={i} className="mss-card mss-card--skeleton" />)
            : (
              <>
                {items.map(item => renderCard(item.entry, item))}
                {missing.map(entry => renderCard(entry, undefined))}
              </>
            )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Section picker (type tabs, search by number or title)
// ============================================================================

const SectionPicker: React.FC<{
  section: string;
  heading?: string;
  onChange: (section: string) => void;
}> = ({ section, heading, onChange }) => {
  const [open, setOpen] = useState(false);
  const [browseType, setBrowseType] = useState<ManuscriptSectionType>(sectionTypeOf(section));
  const [lists, setLists] = useState<Partial<Record<ManuscriptSectionType, SectionIndexEntry[]>>>({});
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setBrowseType(sectionTypeOf(section));
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, section]);

  useEffect(() => {
    if (!open || lists[browseType]) return;
    let cancelled = false;
    sectionIndexApi.getSections(browseType)
      .then(entries => { if (!cancelled) setLists(prev => ({ ...prev, [browseType]: entries })); })
      .catch(() => { if (!cancelled) setLists(prev => ({ ...prev, [browseType]: [] })); });
    return () => { cancelled = true; };
  }, [open, browseType, lists]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const entries = lists[browseType];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!entries) return [];
    if (!q) return entries;
    return entries.filter(e => e.number === q || e.number.startsWith(q) || e.heading.toLowerCase().includes(q));
  }, [entries, query]);

  const choose = (next: string) => {
    setOpen(false);
    if (next !== section) onChange(next);
  };

  return (
    <div className="mss-section-picker" ref={rootRef}>
      <button
        type="button"
        className="mss-section-picker__button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="mss-section-picker__label">{sectionLabel(section)}</span>
        {heading && <span className="mss-section-picker__heading">{heading}</span>}
        <ChevronDown className="mss-section-picker__chevron" />
      </button>

      {open && (
        <div className="mss-section-picker__panel">
          <div className="mss-section-picker__types" role="tablist" aria-label="Section type">
            {SECTION_TYPES.map(type => (
              <button
                type="button"
                key={type}
                role="tab"
                aria-selected={browseType === type}
                className={browseType === type ? 'mss-section-picker__type mss-section-picker__type--active' : 'mss-section-picker__type'}
                onClick={() => setBrowseType(type)}
              >
                {TYPE_LABELS[type].plural}
              </button>
            ))}
          </div>
          {browseType !== 'introduction' && (
            <label className="mss-section-picker__search">
              <Search />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) choose(filtered[0].section); }}
                placeholder={`${TYPE_LABELS[browseType].singular} number or title…`}
                aria-label={`Find a ${TYPE_LABELS[browseType].singular.toLowerCase()}`}
              />
            </label>
          )}
          <ul className="mss-section-picker__list" role="listbox" aria-label={TYPE_LABELS[browseType].plural}>
            {!entries ? (
              <li className="mss-section-picker__status"><Loader2 className="mss-spin" /></li>
            ) : filtered.length === 0 ? (
              <li className="mss-section-picker__status">No matches</li>
            ) : (
              filtered.map(entry => (
                <li key={entry.section}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={entry.section === section}
                    className={entry.section === section ? 'mss-section-picker__option mss-section-picker__option--active' : 'mss-section-picker__option'}
                    onClick={() => choose(entry.section)}
                  >
                    <span className="mss-section-picker__num">{browseType === 'introduction' ? '' : entry.number}</span>
                    <span className="mss-section-picker__title">{entry.heading || sectionLabel(entry.section)}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ManuscriptStudio: the viewer used on /manuscripts/view and in the compare dialog
// ============================================================================

export interface StudioState {
  mode: StudyMode;
  manuscripts: string[];
  compareView: CompareView;
}

interface ManuscriptStudioProps {
  variant: 'page' | 'modal';
  section: string;
  /** Provided on the viewer page: enables the section picker and paging across sections */
  onSectionChange?: (section: string) => void;
  /** Overrides the label derived from the section number (e.g. "Conclusion 2") */
  sectionTitle?: string;
  modes?: StudyMode[];
  initialMode?: StudyMode;
  initialManuscripts?: string[];
  /** Selected first when present in the section (older ?library= links) */
  preferredManuscript?: string;
  initialCompareView?: CompareView;
  onStateChange?: (state: StudioState) => void;
  /** Edition text supplied by the caller (the dialog already has it) */
  textSource?: EditionTextSource | null;
  title?: string;
  onClose?: () => void;
}

export function ManuscriptStudio({
  variant,
  section,
  onSectionChange,
  sectionTitle,
  modes = ['single', 'edition', 'compare'],
  initialMode = 'single',
  initialManuscripts,
  preferredManuscript,
  initialCompareView = 'pages',
  onStateChange,
  textSource,
  title,
  onClose,
}: ManuscriptStudioProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [catalog, setCatalog] = useState<ManuscriptCatalogEntry[] | null>(null);
  const [sectionData, setSectionData] = useState<{ section: string; items: SectionManuscript[] } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [mode, setMode] = useState<StudyMode>(modes.includes(initialMode) ? initialMode : modes[0]);
  const [selected, setSelected] = useState<string[]>(initialManuscripts || []);
  const [compareView, setCompareView] = useState<CompareView>(initialCompareView);
  const [pageBy, setPageBy] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fetchedText, setFetchedText] = useState<{ section: string; text: EditionText | null } | null>(null);
  const [sectionIndex, setSectionIndex] = useState<{ type: ManuscriptSectionType; entries: SectionIndexEntry[] } | null>(null);

  const catalogRef = useRef<ManuscriptCatalogEntry[] | null>(null);
  const selectionInitialized = useRef((initialManuscripts?.length ?? 0) > 0);
  const continuationRef = useRef<{ direction: 1 | -1; urls: Record<string, string> } | null>(null);

  const sectionType = sectionTypeOf(section);
  const sectionText = sectionTitle ?? sectionLabel(section);
  const canNavigate = !!onSectionChange;

  // Show the details panel by default on wide screens (after mount, to match the server render)
  useEffect(() => {
    if (window.matchMedia('(min-width: 1280px)').matches) setInfoOpen(true);
  }, []);

  // ---- Data: the small catalogue once, then the page records of each section ----
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    Promise.all([
      catalogRef.current ? Promise.resolve(catalogRef.current) : manuscriptCatalogApi.getCatalog(),
      manuscriptCatalogApi.getSectionRecords(section),
    ])
      .then(([cat, records]) => {
        if (cancelled) return;
        catalogRef.current = cat;
        setCatalog(cat);
        setSectionData({ section, items: groupSectionRecords(records, cat) });
      })
      .catch(err => {
        console.error('Error loading manuscripts:', err);
        if (!cancelled) setLoadError(true);
      });
    return () => { cancelled = true; };
  }, [section, retryKey]);

  const ready = sectionData?.section === section;
  const items = useMemo(() => (ready ? sectionData!.items : []), [ready, sectionData]);
  const itemById = useMemo(() => new Map(items.map(item => [item.entry.id, item])), [items]);
  const catalogById = useMemo(() => new Map((catalog || []).map(entry => [entry.id, entry])), [catalog]);

  // ---- Default selection, and where each manuscript opens in a new section ----
  useEffect(() => {
    if (!ready) return;
    const ids = items.map(item => item.entry.id);

    if (!selectionInitialized.current) {
      selectionInitialized.current = true;
      const preferred = preferredManuscript && ids.includes(preferredManuscript) ? [preferredManuscript] : [];
      const rest = ids.filter(id => !preferred.includes(id));
      setSelected([...preferred, ...rest].slice(0, mode === 'compare' ? 2 : 1));
    }

    // Paging past the end of a section continues on the next new page of the same manuscript
    const plan = continuationRef.current;
    continuationRef.current = null;
    const next: Record<string, number> = {};
    for (const item of items) {
      let start = plan?.direction === -1 ? item.pages.length - 1 : 0;
      const lastUrl = plan?.urls[item.entry.id];
      if (plan && lastUrl) {
        const at = item.pages.findIndex(p => p.full === lastUrl);
        if (at >= 0) start = clamp(at + plan.direction, 0, item.pages.length - 1);
      }
      next[item.entry.id] = start;
    }
    setPageBy(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sectionData]);

  // Drop ids that aren't manuscripts (e.g. a mistyped link)
  useEffect(() => {
    if (!catalog) return;
    setSelected(prev => {
      const valid = prev.filter(id => catalogById.has(id));
      return valid.length === prev.length ? prev : valid;
    });
  }, [catalog, catalogById]);

  // ---- Section index: headings and neighbours for prev/next ----
  useEffect(() => {
    if (!canNavigate || sectionIndex?.type === sectionType) return;
    let cancelled = false;
    sectionIndexApi.getSections(sectionType)
      .then(entries => { if (!cancelled) setSectionIndex({ type: sectionType, entries }); })
      .catch(() => { if (!cancelled) setSectionIndex({ type: sectionType, entries: [] }); });
    return () => { cancelled = true; };
  }, [canNavigate, sectionType, sectionIndex?.type]);

  const neighbours = useMemo(() => {
    if (!sectionIndex || sectionIndex.type !== sectionType) return { prev: null, next: null, current: null };
    const entries = sectionIndex.entries;
    const at = entries.findIndex(e => e.section === section);
    if (at >= 0) return { prev: entries[at - 1] ?? null, next: entries[at + 1] ?? null, current: entries[at] };
    return {
      prev: [...entries].reverse().find(e => compareSections(e.section, section) < 0) ?? null,
      next: entries.find(e => compareSections(e.section, section) > 0) ?? null,
      current: null,
    };
  }, [sectionIndex, section, sectionType]);

  // ---- Edition text ----
  const providedText = useMemo(() => normalizeEditionText(textSource), [textSource]);
  const needsText = mode === 'edition' && !textSource;
  useEffect(() => {
    if (!needsText || fetchedText?.section === section) return;
    let cancelled = false;
    fetchEditionText(section)
      .then(source => { if (!cancelled) setFetchedText({ section, text: normalizeEditionText(source) }); })
      .catch(err => {
        console.error('Error loading edition text:', err);
        if (!cancelled) setFetchedText({ section, text: null });
      });
    return () => { cancelled = true; };
  }, [needsText, section, fetchedText?.section]);

  const editionText = textSource ? providedText : fetchedText?.section === section ? fetchedText.text : null;
  const editionLoading = needsText && fetchedText?.section !== section;

  // ---- Report state (the page keeps it in the URL) ----
  useEffect(() => {
    onStateChange?.({ mode, manuscripts: selected, compareView });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selected, compareView]);

  // ---- Fullscreen (viewer page) ----
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!rootRef.current && document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  // ---- Actions ----
  const changeMode = (next: StudyMode) => {
    setMode(next);
    setExpanded(null);
    setNotice(null);
    if (next === 'compare' && selected.length < 2) {
      const extra = items.map(item => item.entry.id).filter(id => !selected.includes(id));
      setSelected([...selected, ...extra].slice(0, 2));
    }
  };

  // Plain click on a card: show that manuscript on its own. From Compare this returns to
  // Single; in With edition the edition text stays beside it. The rest of the selection is kept
  // so switching back to Compare restores the comparison.
  const selectOnly = (id: string) => {
    setNotice(null);
    setSelected([id, ...selected.filter(x => x !== id)].slice(0, MAX_COMPARE));
    if (mode === 'compare') {
      setMode('single');
      setExpanded(null);
    }
    setMobileTab(null);
  };

  // The + / − on a card: build up a side-by-side comparison
  const toggleCompare = (id: string) => {
    setNotice(null);
    if (mode !== 'compare') {
      const current = selected[0];
      setSelected(current && current !== id ? [current, id] : [id]);
      setMode('compare');
      setExpanded(null);
      setMobileTab(id);
      return;
    }
    const active = selected.slice(0, MAX_COMPARE);
    if (active.includes(id)) {
      setSelected(active.filter(x => x !== id));
      if (expanded === id) setExpanded(null);
    } else if (active.length >= MAX_COMPARE) {
      setNotice(`You can compare up to ${MAX_COMPARE} manuscripts. Remove one first.`);
    } else {
      setSelected([...active, id]);
      setMobileTab(id);
    }
  };

  const continueTo = (direction: 1 | -1) => {
    const target = direction === 1 ? neighbours.next : neighbours.prev;
    if (!target || !onSectionChange) return;
    const urls: Record<string, string> = {};
    for (const id of selected) {
      const item = itemById.get(id);
      const pageImage = item?.pages[pageBy[id] ?? 0];
      if (pageImage) urls[id] = pageImage.full;
    }
    continuationRef.current = { direction, urls };
    onSectionChange(target.section);
  };

  const continuation = canNavigate
    ? { prev: neighbours.prev ? sectionLabel(neighbours.prev.section) : undefined, next: neighbours.next ? sectionLabel(neighbours.next.section) : undefined }
    : undefined;

  // ---- Columns for the current mode ----
  const primaryId = selected[0];
  const columnIds: string[] =
    mode === 'compare' ? selected.slice(0, MAX_COMPARE) : primaryId ? [primaryId] : [];
  type Column = { key: string; kind: 'ms'; entry: ManuscriptCatalogEntry } | { key: 'text'; kind: 'text' };
  const columns: Column[] = [
    ...columnIds
      .map(id => catalogById.get(id))
      .filter((entry): entry is ManuscriptCatalogEntry => !!entry)
      .map(entry => ({ key: entry.id, kind: 'ms' as const, entry })),
    ...(mode === 'edition' ? [{ key: 'text' as const, kind: 'text' as const }] : []),
  ];
  const expandedKey = expanded && columns.some(c => c.key === expanded) ? expanded : null;
  const activeTab = mobileTab && columns.some(c => c.key === mobileTab) ? mobileTab : columns[0]?.key;
  const missing = selected
    .slice(0, mode === 'compare' ? MAX_COMPARE : 1)
    .filter(id => ready && !itemById.has(id))
    .map(id => catalogById.get(id))
    .filter((entry): entry is ManuscriptCatalogEntry => !!entry);

  const primaryEntry = primaryId ? catalogById.get(primaryId) : undefined;
  const showInfo = mode === 'single' && infoOpen && !!primaryEntry;
  const showDetailsTable = mode === 'compare' && compareView === 'details';

  const renderColumn = (column: Column) => {
    if (column.kind === 'text') {
      return (
        <EditionTextPane
          text={editionText}
          loading={editionLoading}
          sectionText={sectionText}
          expanded={expandedKey === 'text'}
          onToggleExpand={() => setExpanded(expandedKey === 'text' ? null : 'text')}
        />
      );
    }
    const item = itemById.get(column.entry.id);
    return (
      <ManuscriptPane
        entry={column.entry}
        pages={ready ? item?.pages ?? [] : null}
        sectionText={sectionText}
        page={pageBy[column.entry.id] ?? 0}
        onPageChange={(p) => setPageBy(prev => ({ ...prev, [column.entry.id]: p }))}
        continuation={continuation}
        onContinue={continueTo}
        order={mode === 'compare' ? columnIds.indexOf(column.entry.id) + 1 : undefined}
        expanded={expandedKey === column.key}
        onToggleExpand={columns.length > 1 ? () => setExpanded(expandedKey === column.key ? null : column.key) : undefined}
        infoOpen={mode === 'single' ? infoOpen : undefined}
        onToggleInfo={mode === 'single' ? () => setInfoOpen(o => !o) : undefined}
      />
    );
  };

  const stageBody = () => {
    if (loadError) {
      return (
        <div className="mss-empty mss-empty--panel">
          <p className="mss-empty__title">The manuscripts couldn’t be loaded</p>
          <p className="mss-empty__text">Check your connection and try again.</p>
          <button type="button" className="mss-text-btn" onClick={() => setRetryKey(k => k + 1)}>Try again</button>
        </div>
      );
    }
    if (ready && items.length === 0 && mode !== 'edition') {
      return (
        <div className="mss-empty mss-empty--panel">
          <p className="mss-empty__title">No manuscript pages for {sectionText} yet</p>
          <p className="mss-empty__text">Pages for this section haven’t been added.{continuation?.next ? ' Try the next section.' : ''}</p>
          {continuation?.next && (
            <button type="button" className="mss-text-btn" onClick={() => continueTo(1)}>{continuation.next} <ChevronRight /></button>
          )}
        </div>
      );
    }
    if (showDetailsTable) {
      return (
        <DetailsComparison
          columns={columnIds
            .map(id => catalogById.get(id))
            .filter((entry): entry is ManuscriptCatalogEntry => !!entry)
            .map(entry => ({ entry, item: itemById.get(entry.id) }))}
          sectionText={sectionText}
        />
      );
    }
    if (columns.length === 0 || (mode === 'compare' && columnIds.length === 0)) {
      return (
        <div className="mss-empty mss-empty--panel">
          <p className="mss-empty__title">{ready ? 'Choose a manuscript' : 'Loading…'}</p>
          {ready && <p className="mss-empty__text">Pick a manuscript from the row above to see its pages.</p>}
        </div>
      );
    }

    const visible = expandedKey ? columns.filter(c => c.key === expandedKey) : columns;
    const showAddHint = mode === 'compare' && columnIds.length === 1 && !expandedKey;
    return (
      <>
        {columns.length > 1 && (
          <div className="mss-tabs" role="tablist" aria-label="Columns">
            {columns.map(column => (
              <button
                type="button"
                key={column.key}
                role="tab"
                aria-selected={activeTab === column.key}
                className={activeTab === column.key ? 'mss-tabs__tab mss-tabs__tab--active' : 'mss-tabs__tab'}
                onClick={() => setMobileTab(column.key)}
              >
                {column.kind === 'text' ? 'Edition text' : column.entry.name}
              </button>
            ))}
          </div>
        )}
        <div className="mss-columns" style={{ '--mss-cols': visible.length + (showAddHint ? 1 : 0) } as React.CSSProperties}>
          {visible.map(column => (
            <div key={column.key} className={`mss-column ${activeTab === column.key ? 'mss-column--active' : ''}`}>
              {renderColumn(column)}
            </div>
          ))}
          {showAddHint && (
            <div className="mss-column mss-column--hint">
              <div className="mss-empty mss-empty--panel">
                <p className="mss-empty__title">Add a manuscript</p>
                <p className="mss-empty__text">Choose another manuscript from the row above to compare it with this one.</p>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div ref={rootRef} className={`mss mss--${variant} ${isFullscreen ? 'mss--fullscreen' : ''}`}>
      <div className="mss-bar">
        {variant === 'modal' && (
          <div className="mss-bar__title">
            <div className="mss-bar__title-text">
              <p className="mss-bar__eyebrow">Manuscripts</p>
              <h2 className="mss-bar__heading" title={title || sectionText}>{title || sectionText}</h2>
            </div>
            <button type="button" className="mss-icon-btn mss-icon-btn--bordered" onClick={onClose} title="Close">
              <X /><span className="sr-only">Close</span>
            </button>
          </div>
        )}

        {modes.length > 1 && (
          <div className="mss-seg mss-modes" role="tablist" aria-label="Viewing mode">
            {modes.map(m => {
              const Icon = MODE_META[m].icon;
              return (
                <button
                  type="button"
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  className={mode === m ? 'mss-seg__btn mss-seg__btn--active' : 'mss-seg__btn'}
                  onClick={() => changeMode(m)}
                >
                  <Icon />
                  <span>{MODE_META[m].label}</span>
                </button>
              );
            })}
          </div>
        )}

        {canNavigate && (
          <div className="mss-sectionnav">
            <button
              type="button"
              className="mss-icon-btn mss-icon-btn--bordered"
              onClick={() => neighbours.prev && onSectionChange!(neighbours.prev.section)}
              disabled={!neighbours.prev}
              title={neighbours.prev ? `Previous: ${sectionLabel(neighbours.prev.section)}` : 'Previous section'}
            >
              <ChevronLeft /><span className="sr-only">Previous section</span>
            </button>
            <SectionPicker section={section} heading={neighbours.current?.heading} onChange={onSectionChange!} />
            <button
              type="button"
              className="mss-icon-btn mss-icon-btn--bordered"
              onClick={() => neighbours.next && onSectionChange!(neighbours.next.section)}
              disabled={!neighbours.next}
              title={neighbours.next ? `Next: ${sectionLabel(neighbours.next.section)}` : 'Next section'}
            >
              <ChevronRight /><span className="sr-only">Next section</span>
            </button>
          </div>
        )}

        <div className="mss-bar__end">
          {mode === 'compare' && (
            <div className="mss-seg" role="group" aria-label="Compare">
              <button
                type="button"
                className={compareView === 'pages' ? 'mss-seg__btn mss-seg__btn--active' : 'mss-seg__btn'}
                aria-pressed={compareView === 'pages'}
                onClick={() => setCompareView('pages')}
              >
                <Images /><span>Pages</span>
              </button>
              <button
                type="button"
                className={compareView === 'details' ? 'mss-seg__btn mss-seg__btn--active' : 'mss-seg__btn'}
                aria-pressed={compareView === 'details'}
                onClick={() => setCompareView('details')}
              >
                <Table2 /><span>Details</span>
              </button>
            </div>
          )}
          {variant === 'page' && (
            <button type="button" className="mss-icon-btn mss-icon-btn--bordered" onClick={toggleFullscreen} title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
              <span className="sr-only">{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
            </button>
          )}
        </div>
      </div>

      <ManuscriptPicker
        items={items}
        missing={missing}
        selected={selected}
        mode={mode}
        sectionText={sectionText}
        loading={!ready && !loadError}
        open={pickerOpen}
        notice={notice}
        onToggleOpen={() => setPickerOpen(o => !o)}
        onSelect={selectOnly}
        onToggleCompare={toggleCompare}
      />

      <div className={`mss-stage ${showInfo ? 'mss-stage--with-info' : ''}`}>
        <div className="mss-stage__main">{stageBody()}</div>
        {showInfo && primaryEntry && (
          <DetailsPanel
            entry={primaryEntry}
            pages={itemById.get(primaryEntry.id)?.pages.length ?? 0}
            sectionText={sectionText}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Compare dialog (opened from reading pages, Raḍī's introduction and the conclusions)
// ============================================================================

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

interface ManuscriptComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Post | RadisContent | EditionTextSource;
  contentType: 'orations' | 'letters' | 'sayings' | 'radis' | 'conclusion';
}

export function ManuscriptComparisonModal({ isOpen, onClose, content, contentType }: ManuscriptComparisonModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const source = content as EditionTextSource;
  const section = contentType === 'radis' && source.number
    ? `0.${source.number}`
    : (source.sermonNumber || '').trim();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !section) return null;

  const sectionTitle = contentType === 'conclusion' && source.number
    ? `Conclusion ${source.number}`
    : contentType === 'radis' && source.number
      ? `Introduction ${source.number}`
      : undefined;
  const label = sectionTitle ?? sectionLabel(section);
  const heading = source.heading && source.heading !== sectionTitle ? `${label} · ${source.heading}` : label;

  return createPortal(
    <div className="mss-modal" role="dialog" aria-modal="true" aria-label={`Manuscripts for ${label}`}>
      <div className="mss-modal__backdrop" onClick={onClose} />
      <div className="mss-modal__panel">
        <ManuscriptStudio
          variant="modal"
          section={section}
          sectionTitle={sectionTitle}
          modes={['edition', 'compare']}
          initialMode="edition"
          textSource={source}
          title={heading}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
}


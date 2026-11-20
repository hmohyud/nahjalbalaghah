'use client';
import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
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
  isSeparatelyNumbered,
  SECTION_TYPE_PREFIX,
  type ManuscriptCatalogEntry,
  type ManuscriptPageImage,
  type ManuscriptSectionType,
  type SectionIndexEntry,
  type SectionManuscript,
} from '@/api/manuscripts';
import { postsApi, radisApi, type Post } from '@/api/posts';
import { formatTextWithFootnotes } from '@/app/utils/text-formatting';
import { getPreference, getPostEditionTitles } from '@/app/utils/preferences';

// ============================================================================
// Labels and small helpers
// ============================================================================

export type StudyMode = 'single' | 'edition' | 'compare';
export type CompareView = 'pages' | 'details';

const MODE_META: Record<StudyMode, { label: string; icon: React.ElementType }> = {
  single: { label: 'Single', icon: ImageIcon },
  edition: { label: 'Manuscript + text', icon: BookOpenText },
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

const MAX_COMPARE = 4;
const DEFAULT_EDITION = 'Qutbuddin';
/** Raḍī's introduction has one text, not one per edition */
const INTRO_TEXT = 'Introduction';

// Columns are identified by slot keys: "ms:<library documentId>" or "ed:<edition title>"
const msKey = (id: string) => `ms:${id}`;
const edKey = (edition: string) => `ed:${edition}`;
const keyKind = (key: string): 'ms' | 'ed' | null => (key.startsWith('ms:') ? 'ms' : key.startsWith('ed:') ? 'ed' : null);
const keyId = (key: string) => key.slice(3);
const editionLabel = (edition: string) => (edition === INTRO_TEXT ? 'Introduction text' : `${edition} edition`);

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
  /** Which edition(s) a post belongs to */
  editions?: { title?: string }[] | { title?: string } | null;
}

type TextBlock ={ key: string; number?: string; arabic?: string; english?: string };
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

type SectionTexts = Map<string, EditionTextSource | EditionTextSource[]>;

/**
 * Every aligned edition's text for a section, keyed by edition title, in one request.
 * Editions numbered independently of Qutbuddin (ʿAṭṭār) are left out: their "Oration 12" is not
 * necessarily the manuscripts' Oration 12. Raḍī's introduction has a single text.
 */
async function fetchSectionTexts(section: string): Promise<SectionTexts> {
  const texts: SectionTexts = new Map();
  const type = sectionTypeOf(section);
  if (type === 'introduction') {
    const response = await radisApi.getRadisIntroductions(1, 100);
    // The collection holds the introduction three times (the 0.x paragraphs, a 00.xx copy and
    // the whole Arabic text as 000.01); keep the 0.x paragraphs
    const paragraphs = (response.data || []).filter(item => (item.number || '').split('.')[0] === '0');
    texts.set(INTRO_TEXT, paragraphs as EditionTextSource[]);
    return texts;
  }
  const postType = type === 'oration' ? 'Oration' : type === 'letter' ? 'Letter' : 'Saying';
  const number = section.split('.')[1];
  // One request for every post numbered ".N", so texts filed under another prefix are found too
  const response = await postsApi.getPosts({ pageSize: 25, filters: { sermonNumberEndsWith: `.${number}`, type: postType } });
  const posts = (response.data || []).filter(post => !post.type || post.type === postType);
  const add = (post: Post) => {
    for (const edition of getPostEditionTitles(post)) {
      if (isSeparatelyNumbered(edition) || texts.has(edition)) continue;
      texts.set(edition, post as EditionTextSource);
    }
  };
  // Exact numbers first; then numbers under a prefix other than 0-3 (e.g. "4.1")
  posts.filter(post => (post.sermonNumber || '').trim() === section).forEach(add);
  posts
    .filter(post => {
      const [prefix, n] = (post.sermonNumber || '').trim().split('.');
      return n === number && !['0', '1', '2', '3'].includes(prefix);
    })
    .forEach(add);
  return texts;
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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const imageSize = imageSizeForSrc?.src === src ? imageSizeForSrc : null;
  const totalScale = baseScale * scale;

  // Latest view, for effects that must not re-run when it changes
  const viewRef = useRef({ baseScale, scale, translate });
  viewRef.current = { baseScale, scale, translate };
  const fittedRef = useRef<{ image: { w: number; h: number }; container: { w: number; h: number } } | null>(null);

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

  // A layout effect, so the fitted size is applied before the browser first paints the image
  useLayoutEffect(() => {
    if (!imageSize) return;
    const fit = Math.min(containerSize.w / imageSize.w, containerSize.h / imageSize.h);
    const nextBase = isFinite(fit) && fit > 0 ? clamp(fit, 0.01, 5) : 1;
    const previous = fittedRef.current;
    fittedRef.current = { image: imageSize, container: containerSize };
    const view = viewRef.current;

    // The pane was resized (picker hidden, details panel, full screen) while zoomed in:
    // keep the zoom and the point at the centre of the pane
    if (previous && previous.image === imageSize && view.scale > 1) {
      const total = view.baseScale * view.scale;
      const contentX = (previous.container.w / 2 - view.translate.x) / total;
      const contentY = (previous.container.h / 2 - view.translate.y) / total;
      setBaseScale(nextBase);
      setTranslate({
        x: containerSize.w / 2 - contentX * nextBase * view.scale,
        y: containerSize.h / 2 - contentY * nextBase * view.scale,
      });
      return;
    }

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
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const [a, b] = Array.from(pointersRef.current.values());
      // Translate is relative to the pane, so measure the pinch centre from the pane too
      const cx = (a.x + b.x) / 2 - rect.left;
      const cy = (a.y + b.y) / 2 - rect.top;
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
      {failed && (
        <div className="mss-zoom__failed" role="alert" onPointerDown={e => e.stopPropagation()}>
          <p className="mss-empty__title">This page couldn’t be loaded</p>
          <button
            type="button"
            className="mss-text-btn"
            onClick={() => {
              setFailed(false);
              onLoadingChange?.(true);
              setAttempt(a => a + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
      <div
        className="mss-zoom__layer"
        style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${totalScale})`, transformOrigin: '0 0' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={attempt}
          ref={imgRef}
          src={hiResReady && hiResSrc ? hiResSrc : src}
          alt={alt}
          className="mss-zoom__img"
          // Hidden until measured, so a half-loaded image never paints unscaled in the corner
          style={imageSize ? { width: imageSize.w, height: imageSize.h } : { visibility: 'hidden' }}
          draggable={false}
          onLoad={(e) => {
            if (imageSize) return; // the original scan replacing the display rendition
            const img = e.currentTarget;
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            setImageSizeForSrc({ src, w, h });
          }}
          onError={() => {
            // A failed swap to the original scan keeps the page already shown
            if (!imageSize) setFailed(true);
            onLoadingChange?.(false);
          }}
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
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Set when the keyboard carried the reader into the next section, so focus follows
  const refocusRef = useRef(false);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const hintId = React.useId();

  const count = pages?.length ?? 0;
  const index = clamp(page, 0, Math.max(0, count - 1));
  const current = pages?.[index];
  const isFirst = index <= 0;
  const isLast = index >= count - 1;
  const prevLabel = isFirst ? continuation?.prev : undefined;
  const nextLabel = isLast ? continuation?.next : undefined;

  const footerRef = useRef<HTMLElement | null>(null);
  const emptyRef = useRef<HTMLDivElement | null>(null);

  // Remember whether focus was in this pane, so it can follow the reader into the next section
  const continueFrom = (direction: 1 | -1) => {
    refocusRef.current = [stageRef, footerRef, emptyRef].some(r => !!r.current?.contains(document.activeElement));
    onContinue?.(direction);
  };
  const goPrev = () => (isFirst ? prevLabel && continueFrom(-1) : onPageChange(index - 1));
  const goNext = () => (isLast ? nextLabel && continueFrom(1) : onPageChange(index + 1));

  useEffect(() => {
    if (!refocusRef.current || pages === null) return;
    refocusRef.current = false;
    if (current) stageRef.current?.focus({ preventScroll: true });
    else emptyRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, [current, pages]);

  // Keep the active thumbnail in view without scrolling the page
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[data-active="true"]');
    if (!strip || !active) return;
    strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: 'smooth' });
  }, [index, count]);

  const onStageKeyDown = (e: React.KeyboardEvent) => {
    // Leave browser shortcuts (Ctrl/Cmd + zoom, Alt + arrows for history) alone
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
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
        <div className="mss-pane__stage mss-pane__stage--empty" ref={emptyRef}>
          <div className="mss-empty">
            <p className="mss-empty__title">No pages for {sectionText}</p>
            <p className="mss-empty__text">This manuscript has no digitized pages for this section. Choose another manuscript above{continuation?.next ? ' or continue to the next section' : ''}.</p>
            {continuation?.next && onContinue && (
              <button type="button" className="mss-text-btn" onClick={() => continueFrom(1)}>
                {continuation.next} <ChevronRight />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            ref={stageRef}
            className="mss-pane__stage"
            tabIndex={0}
            role="application"
            aria-roledescription="page viewer"
            aria-label={`${entry.name}, page ${index + 1} of ${count}`}
            aria-describedby={hintId}
            onKeyDown={onStageKeyDown}
          >
            <span id={hintId} className="sr-only">
              Use the left and right arrow keys to turn pages, plus and minus to zoom, and 0 to fit the page.
            </span>
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

          <footer className="mss-pane__footer" ref={footerRef}>
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
  edition: string;
  label: string;
  text: EditionText | null;
  loading: boolean;
  /** The request failed (as opposed to the edition having no text for the section) */
  error?: boolean;
  onRetry?: () => void;
  sectionText: string;
  order?: number;
  expanded?: boolean;
  onToggleExpand?: () => void;
}> = ({ edition, label, text, loading, error, onRetry, sectionText, order, expanded, onToggleExpand }) => {
  const [display, setDisplay] = useState<TextDisplay>('both');

  return (
    <section className="mss-pane mss-pane--text" aria-label={label}>
      <header className="mss-pane__header">
        {order !== undefined && <span className="mss-pane__order">{order}</span>}
        <div className="mss-pane__titles">
          <h3 className="mss-pane__title" title={label}>{label}</h3>
          <p className="mss-pane__meta">Edited text · {sectionText}</p>
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
        ) : error ? (
          <div className="mss-empty">
            <p className="mss-empty__title">The text couldn’t be loaded</p>
            <p className="mss-empty__text">Check your connection and try again.</p>
            {onRetry && <button type="button" className="mss-text-btn" onClick={onRetry}>Try again</button>}
          </div>
        ) : !text || text.blocks.length === 0 ? (
          <div className="mss-empty">
            <p className="mss-empty__title">No text for {sectionText}</p>
            <p className="mss-empty__text">
              {edition === INTRO_TEXT ? `The ${label.toLowerCase()} isn’t available.` : `The ${edition} edition has no text for this section yet.`}
            </p>
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
  columns: { entry: ManuscriptCatalogEntry; item: SectionManuscript | undefined; order: number }[];
  sectionText: string;
  note?: string;
}> = ({ columns, sectionText, note }) => {
  const rows = DETAIL_FIELDS.filter(field => columns.some(col => field.value(col.entry)));
  const withoutDetails = columns.filter(col => !hasCatalogueDetails(col.entry)).map(col => col.entry.name);

  return (
    <div className="mss-compare-details">
      <div className="mss-compare-details__scroll">
        <table className="mss-table" style={{ '--mss-table-cols': columns.length } as React.CSSProperties}>
          <thead>
            <tr>
              <th scope="col" className="mss-table__corner"><span className="sr-only">Field</span></th>
              {columns.map(({ entry, item, order }) => (
                <th scope="col" key={entry.id}>
                  <div className="mss-table__colhead">
                    <span className="mss-table__thumb">
                      {item?.pages[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.pages[0].thumb} alt="" />
                      ) : null}
                    </span>
                    <span className="mss-table__colname">
                      <span className="mss-pane__order">{order}</span>
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
      {(withoutDetails.length > 0 || note) && (
        <p className="mss-compare-details__note">
          {withoutDetails.length > 0 && `Catalogue details haven’t been added yet for ${withoutDetails.join(', ')}. `}
          {note}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// Picker: manuscripts (first page of the section) and edition texts
// ============================================================================

type PickerCard = {
  key: string;
  kind: 'ms' | 'ed';
  title: string;
  meta: string;
  thumb?: string;
  /** A manuscript on screen that has no pages for this section */
  missing?: boolean;
  /** Why this card can't be shown here (an edition with no text for the section, or numbered differently) */
  unavailable?: string;
};

const ManuscriptPicker: React.FC<{
  manuscripts: PickerCard[];
  editions: PickerCard[];
  manuscriptCount: number;
  mode: StudyMode;
  /** False in the dialog, which has no Single mode */
  canSingle: boolean;
  /** Columns currently on screen */
  shownKeys: string[];
  /** Column order in Compare */
  compareKeys: string[];
  sectionText: string;
  loading: boolean;
  open: boolean;
  notice: string | null;
  onToggleOpen: () => void;
  /** Plain click: show just this manuscript, or this text beside the manuscript */
  onShow: (key: string) => void;
  /** The small +/− button: add to (or remove from) the side-by-side comparison */
  onToggleCompare: (key: string) => void;
}> = ({
  manuscripts, editions, manuscriptCount, mode, canSingle, shownKeys, compareKeys, sectionText,
  loading, open, notice, onToggleOpen, onShow, onToggleCompare,
}) => {
  const hint = mode === 'compare'
    ? `+ to add (up to ${MAX_COMPARE}), − to remove · select one to ${canSingle ? 'view it alone' : 'read it beside the text'}`
    : mode === 'edition'
      ? 'Select a manuscript and a text to read side by side · + to compare'
      : 'Select one to view it · + to compare';

  const renderCard = (card: PickerCard) => {
    const isShown = shownKeys.includes(card.key);
    const order = mode === 'compare' ? compareKeys.indexOf(card.key) + 1 : 0;
    const inCompare = order > 0;
    // Outside Compare, whatever is already on screen has nothing to be compared with yet
    const showCompareButton = (inCompare || !card.unavailable) && (mode === 'compare' || !isShown);

    return (
      <div
        key={card.key}
        className={[
          'mss-card',
          card.kind === 'ed' ? 'mss-card--edition' : '',
          isShown ? 'mss-card--selected' : '',
          card.missing ? 'mss-card--missing' : '',
          card.unavailable && !isShown ? 'mss-card--unavailable' : '',
        ].filter(Boolean).join(' ')}
      >
        <button
          type="button"
          className="mss-card__main"
          onClick={() => onShow(card.key)}
          aria-pressed={isShown}
          title={card.unavailable ?? (card.missing ? `${card.title} has no pages for ${sectionText}` : `View ${card.title}`)}
        >
          <span className="mss-card__thumb">
            {card.kind === 'ed' ? (
              <span className="mss-card__text-art" aria-hidden="true">
                <b>¶</b><i /><i /><i /><i /><i />
              </span>
            ) : card.thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.thumb} alt="" loading="lazy" />
            ) : (
              <span className="mss-card__none">No pages</span>
            )}
          </span>
          <span className="mss-card__name">{card.title}</span>
          <span className="mss-card__meta">{card.meta}</span>
        </button>
        {isShown && (
          <span className="mss-card__badge" aria-hidden="true">
            {inCompare ? order : <Check />}
          </span>
        )}
        {showCompareButton && (
          <button
            type="button"
            className={`mss-card__compare ${inCompare ? 'mss-card__compare--remove' : ''}`}
            onClick={() => onToggleCompare(card.key)}
            title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
          >
            {inCompare ? <Minus /> : <Plus />}
            <span className="sr-only">{inCompare ? `Remove ${card.title} from comparison` : `Compare ${card.title}`}</span>
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
              <strong>{manuscriptCount} manuscript{manuscriptCount === 1 ? '' : 's'}</strong> contain {sectionText}
              <span className="mss-picker__hint"> · {hint}</span>
            </>
          )}
        </p>
        {notice && <p className="mss-picker__notice" role="status">{notice}</p>}
        <button type="button" className="mss-text-btn" onClick={onToggleOpen} aria-expanded={open}>
          {open ? 'Hide' : 'Show'} {open ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {open && (
        <div className="mss-picker__row">
          <div className="mss-picker__group" role="group" aria-label="Manuscripts">
            <p className="mss-picker__group-label">Manuscripts</p>
            <div className="mss-picker__cards">
              {loading
                ? Array.from({ length: 6 }, (_, i) => <span key={i} className="mss-card mss-card--skeleton" />)
                : manuscripts.map(renderCard)}
            </div>
          </div>
          {editions.length > 0 && (
            <div className="mss-picker__group mss-picker__group--editions" role="group" aria-label="Edition texts">
              <p className="mss-picker__group-label">Edition texts</p>
              <div className="mss-picker__cards">{editions.map(renderCard)}</div>
            </div>
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
  const [failed, setFailed] = useState<Partial<Record<ManuscriptSectionType, boolean>>>({});
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setBrowseType(sectionTypeOf(section));
      setQuery('');
    }
  }, [open, section]);

  // Typing goes straight to the search box, including after switching type
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, browseType]);

  useEffect(() => {
    if (!open || lists[browseType] || failed[browseType]) return;
    let cancelled = false;
    sectionIndexApi.getSections(browseType)
      .then(entries => { if (!cancelled) setLists(prev => ({ ...prev, [browseType]: entries })); })
      .catch(err => {
        console.error('Error loading the section list:', err);
        if (!cancelled) setFailed(prev => ({ ...prev, [browseType]: true }));
      });
    return () => { cancelled = true; };
  }, [open, browseType, lists, failed]);

  // Close and hand focus back to the button (not when the reader clicked somewhere else)
  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const entries = lists[browseType];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!entries) return [];
    if (!q) return entries;
    return entries.filter(e => e.number === q || e.number.startsWith(q) || e.heading.toLowerCase().includes(q));
  }, [entries, query]);

  const choose = (next: string) => {
    close(true);
    if (next !== section) onChange(next);
  };

  return (
    <div className="mss-section-picker" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="mss-section-picker__button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`${sectionLabel(section)}${heading && heading !== sectionLabel(section) ? `, ${heading}` : ''}. Choose another section`}
      >
        <span className="mss-section-picker__label">{sectionLabel(section)}</span>
        {heading && heading !== sectionLabel(section) && <span className="mss-section-picker__heading">{heading}</span>}
        <ChevronDown className="mss-section-picker__chevron" />
      </button>

      {open && (
        <div className="mss-section-picker__panel">
          <div className="mss-section-picker__types" role="group" aria-label="Section type">
            {SECTION_TYPES.map(type => (
              <button
                type="button"
                key={type}
                aria-pressed={browseType === type}
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
                aria-label={`Find ${/^[aeiou]/i.test(TYPE_LABELS[browseType].singular) ? 'an' : 'a'} ${TYPE_LABELS[browseType].singular.toLowerCase()} by number or title`}
              />
            </label>
          )}
          <ul className="mss-section-picker__list" aria-label={TYPE_LABELS[browseType].plural}>
            {failed[browseType] ? (
              <li className="mss-section-picker__status">
                <span>The list couldn’t be loaded.</span>
                <button
                  type="button"
                  className="mss-text-btn"
                  onClick={() => setFailed(prev => ({ ...prev, [browseType]: false }))}
                >
                  Try again
                </button>
              </li>
            ) : !entries ? (
              <li className="mss-section-picker__status"><Loader2 className="mss-spin" /></li>
            ) : filtered.length === 0 ? (
              <li className="mss-section-picker__status">No matches</li>
            ) : (
              filtered.map(entry => (
                <li key={entry.section}>
                  <button
                    type="button"
                    aria-current={entry.section === section ? 'true' : undefined}
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
  /** Manuscript shown in Single and Manuscript + text */
  manuscript: string | null;
  /** Edition shown in Manuscript + text */
  edition: string;
  /** Compare columns, as slot keys ("ms:<id>", "ed:<edition>") */
  compare: string[];
  compareView: CompareView;
}

interface ManuscriptStudioProps {
  variant: 'page' | 'modal';
  section: string;
  /** Provided on the viewer page: enables the section picker and paging across sections */
  onSectionChange?: (section: string) => void;
  /** Overrides the label derived from the section number (e.g. "Conclusion 2") */
  sectionTitle?: string;
  /** Name of the single text of a 0.x section ("Introduction text", "Conclusion text") */
  introTextLabel?: string;
  modes?: StudyMode[];
  initialMode?: StudyMode;
  initialManuscript?: string;
  initialEdition?: string;
  initialCompare?: string[];
  /** Shown first when present in the section (older ?library= links) */
  preferredManuscript?: string;
  initialCompareView?: CompareView;
  onStateChange?: (state: StudioState) => void;
  /** Text supplied by the caller. Used for 0.x sections (introduction paragraphs, conclusions). */
  textSource?: EditionTextSource | null;
  title?: string;
  onClose?: () => void;
}

type Column =
  | { key: string; kind: 'ms'; entry: ManuscriptCatalogEntry }
  | { key: string; kind: 'ed'; edition: string };

const uniqueKeys = (keys: string[]) => keys.filter((key, i) => keys.indexOf(key) === i);

/** The edition a reader starts on: the requested one, else their saved preference, else Qutbuddin. */
function startingEdition(requested?: string) {
  const preferred = requested || getPreference('edition') || DEFAULT_EDITION;
  return isSeparatelyNumbered(preferred) ? DEFAULT_EDITION : preferred;
}

export function ManuscriptStudio({
  variant,
  section,
  onSectionChange,
  sectionTitle,
  introTextLabel = 'Introduction text',
  modes = ['single', 'edition', 'compare'],
  initialMode = 'single',
  initialManuscript,
  initialEdition,
  initialCompare,
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
  const [editions, setEditions] = useState<string[] | null>(null);
  const [editionsFailed, setEditionsFailed] = useState(false);
  const [sectionTexts, setSectionTexts] = useState<{ section: string; status: 'loading' | 'ready' | 'error'; texts: SectionTexts } | null>(null);
  const [textRetry, setTextRetry] = useState(0);

  const [mode, setMode] = useState<StudyMode>(modes.includes(initialMode) ? initialMode : modes[0]);
  const [viewMs, setViewMs] = useState<string | null>(initialManuscript ?? null);
  const [viewEd, setViewEd] = useState<string>(() => startingEdition(initialEdition));
  const [compareKeys, setCompareKeys] = useState<string[]>(
    () => uniqueKeys((initialCompare || []).filter(key => keyKind(key) && keyId(key))).slice(0, MAX_COMPARE)
  );
  const [compareView, setCompareView] = useState<CompareView>(initialCompareView);
  const [pageBy, setPageBy] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sectionIndex, setSectionIndex] = useState<{ type: ManuscriptSectionType; entries: SectionIndexEntry[]; failed?: boolean } | null>(null);

  const catalogRef = useRef<ManuscriptCatalogEntry[] | null>(null);
  const defaultsApplied = useRef(!!initialManuscript || (initialCompare?.length ?? 0) > 0);
  // Where paging past the end of a section should land, tagged with the section it was meant for
  const continuationRef = useRef<{ section: string; direction: 1 | -1; urls: Record<string, string> } | null>(null);

  const sectionType = sectionTypeOf(section);
  const isIntro = sectionType === 'introduction';
  const sectionText = sectionTitle ?? sectionLabel(section);
  const canNavigate = !!onSectionChange;
  const canSingle = modes.includes('single');
  // Raḍī's introduction (and the conclusions) have one text rather than one per edition
  const resolveEdition = useCallback((edition: string) => (isIntro ? INTRO_TEXT : edition), [isIntro]);
  const shownEdition = resolveEdition(viewEd);
  const textLabelFor = useCallback((edition: string) => (edition === INTRO_TEXT ? introTextLabel : editionLabel(edition)), [introTextLabel]);
  // The dialog on a 0.x section already has the passage's own text (a conclusion is not in the introduction)
  const useProvidedText = !!textSource && isIntro;

  // Show the details panel by default on wide screens (after mount, to match the server render)
  useEffect(() => {
    if (window.matchMedia('(min-width: 1280px)').matches) setInfoOpen(true);
  }, []);

  // ---- Data: the catalogue and the edition list once, then each section's records and texts ----
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

  useEffect(() => {
    if (editions) return;
    let cancelled = false;
    setEditionsFailed(false);
    postsApi.getEditions()
      .then(res => {
        if (cancelled) return;
        const titles = [...(res.data || [])]
          .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
          .map(edition => edition.title)
          .filter(Boolean);
        if (titles.length) setEditions(titles);
        else setEditionsFailed(true);
      })
      .catch(err => {
        console.error('Error loading editions:', err);
        // Keep whatever the URL asked for rather than pruning it against a fallback list
        if (!cancelled) setEditionsFailed(true);
      });
    return () => { cancelled = true; };
  }, [editions, retryKey]);

  useEffect(() => {
    if (useProvidedText) return;
    let cancelled = false;
    setSectionTexts({ section, status: 'loading', texts: new Map() });
    fetchSectionTexts(section)
      .then(texts => { if (!cancelled) setSectionTexts({ section, status: 'ready', texts }); })
      .catch(err => {
        console.error('Error loading the edition texts:', err);
        if (!cancelled) setSectionTexts({ section, status: 'error', texts: new Map() });
      });
    return () => { cancelled = true; };
  }, [section, useProvidedText, textRetry]);

  const ready = sectionData?.section === section;
  const items = useMemo(() => (ready ? sectionData!.items : []), [ready, sectionData]);
  const itemById = useMemo(() => new Map(items.map(item => [item.entry.id, item])), [items]);
  const catalogById = useMemo(() => new Map((catalog || []).map(entry => [entry.id, entry])), [catalog]);

  useEffect(() => {
    setNotice(null);
  }, [section]);

  // ---- Defaults, and where each manuscript opens in a new section ----
  useEffect(() => {
    if (!ready) return;
    const ids = items.map(item => item.entry.id);
    const first = preferredManuscript && ids.includes(preferredManuscript) ? preferredManuscript : ids[0];

    if (!defaultsApplied.current) {
      defaultsApplied.current = true;
      if (first) setViewMs(first);
      if (mode === 'compare' && compareKeys.length === 0) {
        setCompareKeys([first, ...ids.filter(id => id !== first)].filter(Boolean).slice(0, 2).map(msKey));
      }
    } else if (!viewMs || !catalogById.has(viewMs)) {
      // A link that only listed Compare columns, or named a manuscript that doesn't exist
      const fromCompare = compareKeys.find(key => keyKind(key) === 'ms' && catalogById.has(keyId(key)));
      const next = fromCompare ? keyId(fromCompare) : first;
      if (next) setViewMs(next);
    }

    // Paging past the end of a section continues on the next new page of the same manuscript.
    // An instruction meant for another section (the reader moved on before it loaded) is dropped.
    const pending = continuationRef.current;
    continuationRef.current = null;
    const plan = pending && pending.section === section ? pending : null;
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

  // Drop Compare columns for manuscripts that don't exist (mistyped or stale links)
  useEffect(() => {
    if (!catalog) return;
    setCompareKeys(prev => {
      const valid = prev.filter(key => keyKind(key) !== 'ms' || catalogById.has(keyId(key)));
      return valid.length === prev.length ? prev : valid;
    });
  }, [catalog, catalogById]);

  // Editions: fall back from retired or separately numbered ones
  useEffect(() => {
    if (!editions) return;
    const aligned = editions.filter(edition => !isSeparatelyNumbered(edition));
    if (!aligned.includes(viewEd)) setViewEd(aligned.includes(DEFAULT_EDITION) ? DEFAULT_EDITION : aligned[0] || DEFAULT_EDITION);
    setCompareKeys(prev => {
      const valid = prev.filter(key => keyKind(key) !== 'ed' || keyId(key) === INTRO_TEXT || aligned.includes(keyId(key)));
      return valid.length === prev.length ? prev : valid;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editions]);

  // The single introduction text is never stored as such: outside the introduction it becomes the reader's edition
  useEffect(() => {
    if (isIntro) return;
    setCompareKeys(prev =>
      prev.includes(edKey(INTRO_TEXT)) ? uniqueKeys(prev.map(key => (key === edKey(INTRO_TEXT) ? edKey(viewEd) : key))) : prev
    );
  }, [isIntro, viewEd]);

  // ---- Section index: headings and neighbours for prev/next ----
  useEffect(() => {
    if (!canNavigate || (sectionIndex?.type === sectionType && !sectionIndex.failed)) return;
    let cancelled = false;
    sectionIndexApi.getSections(sectionType)
      .then(entries => { if (!cancelled) setSectionIndex({ type: sectionType, entries }); })
      .catch(() => { if (!cancelled) setSectionIndex({ type: sectionType, entries: [], failed: true }); });
    return () => { cancelled = true; };
    // Re-tried on the next section change after a failure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canNavigate, sectionType, section]);

  const neighbours = useMemo(() => {
    if (!sectionIndex || sectionIndex.type !== sectionType) return { prev: null, next: null, current: null };
    const entries = sectionIndex.entries;
    const at = entries.findIndex(e => e.section === section);
    let prev: SectionIndexEntry | null = at >= 0
      ? entries[at - 1] ?? null
      : [...entries].reverse().find(e => compareSections(e.section, section) < 0) ?? null;
    let next: SectionIndexEntry | null = at >= 0
      ? entries[at + 1] ?? null
      : entries.find(e => compareSections(e.section, section) > 0) ?? null;

    // Past the end of a type, reading continues into the next part of the book
    const typeAt = SECTION_TYPES.indexOf(sectionType);
    const nextType = SECTION_TYPES[typeAt + 1];
    if (!next && nextType && entries.length) {
      next = { section: `${SECTION_TYPE_PREFIX[nextType]}.1`, number: '1', heading: '' };
    }
    if (!prev && sectionType === 'oration' && entries.length) {
      prev = { section: '0.1', number: '1', heading: 'Raḍī’s Introduction' };
    }
    return { prev, next, current: at >= 0 ? entries[at] : null };
  }, [sectionIndex, section, sectionType]);

  // ---- Edition texts ----
  const providedText = useMemo(() => (useProvidedText ? normalizeEditionText(textSource) : null), [useProvidedText, textSource]);
  const textsReady = !useProvidedText && sectionTexts?.section === section && sectionTexts.status === 'ready';
  const normalizedTexts = useMemo(() => {
    const result = new Map<string, EditionText | null>();
    if (sectionTexts) for (const [edition, source] of sectionTexts.texts) result.set(edition, normalizeEditionText(source));
    return result;
  }, [sectionTexts]);

  const textFor = (edition: string) => {
    if (useProvidedText) return { loading: false, error: false, text: providedText };
    if (!sectionTexts || sectionTexts.section !== section || sectionTexts.status === 'loading') return { loading: true, error: false, text: null };
    if (sectionTexts.status === 'error') return { loading: false, error: true, text: null };
    return { loading: false, error: false, text: normalizedTexts.get(edition) ?? null };
  };

  const editionList = editions
    ?? (editionsFailed
      ? uniqueKeys([DEFAULT_EDITION, viewEd, ...compareKeys.filter(key => keyKind(key) === 'ed').map(keyId)].filter(edition => edition !== INTRO_TEXT))
      : []);

  const editionCards: PickerCard[] = isIntro
    ? [{ key: edKey(INTRO_TEXT), kind: 'ed', title: introTextLabel, meta: 'Raḍī’s text' }]
    : editionList.map(edition => {
        const separate = isSeparatelyNumbered(edition);
        const noText = textsReady && !separate && !normalizedTexts.has(edition);
        return {
          key: edKey(edition),
          kind: 'ed' as const,
          title: edition,
          meta: separate ? 'Own numbering' : noText ? 'No text here yet' : 'Edited text',
          unavailable: separate
            ? `${edition} numbers the text differently, so its passages can’t be lined up with these manuscripts yet.`
            : noText
              ? `The ${edition} edition has no text for ${sectionText} yet.`
              : undefined,
        };
      });
  const unavailableReason = (key: string) => editionCards.find(card => card.key === key)?.unavailable;

  // ---- Columns on screen ----
  const columnKeys: string[] = useMemo(() => {
    if (mode === 'compare') return compareKeys.slice(0, MAX_COMPARE);
    const keys = viewMs ? [msKey(viewMs)] : [];
    if (mode === 'edition') keys.push(edKey(shownEdition));
    return keys;
  }, [mode, compareKeys, viewMs, shownEdition]);

  const columns: Column[] = useMemo(() => {
    const result: Column[] = [];
    const seen = new Set<string>();
    for (const key of columnKeys) {
      if (keyKind(key) === 'ms') {
        const entry = catalogById.get(keyId(key));
        if (entry && !seen.has(key)) {
          seen.add(key);
          result.push({ key, kind: 'ms', entry });
        }
      } else if (keyKind(key) === 'ed') {
        const edition = resolveEdition(keyId(key));
        const resolvedKey = edKey(edition);
        if (!seen.has(resolvedKey)) {
          seen.add(resolvedKey);
          result.push({ key: resolvedKey, kind: 'ed', edition });
        }
      }
    }
    return result;
  }, [columnKeys, catalogById, resolveEdition]);

  // ---- Report state (the page keeps it in the URL) ----
  useEffect(() => {
    onStateChange?.({ mode, manuscript: viewMs, edition: viewEd, compare: compareKeys, compareView });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, viewMs, viewEd, compareKeys, compareView]);

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
  // The single introduction text is stored as the reader's edition, so it never strands a column elsewhere
  const storable = (key: string) => (key === edKey(INTRO_TEXT) ? edKey(viewEd) : key);
  const slotOf = (key: string) => (keyKind(key) === 'ed' ? edKey(resolveEdition(keyId(key))) : key);

  const changeMode = (next: StudyMode) => {
    if (next === mode) return;
    setNotice(null);
    setExpanded(null);
    if (next === 'compare') {
      // Return to the previous comparison, or start one from what's on screen
      let keys = uniqueKeys((compareKeys.length ? compareKeys : columnKeys).map(storable)).slice(0, MAX_COMPARE);
      if (keys.length < 2) {
        const extra = items.map(item => msKey(item.entry.id)).filter(key => !keys.includes(key));
        keys = [...keys, ...extra].slice(0, 2);
      }
      setCompareKeys(keys);
    }
    setMode(next);
  };

  // Plain click on a card. A manuscript: view it on its own (leaving Compare). An edition:
  // read it beside the manuscript.
  const show = (key: string) => {
    setNotice(null);
    setExpanded(null);
    if (keyKind(key) === 'ms') {
      setViewMs(keyId(key));
      // The dialog has no Single mode: show the manuscript beside the text instead
      if (mode === 'compare') setMode(canSingle ? 'single' : 'edition');
      setMobileTab(null);
      return;
    }
    const reason = unavailableReason(key);
    if (reason) {
      setNotice(reason);
      return;
    }
    const edition = keyId(key);
    if (edition !== INTRO_TEXT) setViewEd(edition);
    if (mode !== 'edition') setMode('edition');
    setMobileTab(edKey(resolveEdition(edition)));
  };

  // The + / − on a card: build up a side-by-side comparison of manuscripts and texts
  const toggleCompare = (rawKey: string) => {
    setNotice(null);
    const key = storable(rawKey);
    // Only adding an unavailable text is blocked; one already compared can always be removed
    const alreadyCompared = mode === 'compare' && compareKeys.slice(0, MAX_COMPARE).some(k => slotOf(k) === slotOf(key));
    const reason = alreadyCompared ? undefined : unavailableReason(rawKey);
    if (reason) {
      setNotice(reason);
      return;
    }
    if (mode !== 'compare') {
      const base = uniqueKeys(columnKeys.map(storable)).filter(k => slotOf(k) !== slotOf(key));
      setCompareKeys([...base, key].slice(0, MAX_COMPARE));
      setMode('compare');
      setExpanded(null);
      setMobileTab(slotOf(key));
      return;
    }
    // On Raḍī's introduction every edition stands for the same text, so compare resolved slots
    const active = compareKeys.slice(0, MAX_COMPARE);
    const distinct = active.filter((k, i) => active.findIndex(other => slotOf(other) === slotOf(k)) === i);
    if (distinct.some(k => slotOf(k) === slotOf(key))) {
      setCompareKeys(distinct.filter(k => slotOf(k) !== slotOf(key)));
      if (expanded === slotOf(key)) setExpanded(null);
    } else if (distinct.length >= MAX_COMPARE) {
      setNotice(`You can compare up to ${MAX_COMPARE} at once. Remove one first.`);
    } else {
      setCompareKeys([...distinct, key]);
      setExpanded(null);
      setMobileTab(slotOf(key));
    }
  };

  const continueTo = (direction: 1 | -1) => {
    const target = direction === 1 ? neighbours.next : neighbours.prev;
    if (!target || !onSectionChange) return;
    const urls: Record<string, string> = {};
    for (const column of columns) {
      if (column.kind !== 'ms') continue;
      const item = itemById.get(column.entry.id);
      const pageImage = item?.pages[pageBy[column.entry.id] ?? 0];
      if (pageImage) urls[column.entry.id] = pageImage.full;
    }
    continuationRef.current = { section: target.section, direction, urls };
    onSectionChange(target.section);
  };

  const continuation = canNavigate
    ? { prev: neighbours.prev ? sectionLabel(neighbours.prev.section) : undefined, next: neighbours.next ? sectionLabel(neighbours.next.section) : undefined }
    : undefined;

  // ---- Picker cards ----
  const msColumnIds = columns.filter(c => c.kind === 'ms').map(c => (c as { entry: ManuscriptCatalogEntry }).entry.id);
  const missingEntries = msColumnIds
    .filter(id => ready && !itemById.has(id))
    .map(id => catalogById.get(id))
    .filter((entry): entry is ManuscriptCatalogEntry => !!entry);

  const manuscriptCards: PickerCard[] = [
    ...items.map(item => ({
      key: msKey(item.entry.id),
      kind: 'ms' as const,
      title: item.entry.name,
      meta: [shortDate(item.entry), pageCountLabel(item.pages.length)].filter(Boolean).join(' · '),
      thumb: item.pages[0]?.thumb,
    })),
    ...missingEntries.map(entry => ({
      key: msKey(entry.id),
      kind: 'ms' as const,
      title: entry.name,
      meta: 'Not in this section',
      missing: true,
    })),
  ];

  // ---- Rendering ----
  const expandedKey = expanded && columns.some(c => c.key === expanded) ? expanded : null;
  // Below 1024px only the active column shows, so it must be the enlarged one when there is one
  const activeTab = expandedKey ?? (mobileTab && columns.some(c => c.key === mobileTab) ? mobileTab : columns[0]?.key);
  const primaryEntry = viewMs ? catalogById.get(viewMs) : undefined;
  const showInfo = mode === 'single' && infoOpen && !!primaryEntry;
  const showDetailsTable = mode === 'compare' && compareView === 'details';
  const columnLabel = (column: Column) => (column.kind === 'ed' ? textLabelFor(column.edition) : column.entry.name);

  const renderColumn = (column: Column, index: number) => {
    const order = mode === 'compare' ? index + 1 : undefined;
    const toggleExpand = columns.length > 1 ? () => setExpanded(expandedKey === column.key ? null : column.key) : undefined;
    if (column.kind === 'ed') {
      const { loading, error, text } = textFor(column.edition);
      return (
        <EditionTextPane
          edition={column.edition}
          label={textLabelFor(column.edition)}
          text={text}
          loading={loading}
          error={error}
          onRetry={() => setTextRetry(k => k + 1)}
          sectionText={sectionText}
          order={order}
          expanded={expandedKey === column.key}
          onToggleExpand={toggleExpand}
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
        order={order}
        expanded={expandedKey === column.key}
        onToggleExpand={toggleExpand}
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
    if (ready && items.length === 0 && mode === 'single') {
      return (
        <div className="mss-empty mss-empty--panel">
          <p className="mss-empty__title">No manuscript pages for {sectionText} yet</p>
          <p className="mss-empty__text">
            Pages for this section haven’t been added. You can still read its text with Manuscript + text{continuation?.next ? ', or try the next section' : ''}.
          </p>
          {continuation?.next && (
            <button type="button" className="mss-text-btn" onClick={() => continueTo(1)}>{continuation.next} <ChevronRight /></button>
          )}
        </div>
      );
    }
    if (showDetailsTable) {
      const detailColumns = columns.flatMap((c, i) =>
        c.kind === 'ms' ? [{ entry: c.entry, item: itemById.get(c.entry.id), order: i + 1 }] : []
      );
      if (detailColumns.length === 0) {
        return (
          <div className="mss-empty mss-empty--panel">
            <p className="mss-empty__title">Add a manuscript</p>
            <p className="mss-empty__text">Details compare the manuscripts’ catalogue records. Use + on a manuscript above to add it.</p>
          </div>
        );
      }
      return (
        <DetailsComparison
          columns={detailColumns}
          sectionText={sectionText}
          note={columns.some(c => c.kind === 'ed') ? 'Edition texts aren’t part of the catalogue comparison.' : undefined}
        />
      );
    }
    if (columns.length === 0) {
      return (
        <div className="mss-empty mss-empty--panel">
          <p className="mss-empty__title">{ready && catalog ? 'Choose a manuscript' : 'Loading…'}</p>
          {ready && catalog && <p className="mss-empty__text">Pick a manuscript or a text from the row above.</p>}
        </div>
      );
    }

    const visible = expandedKey ? columns.filter(c => c.key === expandedKey) : columns;
    const showAddHint = mode === 'compare' && columns.length === 1 && !expandedKey;
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
                onClick={() => {
                  setExpanded(null);
                  setMobileTab(column.key);
                }}
              >
                {columnLabel(column)}
              </button>
            ))}
          </div>
        )}
        <div className="mss-columns" style={{ '--mss-cols': visible.length + (showAddHint ? 1 : 0) } as React.CSSProperties}>
          {visible.map(column => (
            <div key={column.key} className={`mss-column ${activeTab === column.key ? 'mss-column--active' : ''}`}>
              {renderColumn(column, columns.indexOf(column))}
            </div>
          ))}
          {showAddHint && (
            <div className="mss-column mss-column--hint">
              <div className="mss-empty mss-empty--panel">
                <p className="mss-empty__title">Add something to compare</p>
                <p className="mss-empty__text">Use + on a manuscript or an edition text above to set it beside this one.</p>
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
        manuscripts={manuscriptCards}
        editions={editionCards}
        manuscriptCount={items.length}
        mode={mode}
        canSingle={canSingle}
        shownKeys={columns.map(c => c.key)}
        compareKeys={columns.map(c => c.key)}
        sectionText={sectionText}
        loading={!ready && !loadError}
        open={pickerOpen}
        notice={notice}
        onToggleOpen={() => setPickerOpen(o => !o)}
        onShow={show}
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

/** The manuscript section a dialog opens on. All of Raḍī's introduction is recorded under 0.1. */
export function comparisonSection(content: { sermonNumber?: string | null } | null | undefined, contentType: ManuscriptComparisonModalProps['contentType']) {
  if (contentType === 'radis') return '0.1';
  const raw = (content?.sermonNumber || '').trim();
  // Some editions file a section under another prefix (Milani's Oration 1 is "4.1");
  // manuscripts use 1/2/3 for orations, letters and sayings
  const prefix = ({ orations: '1', letters: '2', sayings: '3' } as Record<string, string>)[contentType];
  const number = raw.split('.')[1];
  return prefix && number ? `${prefix}.${number}` : raw;
}

export function ManuscriptComparisonModal({ isOpen, onClose, content, contentType }: ManuscriptComparisonModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // Callers pass a new onClose on every render; read the latest without re-running the setup
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => setMounted(true), []);

  const source = content as EditionTextSource;
  const section = comparisonSection(source, contentType);
  const active = isOpen && mounted && !!section;

  // Modal behaviour: lock page scroll, close on Escape, move focus in, keep the rest of the page
  // out of reach, and return focus to whatever opened the dialog
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = panelRef.current?.closest('.mss-modal');
    const others = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== dialog && !el.hasAttribute('inert')
    );
    others.forEach(el => el.setAttribute('inert', ''));
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      others.forEach(el => el.removeAttribute('inert'));
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [active]);

  if (!active) return null;

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
      <div className="mss-modal__panel" ref={panelRef} tabIndex={-1}>
        <ManuscriptStudio
          variant="modal"
          section={section}
          sectionTitle={sectionTitle}
          introTextLabel={contentType === 'conclusion' ? 'Conclusion text' : 'Introduction text'}
          modes={['edition', 'compare']}
          initialMode="edition"
          // Open on the edition being read
          initialEdition={getPostEditionTitles(source)[0]}
          textSource={source}
          title={heading}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
}

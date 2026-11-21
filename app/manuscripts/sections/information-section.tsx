'use client';
import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ManuscriptInformation from '../information/manuscript-information';

/** Links to /manuscripts#manuscript-information (the viewer's details panel, the collection heading) open the section */
const ANCHOR = 'manuscript-information';

/** The collection above has rendered its final grid (or its error), so it won't push this section down again */
const collectionSettled = () => !!document.querySelector('[data-collection="settled"]');

/** Every manuscript's catalogue details, folded away until the reader asks for them */
export default function ManuscriptInformationSection() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const panelId = `${id}panel`;
  const titleId = `${id}title`;
  const descId = `${id}desc`;

  useEffect(() => {
    // Stops keeping the section in view. Once that is over, the fragment is dropped from the URL so that
    // Back, Forward and reload don't reopen the section and pull the page to it again.
    let release = (_finished: boolean) => {};

    const openFromHash = () => {
      if (window.location.hash !== `#${ANCHOR}`) return;
      setOpen(true);
      release(false);

      // The collection above loads after this and pushes the section down. Keep the section in place until
      // the collection has settled, the reader moves the page themselves (wheel, keys, touch, a click or the
      // scrollbar), or 20 seconds pass.
      let pinnedTop: number | null = null;
      const pin = () => {
        const el = rootRef.current;
        if (!el) return;
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
        pinnedTop = el.getBoundingClientRect().top;
        if (collectionSettled()) release(true);
      };
      const onInput = () => release(true);
      const onScroll = () => {
        const el = rootRef.current;
        if (el && pinnedTop !== null && Math.abs(el.getBoundingClientRect().top - pinnedTop) > 4) release(true);
      };
      const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
      const observer = new ResizeObserver(pin); // runs once on observe, then whenever the page's height changes
      const timer = window.setTimeout(() => release(true), 20000);

      release = (finished: boolean) => {
        observer.disconnect();
        window.clearTimeout(timer);
        inputs.forEach(type => window.removeEventListener(type, onInput));
        window.removeEventListener('scroll', onScroll);
        release = () => {};
        if (finished && window.location.hash === `#${ANCHOR}`) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      };
      inputs.forEach(type => window.addEventListener(type, onInput, { passive: true }));
      window.addEventListener('scroll', onScroll, { passive: true });
      observer.observe(document.body);
    };

    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => {
      window.removeEventListener('hashchange', openFromHash);
      release(false);
    };
  }, []);

  return (
    <div id={ANCHOR} ref={rootRef} className={`ms-hub-details ${open ? 'ms-hub-details--open' : ''}`}>
      <h3 className="ms-hub-details__heading">
        <button
          type="button"
          className="ms-hub-details__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-labelledby={titleId}
          aria-describedby={descId}
          onClick={() => setOpen(o => !o)}
        >
          <span className="ms-hub-details__text">
            <span id={titleId} className="ms-hub-details__title">Manuscript information</span>
            <span id={descId} className="ms-hub-details__desc">
              Holding library, date, sigla, catalogue number, scribe and completeness of each manuscript.
            </span>
          </span>
          <span className="ms-hub-details__action" aria-hidden="true">
            {open ? 'Hide' : 'Show'} <ChevronDown />
          </span>
        </button>
      </h3>
      <div id={panelId} className="ms-hub-details__panel" hidden={!open}>
        {open && <ManuscriptInformation embedded />}
      </div>
    </div>
  );
}
